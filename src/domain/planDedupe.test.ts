import { describe, expect, it } from 'vitest';
import { planDuplicates } from './planDedupe';

const r = (id: string, exerciseId: string, order: number, extra = {}) => ({ id, planDayId: 'pull', exerciseId, order, sets: 3, ...extra });

describe('planDuplicates', () => {
  it('führt gleiche Übungen eines Tages zusammen', () => {
    const out = planDuplicates([r('a', 'lat', 0), r('b', 'row', 1), r('c', 'lat', 3, { sets: 4 })]);
    expect(out.remove).toEqual(['c']);
    expect(out.update).toEqual([{ id: 'a', sets: 4, skipGyms: undefined }]);
  });
  it('ausgeblendet nur, wo alle Einträge ausgeblendet waren', () => {
    const out = planDuplicates([r('a', 'lat', 0, { skipGyms: ['evo'] }), r('c', 'lat', 1, { skipGyms: ['evo', 'iron'] })]);
    expect(out.update).toEqual([]);
    expect(planDuplicates([r('a', 'lat', 0, { skipGyms: ['evo'] }), r('c', 'lat', 1)]).update).toEqual([{ id: 'a', sets: 3, skipGyms: undefined }]);
  });
  it('lässt Vorlagen-Plätze und andere Tage in Ruhe', () => {
    expect(planDuplicates([r('a', 'lat', 0), { ...r('b', 'lat', 1), planDayId: 'x' }, r('c', 'lat', 2, { slotId: 'v-pull' })]).remove).toEqual([]);
  });
});
