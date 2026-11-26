import { describe, expect, it } from 'vitest';
import { nextPlanDay } from './planRotation';

const days = [
  { id: 'legs', order: 2 },
  { id: 'push', order: 0 },
  { id: 'pull', order: 1 },
];

describe('nextPlanDay', () => {
  it('ohne Historie erster Tag', () => expect(nextPlanDay(days)?.id).toBe('push'));
  it('nächster Tag', () => expect(nextPlanDay(days, 'push')?.id).toBe('pull'));
  it('zyklisch', () => expect(nextPlanDay(days, 'legs')?.id).toBe('push'));
  it('unbekannter Tag -> erster', () => expect(nextPlanDay(days, 'x')?.id).toBe('push'));
  it('leer', () => expect(nextPlanDay([])).toBeUndefined());
});
