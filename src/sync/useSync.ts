/**
 * Hält Login-Zustand und stößt den Sync an: beim Start, bei Netz-Rückkehr, nach lokalen Änderungen
 * (entprellt) und alle 60 s.
 */
import { useEffect, useSyncExternalStore } from 'react';
import type { Session as AuthSession } from '@supabase/supabase-js';
import { db, getMeta, LOCAL_USER, setMeta } from '../local/db';
import { adoptLocalData, isNetworkError, sync } from './engine';
import { supabase, supabaseRemote } from './supabase';

export type SyncState = 'local' | 'idle' | 'syncing' | 'offline' | 'error';

interface Store {
  auth: AuthSession | null;
  state: SyncState;
  error?: string;
  lastSyncAt?: number;
}

let store: Store = { auth: null, state: supabase ? 'idle' : 'local' };
const listeners = new Set<() => void>();
const set = (s: Partial<Store>) => {
  store = { ...store, ...s };
  listeners.forEach((l) => l());
};
export const useSyncStore = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => store,
  );

let running: Promise<void> | null = null;
export function runSync(): Promise<void> {
  if (!supabase || !store.auth) return Promise.resolve();
  if (running) return running;
  running = (async () => {
    set({ state: 'syncing', error: undefined });
    try {
      await sync(supabaseRemote(supabase));
      set({ state: 'idle', lastSyncAt: Date.now() });
    } catch (e) {
      set(isNetworkError(e) || !navigator.onLine ? { state: 'offline' } : { state: 'error', error: (e as Error).message });
    } finally {
      running = null;
    }
  })();
  return running;
}

async function onAuth(session: AuthSession | null) {
  set({ auth: session });
  if (!session) return;
  const prev = await getMeta<string>('userId');
  if (!prev || prev === LOCAL_USER) await adoptLocalData(session.user.id);
  else if (prev !== session.user.id) {
    // anderes Konto auf diesem Gerät: lokale Daten des alten Kontos verwerfen
    await clearLocalUserData();
    await setMeta('userId', session.user.id);
  }
  await runSync();
}

export async function clearLocalUserData() {
  await db.transaction('rw', db.tables, async () => {
    for (const t of db.tables) {
      if (['manufacturers', 'equipmentModels', 'exercises', 'meta'].includes(t.name)) continue;
      await t.clear();
    }
    const keys = (await db.meta.toCollection().primaryKeys()) as string[];
    await db.meta.bulkDelete(keys.filter((k) => k.startsWith('pull:')));
  });
}

/** Einmal in App.tsx einhängen */
export function useSyncBootstrap() {
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => onAuth(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user.id !== store.auth?.user.id) onAuth(session);
      else set({ auth: session });
    });
    let t: ReturnType<typeof setTimeout> | undefined;
    const soon = () => {
      clearTimeout(t);
      t = setTimeout(runSync, 2000);
    };
    const hook = () => soon();
    db.outbox.hook('creating', hook);
    window.addEventListener('online', runSync);
    const iv = setInterval(runSync, 60_000);
    return () => {
      sub.subscription.unsubscribe();
      db.outbox.hook('creating').unsubscribe(hook);
      window.removeEventListener('online', runSync);
      clearInterval(iv);
      clearTimeout(t);
    };
  }, []);
}

export async function signInWithEmail(email: string) {
  if (!supabase) throw new Error('Cloud nicht konfiguriert');
  const redirect = window.location.origin + window.location.pathname;
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect } });
  if (error) throw new Error(error.message);
}

/**
 * Code aus der E-Mail eingeben (wichtig für die installierte iPhone-App: der Link in der Mail
 * öffnet Safari, nicht die App – der 6-stellige Code funktioniert überall).
 */
export async function verifyEmailCode(email: string, token: string) {
  if (!supabase) throw new Error('Cloud nicht konfiguriert');
  const { error } = await supabase.auth.verifyOtp({ email, token: token.trim(), type: 'email' });
  if (error) throw new Error(error.message);
}

export async function signOut() {
  if (!supabase) return;
  await runSync();
  await supabase.auth.signOut();
  await clearLocalUserData();
  await setMeta('userId', LOCAL_USER);
  set({ auth: null });
}
