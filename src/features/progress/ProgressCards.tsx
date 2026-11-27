/** Angeheftete Fortschritts-Karten: bester Satz, Veränderung seit dem ersten Training, Mini-Chart mit Bestwerten. */
import { useState } from 'react';
import { compareExercises } from '../../domain/exerciseOrder';
import { ExerciseName } from '../../components/ExerciseName';
import { ArrowUp, MoreHorizontal, Plus } from 'lucide-react';
import { MuscleTile } from '../../components/MuscleIcon';
import { useLiveQuery } from 'dexie-react-hooks';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, type DotProps } from 'recharts';
import { BestBadge, Button, IconButton, Modal } from '../../components/ui';
import { all, getMeta, setMeta } from '../../local/db';
import { counted } from '../../local/queries';
import { SPLIT_LABEL } from '../../domain/dashboard';
import { e1rm } from '../../domain/metrics';
import { fmtDate, fmtNumber, fmtShortDate } from '../../domain/units';
import type { Exercise, Split } from '../../model/types';

interface Point {
  date: number;
  value: number;
  pr: boolean;
  label: string;
}
interface CardData {
  exercise: Exercise;
  subtitle: string;
  points: Point[];
  best: Point;
  latestIsBest: boolean;
  changePct: number | null;
}

const PINS = 'pinnedProgress';

async function buildCards(): Promise<{ cards: CardData[]; available: Exercise[] }> {
  const [sets, sessions, exercises, machines] = await Promise.all([all('sets'), all('sessions'), all('exercises'), all('gymMachines')]);
  const start = new Map(sessions.map((s) => [s.id, s.startedAt]));
  const ex = new Map(exercises.map((e) => [e.id, e]));
  const mLabel = new Map(machines.map((m) => [m.id, m.label]));
  const work = sets.filter((s) => counted(s) && start.has(s.sessionId));
  const byEx = new Map<string, typeof work>();
  for (const s of work) byEx.set(s.exerciseId, [...(byEx.get(s.exerciseId) ?? []), s]);
  const available = [...byEx.keys()].map((id) => ex.get(id)).filter((e): e is Exercise => !!e && e.type !== 'time_distance');

  let pins = (await getMeta<string[]>(PINS)) ?? null;
  if (!pins) {
    // Standard: die 4 meisttrainierten Übungen
    pins = [...byEx]
      .filter(([id]) => available.some((e) => e.id === id))
      .sort((a, b) => new Set(b[1].map((s) => s.sessionId)).size - new Set(a[1].map((s) => s.sessionId)).size)
      .slice(0, 4)
      .map(([id]) => id);
  }

  const cards: CardData[] = [];
  for (const id of pins) {
    const exercise = ex.get(id);
    const list = byEx.get(id);
    if (!exercise || !list) continue;
    // Meistgenutztes Gerät (Freihantel: alle zusammen) – nur so sind Gewichte vergleichbar
    const count = new Map<string, number>();
    for (const s of list) count.set(s.machineId ?? '', (count.get(s.machineId ?? '') ?? 0) + 1);
    const machineId = exercise.freeWeight ? null : [...count].sort((a, b) => b[1] - a[1])[0][0];
    const series = exercise.freeWeight ? list : list.filter((s) => (s.machineId ?? '') === machineId);
    const bw = exercise.type === 'bodyweight' && series.every((s) => !s.weightKg);
    const bySession = new Map<string, typeof series>();
    for (const s of series) bySession.set(s.sessionId, [...(bySession.get(s.sessionId) ?? []), s]);
    let running = -Infinity;
    const points: Point[] = [...bySession]
      .map(([sid, l]) => {
        const top = l.reduce((b, s) => ((bw ? s.reps ?? 0 : e1rm(s.weightKg ?? 0, s.reps ?? 0)) > (bw ? b.reps ?? 0 : e1rm(b.weightKg ?? 0, b.reps ?? 0)) ? s : b));
        return {
          date: start.get(sid)!,
          value: bw ? top.reps ?? 0 : e1rm(top.weightKg ?? 0, top.reps ?? 0),
          label: bw ? `${top.reps} Wdh.` : `${fmtNumber(top.weightKg ?? 0)} kg × ${top.reps}`,
          pr: false,
        };
      })
      .sort((a, b) => a.date - b.date)
      .map((p, i) => {
        const pr = i > 0 && p.value > running + 1e-9;
        running = Math.max(running, p.value);
        return { ...p, pr };
      });
    const best = points.reduce((b, p) => (p.value > b.value ? p : b), points[0]);
    const first = points[0].value;
    const last = points.at(-1)!;
    cards.push({
      exercise,
      subtitle: [exercise.freeWeight ? 'Freihantel · alle Gyms' : `meistgenutzt · ${mLabel.get(machineId ?? '') ?? 'ohne Gerät'}`, 'bester Satz'].join(' · '),
      points,
      best,
      latestIsBest: points.length > 1 && last.pr,
      changePct: points.length > 1 && first > 0 ? Math.round(((last.value - first) / first) * 100) : null,
    });
  }
  return { cards, available };
}

function Star(props: DotProps & { payload?: Point }) {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined) return null;
  return payload?.pr ? (
    <text x={cx} y={cy + 5} textAnchor="middle" fontSize={15} fill="#ffd60a">
      ✦
    </text>
  ) : (
    <circle cx={cx} cy={cy} r={2.5} fill="#fff" />
  );
}

export function ProgressCards({ onOpen }: { onOpen: (exerciseId: string) => void }) {
  const data = useLiveQuery(buildCards, []);
  const [adding, setAdding] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const pins = data?.cards.map((c) => c.exercise.id) ?? [];
  const savePins = (p: string[]) => setMeta(PINS, p);

  return (
    <>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xl font-bold">Angeheftet</h2>
        <IconButton label="Chart hinzufügen" onClick={() => setAdding(true)}>
          <Plus size={20} />
        </IconButton>
      </div>
      <div className="space-y-3">
        {data?.cards.map((c) => (
          <div key={c.exercise.id} className="rounded-card bg-slate-900 p-4">
            <div className="flex items-start gap-2">
              <MuscleTile muscle={c.exercise.muscleGroup} exerciseId={c.exercise.id} />
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onOpen(c.exercise.id)}>
                <h3 className="text-lg font-bold leading-snug">
                  <ExerciseName name={c.exercise.name} />
                </h3>
                <p className="line-clamp-2 text-xs text-slate-500">{c.subtitle}</p>
              </button>
              <IconButton label="Optionen" className="h-8 w-8 bg-transparent" onClick={() => setMenu(c.exercise.id)}>
                <MoreHorizontal size={18} />
              </IconButton>
            </div>
            <button type="button" className="mt-2 block w-full text-left" onClick={() => onOpen(c.exercise.id)}>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-3xl font-bold tabular-nums">{c.best.label}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                    {fmtDate(c.best.date)} {c.latestIsBest && <BestBadge />}
                  </p>
                </div>
                {c.changePct !== null && (
                  <div className="text-right">
                    <span className={`chip px-2.5 py-1 text-sm ${c.changePct >= 0 ? 'bg-white text-black' : 'bg-slate-700 text-slate-200'}`}>
                      {c.changePct >= 0 ? '↑' : '↓'} {Math.abs(c.changePct)} %
                    </span>
                    <p className="mt-1 text-[11px] text-slate-500">seit erstem Training</p>
                  </div>
                )}
              </div>
              {c.points.length > 1 && (
                <div className="mt-3 h-28">
                  <ResponsiveContainer>
                    <LineChart data={c.points} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
                      <XAxis
                        dataKey="date"
                        type="number"
                        scale="time"
                        domain={['dataMin', 'dataMax']}
                        ticks={[c.points[0].date, c.points.at(-1)!.date]}
                        tickFormatter={fmtShortDate}
                        tick={{ fontSize: 10, fill: '#8e8e93' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                      <Line type="monotone" dataKey="value" stroke="#fff" strokeWidth={2} dot={<Star />} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </button>
          </div>
        ))}
        {data && data.cards.length === 0 && <p className="text-sm text-slate-500">Tippe auf +, um Übungen anzuheften.</p>}
      </div>

      <Modal open={!!menu} onClose={() => setMenu(null)} title="Chart">
        <div className="space-y-2">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              const i = pins.indexOf(menu!);
              if (i > 0) savePins([...pins.slice(0, i - 1), pins[i], pins[i - 1], ...pins.slice(i + 1)]);
              setMenu(null);
            }}
          >
            <ArrowUp size={16} /> Nach oben
          </Button>
          <Button
            variant="danger"
            className="w-full"
            onClick={() => {
              savePins(pins.filter((p) => p !== menu));
              setMenu(null);
            }}
          >
            Entfernen
          </Button>
        </div>
      </Modal>

      <Modal open={adding} onClose={() => setAdding(false)} title="Chart hinzufügen">
        {(['push', 'pull', 'legs', 'other'] as Split[]).map((s) => {
          const list = (data?.available ?? []).filter((e) => e.split === s && !pins.includes(e.id)).sort(compareExercises);
          if (!list.length) return null;
          return (
            <section key={s} className="mb-3">
              <h3 className="label">{SPLIT_LABEL[s]}</h3>
              <ul className="divide-y divide-slate-800">
                {list.map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      className="w-full py-2.5 text-left"
                      onClick={() => {
                        savePins([...pins, e.id]);
                        setAdding(false);
                      }}
                    >
                      {e.name}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </Modal>
    </>
  );
}
