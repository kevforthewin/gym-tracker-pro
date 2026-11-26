import { describe, expect, it } from 'vitest';
import { CATALOG_EXERCISES } from '../catalog/catalog';
import { repsFor, resolveSlot, slotById, SLOTS, TEMPLATES } from './slots';

describe('Bewegungsplätze und Vorlagen', () => {
  it('alle Alternativen und Plätze existieren', () => {
    const ex = new Set(CATALOG_EXERCISES.map((e) => e.id));
    for (const s of SLOTS) for (const a of s.alternatives) expect(ex.has(a), `${s.id}: ${a}`).toBe(true);
    for (const t of TEMPLATES) for (const d of t.days) for (const s of d.slots) expect(slotById(s), `${t.id}/${d.name}: ${s}`).toBeDefined();
  });

  it('Sätze/Wdh. nach Übungstyp', () => {
    expect(repsFor(slotById('horizontal-push')!)).toEqual({ sets: 3, repMin: 6, repMax: 10 });
    expect(repsFor(slotById('biceps')!)).toEqual({ sets: 3, repMin: 10, repMax: 15 });
  });

  it('Auflösung im Gym: zuletzt genutzt > Gerät vorhanden > Freihantel', () => {
    const slot = slotById('horizontal-push')!;
    const free = new Set(['bench-press', 'db-bench-press']);
    expect(resolveSlot(slot, new Set(['chest-press']), free)).toBe('chest-press');
    expect(resolveSlot(slot, new Set(), free)).toBe('bench-press');
    expect(resolveSlot(slot, new Set(['chest-press']), free, 'db-bench-press')).toBe('db-bench-press');
    // zuletzt genutzt, aber im Gym nicht (mehr) vorhanden → normale Reihenfolge
    const lat = slotById('vertical-pull')!;
    expect(resolveSlot(lat, new Set(['assisted-pullup']), new Set(['pullup']), 'lat-pulldown')).toBe('assisted-pullup');
  });
});
