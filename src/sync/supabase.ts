/**
 * Supabase-Anbindung. Ohne VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY läuft die App im lokalen Modus.
 * Der anon key ist bewusst öffentlich (steckt in jeder Supabase-Web-App) – geschützt wird über RLS.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { RemoteApi } from './engine';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' } }) : null;

export const cloudEnabled = !!supabase;

export function supabaseRemote(client: SupabaseClient): RemoteApi {
  return {
    async upsert(table, rows) {
      const { error } = await client.from(table).upsert(rows, { onConflict: 'id' });
      if (error) throw new Error(error.message);
    },
    async pull(table, since, limit) {
      let q = client.from(table).select('*').order('server_updated_at', { ascending: true }).limit(limit);
      if (since) q = q.gt('server_updated_at', since);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  };
}
