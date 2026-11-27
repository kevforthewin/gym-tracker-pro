/**
 * Einmalige Korrekturen an bereits importierten Daten (idempotent, laufen beim Start).
 */
import { all, patch } from './db';

/** „Multi Pec“ wurde früher als Butterfly importiert – sie wird aber als Seitheben-Maschine genutzt. */
export async function repairMultiPec(): Promise<number> {
  const machines = (await all('gymMachines')).filter((m) => m.exerciseId === 'butterfly' && /multi[\s-]?pec/i.test(m.label));
  if (!machines.length) return 0;
  const ids = new Set(machines.map((m) => m.id));
  for (const m of machines) await patch('gymMachines', m.id, { exerciseId: 'lateral-raise-machine' });
  // im Gym jetzt vorhanden → dort nicht mehr ausgeblendet lassen
  const gyms = new Set(machines.map((m) => m.gymId));
  for (const p of await all('planDayExercises'))
    if (p.exerciseId === 'lateral-raise-machine' && p.skipGyms?.some((g) => gyms.has(g)))
      await patch('planDayExercises', p.id, { skipGyms: p.skipGyms.filter((g) => !gyms.has(g)) });
  let n = 0;
  for (const s of await all('sets'))
    if (s.machineId && ids.has(s.machineId) && s.exerciseId === 'butterfly') {
      await patch('sets', s.id, { exerciseId: 'lateral-raise-machine' });
      n++;
    }
  return n;
}
