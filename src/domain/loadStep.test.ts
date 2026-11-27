import { describe, expect, it } from 'vitest';
import { loadClass, loadStep } from './loadStep';

const ex = (id: string, name: string, extra: object = {}) => ({ id, name, ...extra });

describe('loadStep', () => {
  it('kleine Gewichte bei Isolation: kleine Schritte statt Gerätestufe', () => {
    expect(loadStep(ex('x', 'Kabel-Seitheben (links)'), 6, 2.2)).toBe(1);
    expect(loadStep(ex('x', 'Kabel-Seitheben (links)'), 3, 2.2)).toBe(0.5);
    expect(loadStep(ex('x', 'Kabel-Seitheben (links)'), 15, 2.2)).toBe(2.2);
  });
  it('Kurzhanteln: bis 10 kg 1er-Schritte, darüber Gerätestufe', () => {
    expect(loadStep(ex('db-lateral-raise', 'Seitheben (Kurzhantel)', { freeWeight: true }), 6)).toBe(1);
    expect(loadStep(ex('x', 'Schrägbankdrücken Kurzhantel 30°', { freeWeight: true }), 22.5)).toBe(2.5);
  });
  it('Grundübungen behalten die Gerätestufe, Beine ab 100 kg 5 kg', () => {
    expect(loadStep(ex('bench-press', 'Bankdrücken'), 70)).toBe(2.5);
    expect(loadStep(ex('leg-press', 'Beinpresse'), 160)).toBe(5);
    expect(loadStep(ex('x', 'Latzug'), 15)).toBe(1);
  });
  it('erkennt Übungsart auch bei eigenen Übungen', () => {
    expect(loadClass(ex('x', 'Hoist Preacher Curl'))).toBe('isolation');
    expect(loadClass(ex('x', 'Wadenheben Hoist stehend (links)'))).toBe('isolation');
    expect(loadClass(ex('x', 'T-Bar Rudern'))).toBe('upper');
    expect(loadClass(ex('x', 'Kniebeuge'))).toBe('lower');
  });
});
