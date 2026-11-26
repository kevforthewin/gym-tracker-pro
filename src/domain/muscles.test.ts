import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { CATALOG_EXERCISES } from '../catalog/catalog';
import { MuscleIcon } from '../components/MuscleIcon';
import { secondaryOf } from './muscles';

const MUSCLES = new Set(CATALOG_EXERCISES.map((e) => e.muscleGroup));

describe('Nebenmuskeln', () => {
  it('nur bekannte Übungen und Muskelgruppen', () => {
    const ids = new Set(CATALOG_EXERCISES.map((e) => e.id));
    for (const e of CATALOG_EXERCISES) for (const m of secondaryOf(e.id)) expect(MUSCLES.has(m) || m === 'Quadrizeps', `${e.id}: ${m}`).toBe(true);
    expect(secondaryOf('gibt-es-nicht')).toEqual([]);
    expect(ids.has('lat-pulldown')).toBe(true);
  });

  it('Icon: Haupt- und Nebenmuskel, Nebenmuskel der anderen Ansicht wird ausgelassen', () => {
    const svg = (muscle: string, secondary: string[]) => renderToStaticMarkup(createElement(MuscleIcon, { muscle, secondary }));
    const count = (s: string, c: string) => s.split(c).length - 1;
    // Brustpresse: Brust (Haupt) + Schultern (Neben, vorne); Trizeps (hinten) nicht
    const bp = svg('Brust', ['Schultern', 'Trizeps']);
    expect(count(bp, '#ff7a45')).toBeGreaterThan(0);
    expect(count(bp, '#9c604a')).toBe(2); // beide Schultern
    // Latzug: Rücken (hinten); Bizeps (vorne) ausgelassen, hintere Schulter dabei
    const lat = svg('Rücken', ['Bizeps', 'Hintere Schulter']);
    expect(count(lat, '#9c604a')).toBe(2);
  });
});
