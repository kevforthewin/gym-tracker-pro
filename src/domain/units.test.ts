import { describe, expect, it } from 'vitest';
import { fmtDuration, parseDuration } from './units';

describe('units', () => {
  it('Dauer formatieren/parsen', () => {
    expect(fmtDuration(90)).toBe('1:30');
    expect(fmtDuration(3725)).toBe('1:02:05');
    expect(parseDuration('1:30')).toBe(90);
    expect(parseDuration('45')).toBe(45);
    expect(parseDuration('1:02:05')).toBe(3725);
    expect(parseDuration('x')).toBeUndefined();
  });
});
