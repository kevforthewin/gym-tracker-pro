import { describe, expect, it } from 'vitest';
import { hiddenUnits, type VisUnit } from './sessionVisibility';

const u = (key: string, exerciseId: string, extra: Partial<VisUnit> = {}): VisUnit => ({
  key,
  exerciseId,
  name: key,
  hasMachineInGym: true,
  workSets: 0,
  ...extra,
});

describe('Übungen ausblenden', () => {
  it('Alternative rutscht nach unten, sobald die andere begonnen wurde', () => {
    const units = [u('Brustpresse', 'chest-press'), u('Bankdrücken', 'bench-press', { freeWeight: true }), u('Latzug', 'lat-pulldown')];
    expect(hiddenUnits(units).size).toBe(0);
    units[0].workSets = 1;
    const h = hiddenUnits(units);
    expect(h.get('Bankdrücken')).toEqual({ type: 'sibling', of: 'Brustpresse' });
    expect(h.has('Latzug')).toBe(false);
    // zurückgeholt → bleibt sichtbar
    expect(hiddenUnits(units, [], ['Bankdrücken']).has('Bankdrücken')).toBe(false);
  });

  it('manuell „heute nicht“, kein Gerät im Gym, nie mit Sätzen', () => {
    const units = [u('A', 'chest-press'), u('B', 'x-custom', { hasMachineInGym: false }), u('C', 'leg-press', { workSets: 2 })];
    const h = hiddenUnits(units, ['A', 'C']);
    expect(h.get('A')).toEqual({ type: 'skipped' });
    expect(h.get('B')).toEqual({ type: 'noMachine' });
    expect(h.has('C')).toBe(false);
  });

  it('Vorlagen-Plätze: nur gleicher Platz zählt als Alternative', () => {
    // Bizeps (Kabelcurl) und Bizeps-Variante (Hammercurl) teilen sich Alternativen, sind aber zwei Plätze
    const units = [u('Bizeps', 'cable-curl', { slotId: 'biceps', workSets: 3 }), u('Bizeps 2', 'hammer-curl', { slotId: 'biceps-2', freeWeight: true })];
    expect(hiddenUnits(units).size).toBe(0);
  });

  it('eigene Übungen über Katalog-Basis, Links/Rechts bleiben zusammen, Duplikate nur einmal', () => {
    const units = [
      u('Schrägbank LH', 'incline-bench-press', { freeWeight: true, workSets: 1 }),
      u('Schrägbank KH 30°', 'custom-1', { baseExerciseId: 'db-incline-press', freeWeight: true }),
      u('Seitheben links', 'custom-l', { baseExerciseId: 'cable-lateral-raise', side: 'links', workSets: 2 }),
      u('Seitheben rechts', 'custom-r', { baseExerciseId: 'cable-lateral-raise', side: 'rechts' }),
      u('Butterfly 1', 'butterfly'),
      u('Butterfly 2', 'butterfly'),
    ];
    const h = hiddenUnits(units);
    expect(h.get('Schrägbank KH 30°')).toEqual({ type: 'sibling', of: 'Schrägbank LH' });
    expect(h.has('Seitheben rechts')).toBe(false);
    expect(h.get('Butterfly 2')).toEqual({ type: 'duplicate', of: 'Butterfly 1' });
    expect(h.has('Butterfly 1')).toBe(false);
  });
});

describe('Plan je Gym', () => {
  it('blendet im Gym ausgeschlossene Übungen aus, zurückgeholt nur für heute', () => {
    const x = u('a', 'x', { gymExcluded: true });
    expect(hiddenUnits([x]).get('a')).toEqual({ type: 'gymExcluded' });
    expect(hiddenUnits([x], [], ['a']).has('a')).toBe(false);
    expect(hiddenUnits([{ ...x, workSets: 2 }]).has('a')).toBe(false);
    // die zweite gleiche Übung rückt nach, wenn die erste im Gym ausgeblendet ist
    expect(hiddenUnits([x, u('b', 'x', { hasMachineInGym: true })]).has('b')).toBe(false);
  });
});
