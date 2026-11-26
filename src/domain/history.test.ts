import { describe, expect, it } from 'vitest';
import { bestLevel, historyLevels, type HistMachine, type HistSet } from './history';

const machines: HistMachine[] = [
  { id: 'a1', gymId: 'A', exerciseId: 'bp', modelId: 'hoist-cp' },
  { id: 'b1', gymId: 'B', exerciseId: 'bp', modelId: 'hoist-cp' },
  { id: 'c1', gymId: 'C', exerciseId: 'bp', modelId: 'matrix-cp' },
  { id: 'c2', gymId: 'C', exerciseId: 'bp' },
];
const set = (sessionId: string, machineId: string | undefined, date: number, weightKg: number, setIndex = 1): HistSet => ({
  sessionId,
  machineId,
  exerciseId: 'bp',
  date,
  setIndex,
  weightKg,
  reps: 10,
});
const sets: HistSet[] = [
  set('s1', 'a1', 1, 50),
  set('s1', 'a1', 1, 50, 2),
  set('s2', 'b1', 2, 55),
  set('s3', 'c1', 3, 70),
  set('s4', 'c2', 4, 30),
];

describe('historyLevels', () => {
  it('trennt Gerät, gleiches Modell und Übung', () => {
    const l = historyLevels({ machine: machines[0], exerciseId: 'bp' }, sets, machines);
    expect(l.machine.sessions.map((s) => s.sessionId)).toEqual(['s1']);
    expect(l.machine.sessions[0].sets).toHaveLength(2);
    expect(l.model.sessions.map((s) => s.sessionId)).toEqual(['s2']);
    expect(l.model.sessions[0].gymId).toBe('B');
    expect(l.exercise.sessions.map((s) => s.sessionId)).toEqual(['s1', 's2', 's3', 's4']);
    expect(l.free.sessions).toHaveLength(0);
  });

  it('bestLevel: Gerät vor Modell, Übung nie als Ziel', () => {
    expect(bestLevel(historyLevels({ machine: machines[0], exerciseId: 'bp' }, sets, machines))?.level).toBe('machine');
    // neues Gerät gleiches Modell in Gym D → Modell-Ebene
    const d: HistMachine = { id: 'd1', gymId: 'D', exerciseId: 'bp', modelId: 'hoist-cp' };
    const l = historyLevels({ machine: d, exerciseId: 'bp' }, sets, [...machines, d]);
    expect(bestLevel(l)?.level).toBe('model');
    expect(l.model.sessions.map((s) => s.sessionId)).toEqual(['s1', 's2']);
    // Gerät ohne Modell und ohne Historie → nichts Vergleichbares
    const e: HistMachine = { id: 'e1', gymId: 'E', exerciseId: 'bp' };
    expect(bestLevel(historyLevels({ machine: e, exerciseId: 'bp' }, sets, [...machines, e]))).toBeNull();
  });

  it('Freihantel: alle Gyms gemeinsam, aktuelles Training ausgeschlossen', () => {
    const l = historyLevels({ exerciseId: 'bp', freeWeight: true }, sets, machines, 's4');
    expect(bestLevel(l, true)?.sessions.map((s) => s.sessionId)).toEqual(['s1', 's2', 's3']);
  });
});
