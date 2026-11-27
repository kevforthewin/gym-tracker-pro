/**
 * Körperschema mit hervorgehobener Muskelgruppe (eigene Zeichnung, kein Emoji).
 * Je nach Muskel wird die Vorder- oder Rückansicht gezeigt.
 */
import { HeartPulse } from 'lucide-react';
import { secondaryOf } from '../domain/muscles';

type Region =
  | 'pecs'
  | 'delts'
  | 'abs'
  | 'obliques'
  | 'upperArm'
  | 'forearm'
  | 'quads'
  | 'adductors'
  | 'abductors'
  | 'shins'
  | 'traps'
  | 'lats'
  | 'lowerBack'
  | 'glutes'
  | 'hamstrings'
  | 'calves';

const MUSCLES: Record<string, { view: 'front' | 'back'; regions: Region[] }> = {
  Brust: { view: 'front', regions: ['pecs'] },
  Schultern: { view: 'front', regions: ['delts'] },
  Bizeps: { view: 'front', regions: ['upperArm'] },
  Bauch: { view: 'front', regions: ['abs', 'obliques'] },
  Beine: { view: 'front', regions: ['quads'] },
  Quadrizeps: { view: 'front', regions: ['quads'] },
  Adduktoren: { view: 'front', regions: ['adductors'] },
  Abduktoren: { view: 'front', regions: ['abductors'] },
  Trizeps: { view: 'back', regions: ['upperArm'] },
  Rücken: { view: 'back', regions: ['lats'] },
  'Hintere Schulter': { view: 'back', regions: ['delts'] },
  Rotatorenmanschette: { view: 'back', regions: ['delts'] },
  'Unterer Rücken': { view: 'back', regions: ['lowerBack'] },
  Nacken: { view: 'back', regions: ['traps'] },
  Beinbeuger: { view: 'back', regions: ['hamstrings'] },
  Gesäß: { view: 'back', regions: ['glutes'] },
  Waden: { view: 'back', regions: ['calves'] },
};

const BASE = '#4a4a4f';
const BODY = '#2a2a2d';
const HIGHLIGHT = '#ff7a45';
/** Nebenmuskeln: Hervorhebung, gedämpft */
const SECONDARY = '#9c604a';

/** Spiegelt eine linke Form auf die rechte Seite (Mittelachse x = 20) */
function Pair({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <g transform="translate(40 0) scale(-1 1)">{children}</g>
    </>
  );
}

interface RegionProps {
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
  onClick?: () => void;
  role?: string;
  'aria-label'?: string;
}
type On = (r: Region) => RegionProps;

function Front({ on }: { on: On }) {
  return (
    <>
      <Pair>
        <ellipse cx="11.6" cy="16.6" rx="3.3" ry="3.1" {...on('delts')} />
        <path d="M19.5 14.2H15c-1.7 0-2.3 1.6-1.9 4 .5 2.9 3 4.1 6.4 3.5z" {...on('pecs')} />
        <rect x="8.1" y="19.8" width="3.9" height="9" rx="1.95" {...on('upperArm')} />
        <rect x="6.9" y="29.6" width="3.5" height="8.8" rx="1.75" {...on('forearm')} />
        <path d="M16 23.2l-2.3.4c-.5 3.6-.3 7 .8 10.1l1.5.4z" {...on('obliques')} />
        <ellipse cx="13.7" cy="38.6" rx="1.7" ry="3" {...on('abductors')} />
        <rect x="14" y="38.3" width="5.6" height="15" rx="2.8" {...on('quads')} />
        <rect x="17.4" y="39.2" width="2.2" height="8.6" rx="1.1" {...on('adductors')} />
        <rect x="14.7" y="54.6" width="4.1" height="8.6" rx="2" {...on('shins')} />
      </Pair>
      <rect x="16.6" y="23" width="6.8" height="11.3" rx="2.2" {...on('abs')} />
      <path d="M16.2 34.6h7.6l1 3.4h-9.6z" fill={BASE} />
    </>
  );
}

function Back({ on }: { on: On }) {
  return (
    <>
      <path d="M20 10.6l6.2 4-6.2 5.4-6.2-5.4z" {...on('traps')} />
      <Pair>
        <ellipse cx="11.6" cy="16.6" rx="3.3" ry="3.1" {...on('delts')} />
        <path d="M19.4 20.6l-5.3-4.4c-1.4 3.4-1 8.6 1.6 12.6l3.7 1.8z" {...on('lats')} />
        <rect x="8.1" y="19.8" width="3.9" height="9" rx="1.95" {...on('upperArm')} />
        <rect x="6.9" y="29.6" width="3.5" height="8.8" rx="1.75" {...on('forearm')} />
        <ellipse cx="17" cy="39" rx="3.5" ry="3.3" {...on('glutes')} />
        <rect x="14" y="42.6" width="5.6" height="11" rx="2.8" {...on('hamstrings')} />
        <ellipse cx="16.6" cy="58" rx="2.3" ry="4.4" {...on('calves')} />
      </Pair>
      <rect x="16.8" y="29.6" width="6.4" height="5.6" rx="1.6" {...on('lowerBack')} />
    </>
  );
}

function Silhouette() {
  return (
    <>
      <ellipse cx="20" cy="5.8" rx="3.9" ry="4.6" fill={BASE} />
      <rect x="18" y="9.5" width="4" height="4" rx="1.2" fill={BODY} />
      <path
        d="M13 12.6h14c3 0 4.6 2 4.4 5l-1.9 9.4c-.7 3.9-1.9 7-2.9 10H13.4c-1-3-2.2-6.1-2.9-10l-1.9-9.4c-.2-3 1.4-5 4.4-5z"
        fill={BODY}
      />
      <Pair>
        <rect x="7.2" y="15.4" width="5.6" height="24" rx="2.8" fill={BODY} />
        <rect x="13.2" y="35.5" width="6.9" height="28" rx="3.3" fill={BODY} />
      </Pair>
    </>
  );
}

/**
 * Muskel-Icon; `muscle` ist die Hauptmuskelgruppe der Übung (z. B. „Brust“), `secondary` die
 * mittrainierten Muskeln (gedämpft). Nebenmuskeln erscheinen nur, wenn sie in derselben Ansicht
 * liegen (vorne/hinten) – sonst würde z. B. „Bizeps“ in der Rückansicht als Trizeps erscheinen.
 */
export function MuscleIcon({
  muscle,
  secondary = [],
  size = 36,
  className = '',
}: {
  muscle?: string;
  secondary?: string[];
  size?: number;
  className?: string;
}) {
  if (muscle === 'Cardio')
    return (
      <span className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <HeartPulse size={size * 0.6} strokeWidth={1.8} className="text-best" />
      </span>
    );
  const m = (muscle && MUSCLES[muscle]) || { view: 'front' as const, regions: [] as Region[] };
  const sec = new Set(
    secondary
      .map((x) => MUSCLES[x])
      .filter((x) => x && x.view === m.view)
      .flatMap((x) => x.regions),
  );
  const on: On = (r) => ({ fill: m.regions.includes(r) ? HIGHLIGHT : sec.has(r) ? SECONDARY : BASE });
  return (
    <svg viewBox="0 0 40 64" width={(size * 40) / 64} height={size} className={className} aria-label={muscle ?? 'Übung'} role="img">
      <Silhouette />
      {m.view === 'front' ? <Front on={on} /> : <Back on={on} />}
    </svg>
  );
}

/** Quadratische Kachel mit Muskel-Icon einer Übung (Haupt- und Nebenmuskeln) */
export function MuscleTile({ muscle, exerciseId, className = '' }: { muscle?: string; exerciseId?: string; className?: string }) {
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 ${className}`}>
      <MuscleIcon muscle={muscle} secondary={secondaryOf(exerciseId)} size={34} />
    </span>
  );
}

/** Welche Muskelgruppe liegt in welcher Fläche – je Ansicht (für die große, antippbare Figur) */
const REGION_MUSCLE: Record<'front' | 'back', Partial<Record<Region, string>>> = {
  front: { pecs: 'Brust', delts: 'Schultern', upperArm: 'Bizeps', abs: 'Bauch', obliques: 'Bauch', quads: 'Quadrizeps', adductors: 'Adduktoren', abductors: 'Abduktoren' },
  back: { traps: 'Nacken', delts: 'Hintere Schulter', lats: 'Rücken', upperArm: 'Trizeps', lowerBack: 'Unterer Rücken', glutes: 'Gesäß', hamstrings: 'Beinbeuger', calves: 'Waden' },
};

/**
 * Große Ganzkörper-Figur (vorne + hinten); jede Muskelgruppe wird über `colorOf` eingefärbt und ist antippbar.
 */
export function BodyMap({
  colorOf,
  selected,
  onSelect,
  height = 220,
}: {
  colorOf: (muscle: string) => string;
  selected?: string;
  onSelect: (muscle: string) => void;
  height?: number;
}) {
  const view = (v: 'front' | 'back') => {
    const on: On = (r) => {
      const muscle = REGION_MUSCLE[v][r];
      if (!muscle) return { fill: BASE };
      const sel = muscle === selected;
      return {
        fill: colorOf(muscle),
        stroke: sel ? '#fff' : 'none',
        strokeWidth: sel ? 0.7 : 0,
        style: { cursor: 'pointer' },
        onClick: () => onSelect(muscle),
        role: 'button',
        'aria-label': muscle,
      };
    };
    return (
      <figure className="flex flex-col items-center">
        <svg viewBox="-1 -1 42 66" height={height} width={(height * 42) / 66} role="group" aria-label={v === 'front' ? 'Vorderseite' : 'Rückseite'}>
          <Silhouette />
          {v === 'front' ? <Front on={on} /> : <Back on={on} />}
        </svg>
        <figcaption className="mt-1 text-[11px] text-slate-500">{v === 'front' ? 'Vorne' : 'Hinten'}</figcaption>
      </figure>
    );
  };
  return (
    <div className="flex justify-center gap-6">
      {view('front')}
      {view('back')}
    </div>
  );
}
