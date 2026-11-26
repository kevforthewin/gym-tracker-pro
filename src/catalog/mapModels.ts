/**
 * Ordnet die englischen Produktnamen der Hersteller einer Übung aus unserem Katalog zu.
 * Erste passende Regel gewinnt. Geräte ohne klare Einzelübung (Smith-Maschine, Kabelstationen,
 * Nacken, Griffkraft …) werden bewusst nicht aufgenommen (`null`).
 */
import type { EquipmentKind } from '../model/types';

const EXCLUDE = /neck|gripper|tibia|smith|jammer|functional trainer|simple trainer|adjustable pulley|combo twist|nordic|rack|bench\b(?!.*press)|ab crunch bench/i;

const RULES: [RegExp, string][] = [
  [/belt squat/i, 'belt-squat'],
  [/pendulum/i, 'pendulum-squat'],
  [/hack squat|v-squat|squat press|perfect squat|squat \/ high pull|squat lunge/i, 'hack-squat'],
  [/leg press/i, 'leg-press'],
  [/leg extension/i, 'leg-extension'],
  [/prone leg curl|kneeling leg curl|standing \/ prone|lying leg curl/i, 'leg-curl-lying'],
  [/leg curl/i, 'leg-curl-seated'],
  [/seated calf/i, 'seated-calf-raise'],
  [/calf/i, 'calf-raise'],
  [/hip thrust|glute bridge|glute drive/i, 'hip-thrust'],
  [/glute ham|reverse hyper/i, 'back-extension'],
  [/glute|hip and glute/i, 'glute-machine'],
  [/abduct|outer thigh/i, 'abductor'],
  [/adduct|inner thigh/i, 'adductor'],
  [/super incline|incline/i, 'incline-chest-press'],
  [/decline (chest|bench)? ?press|decline chest/i, 'decline-chest-press'],
  [/rear delt(oid)? fly/i, 'reverse-fly'],
  [/fly|pec /i, 'butterfly'],
  [/chest|bench press|multi.?press/i, 'chest-press'],
  [/shoulder press/i, 'shoulder-press'],
  [/lateral raise/i, 'lateral-raise-machine'],
  [/pulldown/i, 'lat-pulldown'],
  [/high row/i, 'high-row'],
  [/t-bar/i, 't-bar-row'],
  [/row/i, 'seated-row'],
  [/pullover/i, 'pullover'],
  [/assist/i, 'assisted-pullup'],
  [/dip/i, 'dip-machine'],
  [/curl|biceps|bicep/i, 'biceps-curl-machine'],
  [/triceps/i, 'triceps-press'],
  [/abdominal|ab crunch|oblique/i, 'ab-crunch'],
  [/back extension|low back|reverse hyper|glute ham/i, 'back-extension'],
  [/rotary torso|torso rotation/i, 'rotary-torso'],
  [/shrug/i, 'shrug-machine'],
];

export function exerciseForProduct(name: string): string | null {
  if (EXCLUDE.test(name)) return null;
  return RULES.find(([r]) => r.test(name))?.[1] ?? null;
}

export function kindForLine(line: string): EquipmentKind {
  return /plate/i.test(line) ? 'plate_loaded' : 'selectorized';
}
