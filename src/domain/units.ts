export const fmtNumber = (n: number, digits = 2) =>
  n.toLocaleString('de-DE', { maximumFractionDigits: digits });

export const fmtKg = (kg?: number) => (kg === undefined ? '–' : `${fmtNumber(kg)} kg`);

export function fmtDuration(sec?: number): string {
  if (sec === undefined) return '–';
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mmss = `${String(m).padStart(h ? 2 : 1, '0')}:${String(r).padStart(2, '0')}`;
  return h ? `${h}:${mmss}` : mmss;
}

/** "1:30", "90", "1:02:00" -> Sekunden. */
export function parseDuration(input: string): number | undefined {
  const t = input.trim();
  if (!t) return undefined;
  const parts = t.split(':').map((p) => Number(p.replace(',', '.')));
  if (parts.some((p) => Number.isNaN(p) || p < 0)) return undefined;
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

export const fmtDistance = (m?: number) =>
  m === undefined ? '–' : m >= 1000 ? `${fmtNumber(m / 1000)} km` : `${fmtNumber(m, 0)} m`;

export const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit' });

export const fmtShortDate = (ts: number) =>
  new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });

export const parseNum = (v: string): number | undefined => {
  const n = Number(v.replace(',', '.'));
  return v.trim() === '' || Number.isNaN(n) ? undefined : n;
};
