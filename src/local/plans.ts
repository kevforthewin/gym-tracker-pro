/** Pläne aus Vorlagen anlegen und Plätze im Gym auflösen. */
import { repsFor, resolveSlot, slotById, TEMPLATES } from '../domain/slots';
import { nextPlanDay } from '../domain/planRotation';
import { all, db, save, setMeta } from './db';

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
