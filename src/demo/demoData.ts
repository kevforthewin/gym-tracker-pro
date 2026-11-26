/**
 * Beispieldaten zum Ausprobieren (Rundgang). Werden direkt lokal gespeichert – ohne Outbox,
 * also nie synchronisiert – und lassen sich mit einem Tipp wieder entfernen.
 */
import { db, getMeta, setMeta } from '../local/db';
import type { CardioEntry, Gym, GymMachine, Plan, PlanDay, PlanDayExercise, Session, SetEntry, UserGym } from '../model/types';
import { isoOf } from '../domain/dashboard';

const DEMO_USER = 'demo';
const KEY = 'demoIds';
type Ids = Record<string, string[]>;

export const hasDemo = async () => !!(await getMeta<Ids>(KEY));

export async function loadDemo(now = Date.now()) {
  if (await hasDemo()) return;
  const t = 0;
  const gyms: Gym[] = [
    { id: 'demo-gym-a', name: 'Beispiel-Gym Mitte', chain: 'Demo', city: 'Berlin', updatedAt: t },
    { id: 'demo-gym-b', name: 'Beispiel-Gym Nord', chain: 'Demo', city: 'Berlin', updatedAt: t },
  ];
  const m = (id: string, gymId: string, exerciseId: string, label: string, modelId?: string, step = 2.5): GymMachine => ({
    id,
    gymId,
    exerciseId,
    label,
    modelId,
    weightStepKg: step,
    updatedAt: t,
    createdBy: DEMO_USER,
  });
  const machines: GymMachine[] = [
    m('demo-a-cp', 'demo-gym-a', 'chest-press', 'Brustpresse', 'hoist--rs-2301'),
    m('demo-a-lat', 'demo-gym-a', 'lat-pulldown', 'Latzug', 'matrix--g7-s33'),
    m('demo-a-row', 'demo-gym-a', 'seated-row', 'Rudern', 'matrix--g7-s34'),
    m('demo-a-lp', 'demo-gym-a', 'leg-press', 'Beinpresse', 'gym80--pure-kraft--leg-press', 5),
    m('demo-a-le', 'demo-gym-a', 'leg-extension', 'Beinstrecker', 'matrix--g7-s71'),
    m('demo-a-sp', 'demo-gym-a', 'shoulder-press', 'Schulterpresse', 'hoist--rs-2501'),
    m('demo-b-cp', 'demo-gym-b', 'chest-press', 'Brustpresse (hinten)', 'hoist--rs-2301'),
    m('demo-b-lat', 'demo-gym-b', 'lat-pulldown', 'Latzug', 'hammer-strength--select-lat-pulldown'),
    m('demo-b-lp', 'demo-gym-b', 'leg-press', 'Beinpresse', 'hammer-strength--select-seated-leg-press', 5),
  ];
  const userGyms: UserGym[] = gyms.map((g) => ({ id: `demo-ug-${g.id}`, gymId: g.id, userId: DEMO_USER, updatedAt: t }));
  const plan: Plan = { id: 'demo-plan', name: 'Beispiel: Push / Pull / Legs', order: 99, userId: DEMO_USER, updatedAt: t };
  const days: PlanDay[] = ['Push', 'Pull', 'Legs'].map((name, i) => ({ id: `demo-day-${i}`, planId: plan.id, name, order: i, userId: DEMO_USER, updatedAt: t }));
  const dayEx: [number, string][] = [
    [0, 'chest-press'],
    [0, 'shoulder-press'],
    [0, 'db-bench-press'],
    [1, 'lat-pulldown'],
    [1, 'seated-row'],
    [2, 'leg-press'],
    [2, 'leg-extension'],
  ];
  const pdes: PlanDayExercise[] = dayEx.map(([d, ex], i) => ({
    id: `demo-pde-${i}`,
    planDayId: `demo-day-${d}`,
    exerciseId: ex,
    order: i,
    sets: 3,
    repMin: 8,
    repMax: 12,
    userId: DEMO_USER,
    updatedAt: t,
  }));

  // 8 Wochen, 3× pro Woche, abwechselnd Gym A / B; Gewichte steigen langsam
  const base: Record<string, number> = { 'chest-press': 45, 'shoulder-press': 30, 'db-bench-press': 20, 'lat-pulldown': 50, 'seated-row': 45, 'leg-press': 110, 'leg-extension': 40 };
  const sessions: Session[] = [];
  const sets: SetEntry[] = [];
  const DAY = 86400000;
  for (let w = 0; w < 8; w++)
    for (let k = 0; k < 3; k++) {
      const dayIdx = (w * 3 + k) % 3;
      const gymId = (w * 3 + k) % 4 === 3 ? 'demo-gym-b' : 'demo-gym-a';
      const startedAt = now - (56 - w * 7 - k * 2) * DAY + 18 * 3600000;
      const sid = `demo-s-${w}-${k}`;
      sessions.push({ id: sid, gymId, planDayId: `demo-day-${dayIdx}`, startedAt, finishedAt: startedAt + 3600000, userId: DEMO_USER, updatedAt: t });
      let n = 0;
      for (const [d, ex] of dayEx) {
        if (d !== dayIdx) continue;
        const machine = machines.find((x) => x.gymId === gymId && x.exerciseId === ex);
        if (!machine && ex !== 'db-bench-press') continue;
        const step = machine?.weightStepKg ?? 2;
        const weight = base[ex] + Math.floor(w / 2) * step;
        const reps = [8 + (w % 2) * 3, 8 + (w % 2) * 2, 8 + (w % 2)];
        reps.forEach((r, i) =>
          sets.push({
            id: `${sid}-${ex}-${i}`,
            sessionId: sid,
            machineId: machine?.id,
            exerciseId: ex,
            setIndex: ++n,
            weightKg: weight,
            reps: r,
            isWarmup: false,
            createdAt: startedAt + n * 120000,
            userId: DEMO_USER,
            updatedAt: t,
          }),
        );
      }
    }

  // Cardio: jedes 2. Training mit 10 min Laufband zum Aufwärmen, dazu 1× pro Woche Laufen draußen
  const cardio: CardioEntry[] = [];
  sessions.forEach((s, i) => {
    if (i % 2 === 0)
      cardio.push({ id: `demo-c-${s.id}`, date: isoOf(s.startedAt), kind: 'treadmill', durationMin: 10, distanceKm: 1.4, sessionId: s.id, gymId: s.gymId, createdAt: s.startedAt, userId: DEMO_USER, updatedAt: t });
  });
  for (let w = 0; w < 8; w++) {
    const ts = now - (54 - w * 7) * DAY + 8 * 3600000;
    cardio.push({ id: `demo-run-${w}`, date: isoOf(ts), kind: 'run', durationMin: 28 + w, distanceKm: 4.5 + w * 0.2, createdAt: ts, userId: DEMO_USER, updatedAt: t });
  }

  await db.transaction('rw', [db.gyms, db.gymMachines, db.userGyms, db.plans, db.planDays, db.planDayExercises, db.sessions, db.sets, db.cardio, db.meta], async () => {
    await db.gyms.bulkPut(gyms);
    await db.gymMachines.bulkPut(machines);
    await db.userGyms.bulkPut(userGyms);
    await db.plans.put(plan);
    await db.planDays.bulkPut(days);
    await db.planDayExercises.bulkPut(pdes);
    await db.sessions.bulkPut(sessions);
    await db.sets.bulkPut(sets);
    await db.cardio.bulkPut(cardio);
    const ids: Ids = {
      cardio: cardio.map((x) => x.id),
      gyms: gyms.map((x) => x.id),
      gymMachines: machines.map((x) => x.id),
      userGyms: userGyms.map((x) => x.id),
      plans: [plan.id],
      planDays: days.map((x) => x.id),
      planDayExercises: pdes.map((x) => x.id),
      sessions: sessions.map((x) => x.id),
      sets: sets.map((x) => x.id),
    };
    await setMeta(KEY, ids);
  });
}

/** Beispieldaten entfernen – inklusive allem, was du im Beispiel-Gym selbst eingetragen hast. */
export async function removeDemo() {
  const ids = await getMeta<Ids>(KEY);
  if (!ids) return;
  const demoSessions = new Set([...ids.sessions, ...(await db.sessions.where('gymId').anyOf(ids.gyms).primaryKeys())]);
  const extraSets = await db.sets.where('sessionId').anyOf([...demoSessions]).primaryKeys();
  const extraCardio = (await db.cardio.toArray()).filter((c) => c.sessionId && demoSessions.has(c.sessionId)).map((c) => c.id);
  await db.transaction('rw', [db.gyms, db.gymMachines, db.userGyms, db.plans, db.planDays, db.planDayExercises, db.sessions, db.sets, db.cardio, db.meta, db.outbox], async () => {
    for (const [table, list] of Object.entries(ids)) await db.table(table).bulkDelete(list);
    await db.sessions.bulkDelete([...demoSessions]);
    await db.sets.bulkDelete(extraSets);
    await db.cardio.bulkDelete(extraCardio);
    const gone = new Set<string>([...Object.values(ids).flat(), ...demoSessions, ...extraSets.map(String), ...extraCardio]);
    const queued = await db.outbox.toArray();
    await db.outbox.bulkDelete(queued.filter((e) => gone.has(e.rowId)).map((e) => e.seq!));
    await db.meta.delete(KEY);
  });
}
