import { describe, expect, it } from 'vitest';
import { compareExercises } from './exerciseOrder';

const e = (name: string, muscleGroup: string, extra = {}) => ({ id: name, name, muscleGroup, ...extra });

describe('compareExercises', () => {
  it('sortiert Push wie im Gym: Brust (flach, schräg, Fly), Schultern, Trizeps', () => {
    const list = [
      e('Trizeps Pressdown', 'Trizeps'),
      e('Kabel-Seitheben (rechts)', 'Schultern'),
      e('Butterfly', 'Brust'),
      e('Schrägbankdrücken (Langhantel)', 'Brust', { freeWeight: true }),
      e('Kabel-Seitheben (links)', 'Schultern'),
      e('Schulterdrücken (Kurzhantel)', 'Schultern', { freeWeight: true }),
      e('Bankdrücken (Langhantel)', 'Brust', { freeWeight: true }),
    ].sort(compareExercises);
    expect(list.map((x) => x.name)).toEqual([
      'Bankdrücken (Langhantel)',
      'Schrägbankdrücken (Langhantel)',
      'Butterfly',
      'Schulterdrücken (Kurzhantel)',
      'Kabel-Seitheben (links)',
      'Kabel-Seitheben (rechts)',
      'Trizeps Pressdown',
    ]);
  });
  it('Pull: Latzug vor Rudern vor Curls', () => {
    const list = [e('Hammercurl', 'Bizeps'), e('Rudern (Kabel)', 'Rücken'), e('Latzug', 'Rücken'), e('Face Pulls', 'Hintere Schulter')].sort(compareExercises);
    expect(list.map((x) => x.name)).toEqual(['Latzug', 'Rudern (Kabel)', 'Face Pulls', 'Hammercurl']);
  });
});

describe('Bizeps', () => {
  it('Freihantel vor Maschine, „Maschine“ ist kein Chin-up', () => {
    const list = [e('Bizepscurl (Maschine)', 'Bizeps'), e('SZ-Curls', 'Bizeps', { freeWeight: true }), e('Hammercurl', 'Bizeps', { freeWeight: true })].sort(compareExercises);
    expect(list.map((x) => x.name)).toEqual(['SZ-Curls', 'Hammercurl', 'Bizepscurl (Maschine)']);
  });
});
