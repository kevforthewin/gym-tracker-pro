/** Pläne aus Vorlagen anlegen und Plätze im Gym auflösen. */
import { repsFor, resolveSlot, slotById, TEMPLATES } from '../domain/slots';
import { planDuplicates } from '../domain/planDedupe';
import { nextPlanDay } from '../domain/planRotation';
import { all, db, getMeta, patch, remove, save, setMeta } from './db';
import { isDeloadWeek, nextDeloadWeek, type DeloadOverride } from '../domain/deload';
import { weekStart } from '../domain/insights';
import type { SharedPlan } from '../domain/planShare';

export async function createPlanFromTemplate(templateId: string, frequency?: number) {
  const t = TEMPLATES.find((x) => x.id === templateId);
  if (!t) throw new Error('Vorlage nicht gefunden');
  const freq = frequency ?? t.frequencies[0];
  const plans = await all('plans');
  const name = t.frequencies.length > 1 ? `${t.name} (${freq}×/Woche)` : t.name;
  const plan = await save('plans', { name, order: plans.length });
  for (const [i, d] of t.days.entries()) {
    const day = await save('planDays', { planId: plan.id, name: d.name, order: i });
    for (const [k, slotId] of d.slots.entries()) {
      const slot = slotById(slotId)!;
      await save('planDayExercises', { planDayId: day.id, exerciseId: slot.alternatives[0], slotId, order: k, ...repsFor(slot) });
    }
  }
  await setMeta('weeklyGoal', freq);
  return plan;
}

/** Übung für einen Platz in einem Gym (zuletzt dort gemachte Alternative bevorzugt). */
export async function resolveSlotInGym(slotId: string, gymId: string): Promise<string | undefined> {
  const slot = slotById(slotId);
  if (!slot) return undefined;
  const [machines, exercises] = await Promise.all([db.gymMachines.where('gymId').equals(gymId).toArray(), all('exercises')]);
  const available = new Set(machines.filter((m) => !m.deletedAt).map((m) => m.exerciseId));
  const free = new Set(exercises.filter((e) => e.freeWeight).map((e) => e.id));
  // zuletzt in diesem Gym gemachte Alternative
  const sessions = new Map((await db.sessions.where('gymId').equals(gymId).toArray()).filter((s) => !s.deletedAt).map((s) => [s.id, s.startedAt]));
  let last: { ex: string; ts: number } | undefined;
  for (const ex of slot.alternatives) {
    for (const s of await db.sets.where('exerciseId').equals(ex).toArray()) {
      const ts = sessions.get(s.sessionId);
      if (ts !== undefined && !s.deletedAt && (!last || ts > last.ts)) last = { ex, ts };
    }
  }
  return resolveSlot(slot, available, free, last?.ex);
}

/** Nächster Trainingstag: Tag nach dem zuletzt trainierten Tag desselben Plans. */
export async function suggestNextDay(): Promise<string | undefined> {
  const [sessions, days] = await Promise.all([all('sessions'), all('planDays')]);
  const last = sessions.filter((s) => s.planDayId && days.some((d) => d.id === s.planDayId)).sort((a, b) => b.startedAt - a.startedAt)[0];
  if (!last) return undefined;
  const lastDay = days.find((d) => d.id === last.planDayId)!;
  return nextPlanDay(
    days.filter((d) => d.planId === lastDay.planId),
    lastDay.id,
  )?.id;
}

/** Aktiver Plan: Plan des zuletzt trainierten Plantags, sonst der erste Plan */
export async function activePlan() {
  const [plans, days, sessions] = await Promise.all([all('plans'), all('planDays'), all('sessions')]);
  const last = sessions.filter((s) => s.planDayId).sort((a, b) => b.startedAt - a.startedAt)[0];
  const planId = days.find((d) => d.id === last?.planDayId)?.planId;
  return plans.find((p) => p.id === planId) ?? [...plans].sort((a, b) => a.order - b.order)[0];
}

/** Beginn des Plans = erstes Training mit einem Tag dieses Plans */
export async function planStart(planId: string): Promise<number | undefined> {
  const dayIds = new Set((await all('planDays')).filter((d) => d.planId === planId).map((d) => d.id));
  const starts = (await all('sessions')).filter((s) => s.planDayId && dayIds.has(s.planDayId)).map((s) => s.startedAt);
  return starts.length ? Math.min(...starts) : undefined;
}

export interface DeloadState {
  active: boolean;
  manual: boolean;
  plan?: { id: string; name: string; deloadEvery?: number };
  next?: number;
}

/** Ist diese Woche Deload? (automatisch nach Plan-Intervall oder manuell gesetzt) */
export async function deloadState(now = Date.now()): Promise<DeloadState> {
  const plan = await activePlan();
  const override = (await getMeta<DeloadOverride>('deloadOverride')) ?? null;
  const start = plan ? await planStart(plan.id) : undefined;
  const manual = !!override && override.week === weekStart(now);
  return {
    active: isDeloadWeek({ every: plan?.deloadEvery, planStart: start, override, now }),
    manual,
    plan: plan && { id: plan.id, name: plan.name, deloadEvery: plan.deloadEvery },
    next: nextDeloadWeek(plan?.deloadEvery, start ?? now, now),
  };
}

/** Diese Woche manuell als Deload markieren / normal trainieren */
export async function setDeloadThisWeek(on: boolean | null, now = Date.now()) {
  if (on === null) await setMeta('deloadOverride', null);
  else await setMeta('deloadOverride', { week: weekStart(now), on } satisfies DeloadOverride);
}

/** Plan in das Teilen-Format umwandeln */
export async function exportPlan(planId: string): Promise<SharedPlan> {
  const [plan, days, pdes, exercises, perWeek] = await Promise.all([
    db.plans.get(planId),
    all('planDays'),
    all('planDayExercises'),
    all('exercises'),
    getMeta<number>('weeklyGoal'),
  ]);
  if (!plan) throw new Error('Plan nicht gefunden');
  const myDays = days.filter((d) => d.planId === planId).sort((a, b) => a.order - b.order);
  const used = new Set<string>();
  const out: SharedPlan = {
    v: 1,
    name: plan.name,
    perWeek,
    deloadEvery: plan.deloadEvery,
    days: myDays.map((d) => ({
      n: d.name,
      x: pdes
        .filter((p) => p.planDayId === d.id)
        .sort((a, b) => a.order - b.order)
        .map((p) => {
          used.add(p.exerciseId);
          return { s: p.slotId, e: p.exerciseId, k: p.sets, a: p.repMin, b: p.repMax };
        }),
    })),
  };
  // eigene Übungen mitgeben (Katalog-Übungen kennt jede App)
  const custom = exercises.filter((e) => used.has(e.id) && e.createdBy);
  if (custom.length) out.ex = custom.map(({ id, name, type, muscleGroup, split, freeWeight }) => ({ id, name, type, muscleGroup, split, freeWeight }));
  return out;
}

/** Geteilten Plan als eigenen Plan anlegen */
export async function importSharedPlan(p: SharedPlan) {
  const known = new Set((await all('exercises')).map((e) => e.id));
  for (const e of p.ex ?? []) if (!known.has(e.id)) await save('exercises', e);
  const exists = new Set((await all('exercises')).map((e) => e.id));
  const plan = await save('plans', { name: p.name, order: (await all('plans')).length, deloadEvery: p.deloadEvery });
  for (const [i, d] of p.days.entries()) {
    const day = await save('planDays', { planId: plan.id, name: d.n, order: i });
    for (const [k, it] of d.x.entries()) {
      const slot = slotById(it.s);
      const exerciseId = exists.has(it.e) ? it.e : slot?.alternatives[0];
      if (!exerciseId) continue; // unbekannte Übung ohne Platz → weglassen
      await save('planDayExercises', { planDayId: day.id, exerciseId, slotId: slot?.id, order: k, sets: it.k, repMin: it.a, repMax: it.b });
    }
  }
  if (p.perWeek) await setMeta('weeklyGoal', p.perWeek);
  return plan;
}

/** Doppelte Übungen pro Trainingstag zusammenführen (z. B. aus einem importierten Plan für mehrere Gyms) */
export async function dedupePlanEntries() {
  const { remove: rm, update } = planDuplicates(await all('planDayExercises'));
  for (const u of update) await patch('planDayExercises', u.id, { sets: u.sets, skipGyms: u.skipGyms });
  for (const id of rm) await remove('planDayExercises', id);
  return rm.length;
}
