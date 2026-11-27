/**
 * Doppelte Übungen in einem Trainingstag zusammenführen.
 * Typischer Fall: Ein alter Plan für zwei Gyms hatte „Latzug“ (Gym A) und „Latzug Matrix“ (Gym B).
 * Beides ist dieselbe Übung – das Gerät wählt jedes Gym selbst. Behalten wird der erste Eintrag,
 * mit den meisten Sätzen und nur dort ausgeblendet, wo alle Einträge ausgeblendet waren.
 */
export interface DedupeRow {
  id: string;
  planDayId: string;
  exerciseId: string;
  order: number;
  sets: number;
  slotId?: string;
  skipGyms?: string[];
}

export function planDuplicates<T extends DedupeRow>(rows: T[]): { remove: string[]; update: { id: string; sets: number; skipGyms?: string[] }[] } {
  const groups = new Map<string, T[]>();
  for (const r of [...rows].sort((a, b) => a.order - b.order)) {
    if (r.slotId) continue; // Vorlagen-Plätze bleiben, wie sie sind
    const k = `${r.planDayId}|${r.exerciseId}`;
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }
  const remove: string[] = [];
  const update: { id: string; sets: number; skipGyms?: string[] }[] = [];
  for (const g of groups.values()) {
    if (g.length < 2) continue;
    const [keep, ...rest] = g;
    const sets = Math.max(...g.map((r) => r.sets));
    const skip = g.map((r) => new Set(r.skipGyms ?? [])).reduce((a, b) => new Set([...a].filter((x) => b.has(x))));
    const skipGyms = skip.size ? [...skip] : undefined;
    if (sets !== keep.sets || (keep.skipGyms ?? []).length !== skip.size) update.push({ id: keep.id, sets, skipGyms });
    remove.push(...rest.map((r) => r.id));
  }
  return { remove, update };
}
