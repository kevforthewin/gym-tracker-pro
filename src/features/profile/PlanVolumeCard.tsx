/**
 * Wochenvolumen des Plans als Körperkarte: jede Muskelgruppe ist nach Abdeckung eingefärbt
 * (nicht trainiert · zu wenig · gut · sehr viel). Muskel antippen → Sätze pro Woche + passende Übungen,
 * die sich direkt einem Trainingstag hinzufügen lassen. Die Balkenliste gibt es weiterhin als Detailansicht.
 */
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Check, Plus } from 'lucide-react';
import { BodyMap, MuscleTile } from '../../components/MuscleIcon';
import { ExerciseName } from '../../components/ExerciseName';
import { Card } from '../../components/ui';
import { getMeta, save } from '../../local/db';
import { matchCatalog } from '../../import/legacyBackup';
import { splitSide } from '../../domain/exerciseDefaults';
import { canonMuscle, MINOR_RANGE, planVolume, VOLUME_RANGE, type MuscleVolume } from '../../domain/planVolume';
import { fmtNumber } from '../../domain/units';
import type { Exercise, PlanDay, PlanDayExercise } from '../../model/types';

const SCALE_MAX = 24;
export const COLOR = { none: '#4a4a4f', low: '#ff9f0a', ok: '#30d158', high: '#64d2ff' } as const;
export const LABEL = { none: 'nicht trainiert', low: 'zu wenig', ok: 'gut', high: 'viel' } as const;
const tone = (v?: MuscleVolume) => (!v || v.sets === 0 ? 'none' : v.status);

export function PlanVolumeCard({ days, pdes, exercises }: { days: PlanDay[]; pdes: PlanDayExercise[]; exercises: Map<string, Exercise> }) {
  const perWeek = useLiveQuery(async () => (await getMeta<number>('weeklyGoal')) ?? 3, []);
  const [selected, setSelected] = useState<string>();
  const [list, setList] = useState(false);
  if (!perWeek || !days.length) return null;

  const volume = planVolume({
    perWeek,
    days: days.map((d) => ({
      items: pdes
        .filter((p) => p.planDayId === d.id)
        .map((p) => {
          const e = exercises.get(p.exerciseId);
          return {
            // eigene Übungen: Nebenmuskeln über die passende Katalog-Übung
            exerciseId: (e?.createdBy && matchCatalog(e.name)) || p.exerciseId,
            muscle: e?.muscleGroup,
            // links/rechts getrennt erfasst = eine Übung → zählt je Seite halb
            sets: e && splitSide(e.name).side ? p.sets / 2 : p.sets,
          };
        }),
    })),
  });
  const byMuscle = new Map(volume.map((v) => [v.muscle, v]));
  const low = volume.filter((v) => v.status === 'low' && v.sets > 0);
  const missing = volume.filter((v) => v.sets === 0 && !v.minor);
  const sel = selected ? byMuscle.get(selected) : undefined;

  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold">Wochenvolumen</h2>
        <span className="text-xs text-slate-500">bei {perWeek}× pro Woche</span>
      </div>
      <p className="mt-0.5 text-xs text-slate-500">Welche Muskeln dein Plan wie stark trainiert. Tippe auf einen Muskel für Details und Übungen.</p>

      <div className="mt-3">
        <BodyMap colorOf={(m) => COLOR[tone(byMuscle.get(m))]} selected={selected} onSelect={(m) => setSelected(m === selected ? undefined : m)} />
      </div>
      <ul className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
        {(['none', 'low', 'ok', 'high'] as const).map((k) => (
          <li key={k} className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLOR[k] }} />
            {LABEL[k]}
          </li>
        ))}
      </ul>

      {sel ? (
        <MuscleDetail v={sel} days={days} pdes={pdes} exercises={exercises} onClose={() => setSelected(undefined)} />
      ) : (
        (low.length > 0 || missing.length > 0) && (
          <div className="mt-3 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            {missing.length > 0 && (
              <p>
                Nicht trainiert:{' '}
                {missing.map((v, i) => (
                  <span key={v.muscle}>
                    {i > 0 && ', '}
                    <button type="button" className="underline underline-offset-2" onClick={() => setSelected(v.muscle)}>
                      {v.muscle}
                    </button>
                  </span>
                ))}
              </p>
            )}
            {low.length > 0 && (
              <p>
                Wenig Volumen:{' '}
                {low.map((v, i) => (
                  <span key={v.muscle}>
                    {i > 0 && ', '}
                    <button type="button" className="underline underline-offset-2" onClick={() => setSelected(v.muscle)}>
                      {v.muscle}
                    </button>
                  </span>
                ))}
              </p>
            )}
          </div>
        )
      )}

      {list && (
        <>
          <p className="mt-3 text-xs text-slate-500">
            Arbeitssätze pro Woche. Empfohlen: {VOLUME_RANGE.min}–{VOLUME_RANGE.max}, kleine Muskeln (Bauch, Waden …) {MINOR_RANGE.min}–
            {MINOR_RANGE.max}. Mittrainierte Muskeln zählen halb.
          </p>
          <ul className="mt-2 space-y-1.5">
            {volume.map((v) => (
              <Row key={v.muscle} v={v} onClick={() => setSelected(v.muscle)} />
            ))}
          </ul>
        </>
      )}
      <button type="button" className="mt-2 w-full py-1 text-xs text-slate-400" onClick={() => setList(!list)}>
        {list ? 'Liste ausblenden' : 'Als Liste zeigen'}
      </button>
    </Card>
  );
}

function MuscleDetail({
  v,
  days,
  pdes,
  exercises,
  onClose,
}: {
  v: MuscleVolume;
  days: PlanDay[];
  pdes: PlanDayExercise[];
  exercises: Map<string, Exercise>;
  onClose: () => void;
}) {
  const [pick, setPick] = useState<string>();
  const [added, setAdded] = useState<string[]>([]);
  const k = tone(v);
  const dayName = new Map(days.map((d) => [d.id, d.name]));
  const inPlan = new Map<string, string[]>();
  for (const p of pdes) {
    if (!dayName.has(p.planDayId)) continue;
    inPlan.set(p.exerciseId, [...(inPlan.get(p.exerciseId) ?? []), dayName.get(p.planDayId)!]);
  }
  // Übungen mit diesem Hauptmuskel; eigene zuerst, je Seite (links/rechts) nur einmal
  const seen = new Set<string>();
  const options = [...exercises.values()]
    .filter((e) => !e.deletedAt && e.type !== 'time_distance' && e.muscleGroup && canonMuscle(e.muscleGroup) === v.muscle)
    .sort((a, b) => Number(!inPlan.has(a.id)) - Number(!inPlan.has(b.id)) || Number(!a.createdBy) - Number(!b.createdBy) || a.name.localeCompare(b.name, 'de'))
    .filter((e) => {
      const key = splitSide(e.name).base.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10);

  const add = async (exerciseId: string, dayId: string) => {
    const count = pdes.filter((p) => p.planDayId === dayId).length;
    await save('planDayExercises', { planDayId: dayId, exerciseId, order: count, sets: 3, repMin: 8, repMax: 12 });
    setAdded((a) => [...a, exerciseId]);
    setPick(undefined);
  };

  return (
    <div className="mt-3 rounded-2xl bg-slate-800/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold">{v.muscle}</h3>
          <p className="text-sm">
            <span className="font-semibold tabular-nums" style={{ color: COLOR[k] }}>
              {fmtNumber(v.sets, 1)} Sätze
            </span>
            <span className="text-slate-400">
              {' '}
              pro Woche · empfohlen {v.min}–{v.max}
            </span>
          </p>
        </div>
        <button type="button" onClick={onClose} className="text-xs text-slate-400">
          Schließen
        </button>
      </div>
      {k === 'high' && <p className="mt-1 text-xs text-slate-400">Viel Volumen – wenn die Erholung leidet, hier zuerst Sätze kürzen.</p>}
      {(k === 'none' || k === 'low') && v.minor && <p className="mt-1 text-xs text-slate-400">Kleiner Muskel – wird von Grundübungen oft schon gut mittrainiert.</p>}

      <p className="label mt-3">Übungen für {v.muscle}</p>
      <ul className="divide-y divide-slate-700/60">
        {options.map((e) => {
          const plannedOn = inPlan.get(e.id);
          const justAdded = added.includes(e.id);
          return (
            <li key={e.id} className="py-2">
              <div className="flex items-center gap-2">
                <MuscleTile muscle={e.muscleGroup} exerciseId={e.id} className="h-9 w-9" />
                <div className="min-w-0 flex-1">
                  <ExerciseName name={e.name} className="text-sm font-medium" />
                  {plannedOn && <p className="text-xs text-slate-500">im Plan: {[...new Set(plannedOn)].join(', ')}</p>}
                </div>
                {justAdded ? (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-black" aria-label="Hinzugefügt">
                    <Check size={18} strokeWidth={3} />
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-label={`${e.name} zum Plan hinzufügen`}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 active:bg-slate-500"
                    onClick={() => (days.length === 1 ? add(e.id, days[0].id) : setPick(pick === e.id ? undefined : e.id))}
                  >
                    <Plus size={18} />
                  </button>
                )}
              </div>
              {pick === e.id && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-11">
                  <span className="text-xs text-slate-400">Zu Tag:</span>
                  {days.map((d) => (
                    <button key={d.id} type="button" className="chip bg-white px-3 py-1 text-sm text-black" onClick={() => add(e.id, d.id)}>
                      {d.name}
                    </button>
                  ))}
                </div>
              )}
            </li>
          );
        })}
        {options.length === 0 && <li className="py-2 text-sm text-slate-500">Keine passenden Übungen gefunden.</li>}
      </ul>
    </div>
  );
}

function Row({ v, onClick }: { v: MuscleVolume; onClick: () => void }) {
  const pct = (x: number) => `${Math.min(100, (x / SCALE_MAX) * 100)}%`;
  return (
    <li>
      <button type="button" onClick={onClick} className="grid w-full grid-cols-[7.5rem_1fr_3.5rem] items-center gap-2 text-left text-sm">
        <span className="truncate text-slate-300">{v.muscle}</span>
        <span className="relative h-2.5 rounded-full bg-slate-800">
          <span className="absolute inset-y-0 rounded-full bg-slate-700" style={{ left: pct(v.min), width: `calc(${pct(v.max)} - ${pct(v.min)})` }} />
          <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: pct(v.sets), background: COLOR[tone(v)] }} />
        </span>
        <span className="text-right tabular-nums">{fmtNumber(v.sets, 1)}</span>
      </button>
    </li>
  );
}
