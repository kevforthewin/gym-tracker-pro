import { describe, expect, it } from 'vitest';
import { shortLine, splitName } from './ExerciseName';

describe('splitName', () => {
  it('trennt Klammerzusätze als Kürzel ab', () => {
    expect(splitName('Bankdrücken (Langhantel)')).toEqual({ title: 'Bankdrücken', tags: ['LH'] });
    expect(splitName('Kabel-Seitheben (links)')).toEqual({ title: 'Kabel-Seitheben', tags: ['links'] });
  });
  it('zieht Gerätewörter mitten aus dem Namen', () => {
    expect(splitName('Schrägbankdrücken Kurzhantel 30°')).toEqual({ title: 'Schrägbankdrücken 30°', tags: ['KH'] });
  });
  it('lässt normale Namen unverändert', () => {
    expect(splitName('Butterfly')).toEqual({ title: 'Butterfly', tags: [] });
  });
  it('kürzt Produktlinien', () => {
    expect(shortLine('ROC-IT Selectorized')).toBe('ROC-IT');
    expect(shortLine('Insignia Series')).toBe('Insignia');
  });
});
