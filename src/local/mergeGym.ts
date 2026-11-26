/**
 * Eigenes Gym (z. B. aus dem Import) mit einem Katalog-Gym zusammenführen:
 * Geräte, Trainings und Cardio ziehen um, die Verknüpfung „meine Gyms“ wechselt, das alte Gym wird entfernt.
 */
import type { Gym } from '../model/types';
import { all, db, getMeta, patch, remove, setMeta } from './db';
import { addMyGym } from './queries';

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/köln|koeln|cologne|gmbh|fitnessstudio|studio|gym|fitness|club/g, ' ')
    .replace(/[^a-z0-9äöüß]+/g, '');

/** Katalog-Gyms, die zum Namen passen (beste zuerst) */
export async function mergeSuggestions(gym: Gym): Promise<Gym[]> {
  const n = norm(gym.name);
  const catalog = (await all('gyms')).filter((g) => g.id !== gym.id && !g.createdBy);
  if (!n) return [];
  return catalog
    .map((g) => {
      const m = norm(g.name);
      const score = m === n ? 3 : m.includes(n) || n.includes(m) ? 2 : (gym.chain && g.chain === gym.chain) || g.name.toLowerCase().startsWith(gym.name.toLowerCase().split(/\s/)[0]) ? 1 : 0;
      return { g, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.g.name.localeCompare(b.g.name, 'de'))
    .map((x) => x.g);
}

export async function mergeGymInto(fromId: string, toId: string) {
  if (fromId === toId) return { machines: 0, sessions: 0 };
  const [machines, sessions, cardio, links] = await Promise.all([
    db.gymMachines.where('gymId').equals(fromId).toArray(),
    db.sessions.where('gymId').equals(fromId).toArray(),
    all('cardio'),
    all('userGyms'),
  ]);
  for (const m of machines.filter((x) => !x.deletedAt)) await patch('gymMachines', m.id, { gymId: toId });
  for (const s of sessions.filter((x) => !x.deletedAt)) await patch('sessions', s.id, { gymId: toId });
  for (const c of cardio.filter((x) => x.gymId === fromId)) await patch('cardio', c.id, { gymId: toId });
  await addMyGym(toId);
  for (const l of links.filter((x) => x.gymId === fromId)) await remove('userGyms', l.id);
  const old = await db.gyms.get(fromId);
  if (old?.createdBy) await remove('gyms', fromId);
  const last = await getMeta<{ gymId: string; dayId: string }>('lastStart');
  if (last?.gymId === fromId) await setMeta('lastStart', { ...last, gymId: toId });
  return { machines: machines.length, sessions: sessions.length };
}
