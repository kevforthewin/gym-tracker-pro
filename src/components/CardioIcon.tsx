import { Activity, Bike, ChevronsUp, Footprints, HeartPulse, MoveDiagonal, PersonStanding, Sailboat, Waves, type LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  treadmill: Activity,
  run: Footprints,
  bike: Bike,
  cycling: Bike,
  'cross-trainer': MoveDiagonal,
  rower: Sailboat,
  stairs: ChevronsUp,
  swim: Waves,
  walk: PersonStanding,
  other: HeartPulse,
};

/** Linien-Icon je Cardio-Art */
export function CardioIcon({ kind, size = 20, className = '' }: { kind: string; size?: number; className?: string }) {
  const Icon = ICONS[kind] ?? HeartPulse;
  return <Icon size={size} strokeWidth={1.8} className={className} aria-hidden />;
}
