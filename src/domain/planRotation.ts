export interface OrderedDay {
  id: string;
  order: number;
}

/** Der Tag nach dem zuletzt trainierten (zyklisch); ohne Historie der erste. */
export function nextPlanDay<T extends OrderedDay>(days: T[], lastDayId?: string): T | undefined {
  if (days.length === 0) return undefined;
  const sorted = [...days].sort((a, b) => a.order - b.order);
  const idx = lastDayId ? sorted.findIndex((d) => d.id === lastDayId) : -1;
  return sorted[(idx + 1) % sorted.length];
}
