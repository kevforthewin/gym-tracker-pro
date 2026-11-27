/**
 * Lange Übungsnamen lesbar machen: Klammerzusätze werden zu kleinen Kürzel-Chips
 * („Schrägbankdrücken (Kurzhantel)“ → „Schrägbankdrücken“ + „KH“), Namen dürfen zweizeilig umbrechen
 * statt mit „…“ abgeschnitten zu werden.
 */
const ABBR: Record<string, string> = {
  kurzhantel: 'KH',
  langhantel: 'LH',
  maschine: 'Maschine',
  kabel: 'Kabel',
  multipresse: 'Multipresse',
  links: 'links',
  rechts: 'rechts',
  unterstützt: 'unterstützt',
  'high row': 'High Row',
  'belt squat': 'Belt Squat',
};

export function splitName(name: string): { title: string; tags: string[] } {
  const tags: string[] = [];
  let title = name.trim();
  // mehrere Klammerzusätze am Ende nacheinander abtrennen
  for (let m = title.match(/^(.*?)\s*\(([^()]+)\)\s*$/); m; m = title.match(/^(.*?)\s*\(([^()]+)\)\s*$/)) {
    title = m[1].trim();
    tags.unshift(ABBR[m[2].trim().toLowerCase()] ?? m[2].trim());
  }
  // Gerätewort mitten im Namen („Schrägbankdrücken Kurzhantel 30°“) ebenfalls als Chip
  for (const [word, abbr] of [['Kurzhantel', 'KH'], ['Langhantel', 'LH']] as const) {
    const re = new RegExp(`\\s+${word}(?=\\s|$)`, 'i');
    if (re.test(title) && !tags.includes(abbr)) {
      title = title.replace(re, '').trim();
      tags.unshift(abbr);
    }
  }
  return { title: title || name, tags };
}

/** Produktlinien kürzen: „ROC-IT Selectorized“ → „ROC-IT“, „Insignia Series“ → „Insignia“ */
export const shortLine = (line?: string) =>
  (line ?? '')
    .replace(/\s+(Selectorized|Series)$/i, '')
    .replace(/Plate[- ]Loaded/i, 'Plate')
    .trim();

export function ExerciseName({ name, className = '', tagClassName = '' }: { name: string; className?: string; tagClassName?: string }) {
  const { title, tags } = splitName(name);
  return (
    <span className={`line-clamp-2 break-words ${className}`}>
      {title}
      {tags.map((t) => (
        <span key={t} className={`ml-1.5 inline-block translate-y-[-1px] rounded-md bg-slate-800 px-1.5 align-middle text-[11px] font-semibold leading-5 text-slate-300 ${tagClassName}`}>
          {t}
        </span>
      ))}
    </span>
  );
}
