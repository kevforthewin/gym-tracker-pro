/**
 * Welche Übungen eines Trainings werden ausgeblendet (unten eingeklappt)?
 * - manuell „heute nicht“
 * - Alternative zu einer Übung, die heute schon gemacht wird (gleiche Bewegung, z. B. Brustpresse ↔ Bankdrücken)
 * - kein Gerät in diesem Gym (und keine Freihantel)
 * Übungen mit gespeicherten Sätzen werden nie ausgeblendet; „zurückgeholte“ bleiben sichtbar.
 */
import { SLOTS } from './slots';

export interface VisUnit {
  key: string;
  exerciseId: string;
  name: string;
  /** Platz aus einer Vorlage (dann gilt nur dieser Platz als Gruppe) */
  slotId?: string;
  freeWeight?: boolean;
  hasMachineInGym: boolean;
  workSets: number;
  /** Katalog-Übung, der eine eigene Übung entspricht (z. B. „Schrägbank KH 30°“ → KH-Schrägbankdrücken) */
  baseExerciseId?: string;
  /** Seite bei einseitigen Übungen – Links/Rechts-Paare sind keine Alternativen zueinander */
  side?: 'links' | 'rechts';
  /** Im Plan für dieses Gym ausgeblendet */
  gymExcluded?: boolean;
}

export type HiddenReason =
  | { type: 'skipped' }
  | { type: 'sibling'; of: string }
  | { type: 'duplicate'; of: string }
  | { type: 'noMachine' }
  | { type: 'gymExcluded' };

/** Bewegungsgruppen einer Übung (über die Alternativen der Plätze) */
function groupsOf(u: VisUnit): Set<string> {
  const ex = u.baseExerciseId ?? u.exerciseId;
  const groups = u.slotId ? [u.slotId] : SLOTS.filter((s) => s.alternatives.includes(ex)).map((s) => s.id);
  return new Set([...groups, `ex:${u.exerciseId}`].map((g) => (u.side ? `${g}:${u.side}` : g)));
}

export function hiddenUnits(units: VisUnit[], skipped: string[] = [], shown: string[] = []): Map<string, HiddenReason> {
  const out = new Map<string, HiddenReason>();
  const done = units.filter((u) => u.workSets > 0);
  for (const u of units) {
    if (u.workSets > 0) continue;
    if (skipped.includes(u.key)) {
      out.set(u.key, { type: 'skipped' });
      continue;
    }
    if (shown.includes(u.key)) continue;
    if (u.gymExcluded) {
      out.set(u.key, { type: 'gymExcluded' });
      continue;
    }
    const g = groupsOf(u);
    const sibling = done.find((d) => d.key !== u.key && [...groupsOf(d)].some((x) => g.has(x)));
    if (sibling) {
      out.set(u.key, { type: 'sibling', of: sibling.name });
      continue;
    }
    // exakt gleiche Übung schon weiter oben (z. B. aus einem Plan für mehrere Gyms) → nur einmal zeigen
    const first = units.find((x) => x.exerciseId === u.exerciseId && x.side === u.side && !u.slotId && !x.gymExcluded);
    if (first && first.key !== u.key && !skipped.includes(first.key)) {
      out.set(u.key, { type: 'duplicate', of: first.name });
      continue;
    }
    if (!u.slotId && !u.freeWeight && !u.hasMachineInGym) out.set(u.key, { type: 'noMachine' });
  }
  return out;
}

export const REASON_TEXT = (r: HiddenReason) =>
  r.type === 'skipped'
    ? 'heute nicht'
    : r.type === 'sibling'
      ? `Alternative zu ${r.of}`
      : r.type === 'duplicate'
        ? 'gleiche Übung steht schon oben'
        : r.type === 'gymExcluded'
          ? 'in diesem Gym nicht im Plan'
          : 'kein Gerät in diesem Gym';
