/**
 * Geräteauswahl: erst Hersteller wählen, dann die komplette Liste des Herstellers –
 * nach Bereich gruppiert, Gerätename vorne, Produktlinie hinten, ohne Modellnummern.
 * Alternativ „Ohne Hersteller“: nur die Übung wählen.
 */
import { useMemo, useState } from 'react';
import { MuscleTile } from '../../components/MuscleIcon';
import { useLiveQuery } from 'dexie-react-hooks';
import { all } from '../../local/db';
import { SPLIT_LABEL } from '../../domain/dashboard';
import { isCardioExercise, type EquipmentModel, type Exercise, type Split } from '../../model/types';

const NONE = '__none__';
const SPLITS: Split[] = ['push', 'pull', 'legs', 'other'];

export interface PickResult {
  exercise: Exercise;
  model?: EquipmentModel;
}

export function ModelPicker({
  onPick,
  preferExerciseId,
  allowNoModel = true,
}: {
  onPick: (r: PickResult) => void;
  /** passende Übung (z. B. beim Zuordnen eines bestehenden Geräts) – wird oben gezeigt */
  preferExerciseId?: string;
  allowNoModel?: boolean;
}) {
  const data = useLiveQuery(async () => {
    const [models, mfs, exercises] = await Promise.all([all('equipmentModels'), all('manufacturers'), all('exercises')]);
    const strength = models.filter((m) => m.kind !== 'cardio' && m.exerciseId);
    const withModels = new Set(strength.map((m) => m.manufacturerId));
    return {
      models: strength,
      manufacturers: mfs.filter((m) => withModels.has(m.id)).sort((a, b) => a.name.localeCompare(b.name, 'de')),
      exercises: new Map(exercises.map((e) => [e.id, e])),
    };
  }, []);
  const [mf, setMf] = useState('');
  const [line, setLine] = useState('');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    if (!data || !mf || mf === NONE) return [];
    const t = q.trim().toLowerCase();
    return data.models
      .filter((m) => m.manufacturerId === mf && (!line || m.line === line))
      .filter((m) => !t || `${m.name} ${m.line} ${data.exercises.get(m.exerciseId!)?.name}`.toLowerCase().includes(t))
      .sort((a, b) => a.name.localeCompare(b.name, 'en') || (a.line ?? '').localeCompare(b.line ?? ''));
  }, [data, mf, line, q]);

  const lines = useMemo(
    () => [...new Set((data?.models ?? []).filter((m) => m.manufacturerId === mf).map((m) => m.line ?? ''))].filter(Boolean).sort(),
    [data, mf],
  );

  const exercisesNoModel = useMemo(() => {
    if (!data || mf !== NONE) return [];
    const t = q.trim().toLowerCase();
    return [...data.exercises.values()]
      .filter((e) => !isCardioExercise(e) && (!t || e.name.toLowerCase().includes(t) || e.muscleGroup?.toLowerCase().includes(t)))
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }, [data, mf, q]);

  if (!data) return null;
  const exOf = (m: EquipmentModel) => data.exercises.get(m.exerciseId!)!;
  const preferred = preferExerciseId ? list.filter((m) => m.exerciseId === preferExerciseId) : [];

  return (
    <div className="space-y-3">
      <select
        className="input"
        aria-label="Hersteller"
        value={mf}
        onChange={(e) => {
          setMf(e.target.value);
          setLine('');
          setQ('');
        }}
      >
        <option value="">Hersteller wählen …</option>
        {data.manufacturers.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
        {allowNoModel && <option value={NONE}>Anderer / unbekannt – nur Übung wählen</option>}
      </select>

      {mf && mf !== NONE && (
        <>
          {lines.length > 1 && (
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
              {['', ...lines].map((l) => (
                <button
                  key={l || 'all'}
                  type="button"
                  onClick={() => setLine(l)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ${line === l ? 'bg-white text-black' : 'bg-slate-800 text-slate-300'}`}
                >
                  {l || 'Alle'}
                </button>
              ))}
            </div>
          )}
          <input className="input" placeholder="Filtern, z. B. „press“ oder „Latzug“" value={q} onChange={(e) => setQ(e.target.value)} />
          {preferred.length > 0 && (
            <Group title={`Passend zu ${data.exercises.get(preferExerciseId!)?.name}`}>
              {preferred.map((m) => (
                <ModelRow key={m.id} model={m} exercise={exOf(m)} onPick={() => onPick({ exercise: exOf(m), model: m })} />
              ))}
            </Group>
          )}
          {SPLITS.map((s) => {
            const items = list.filter((m) => exOf(m)?.split === s);
            if (!items.length) return null;
            return (
              <Group key={s} title={SPLIT_LABEL[s] === 'Frei' ? 'Rumpf & Sonstiges' : SPLIT_LABEL[s]}>
                {items.map((m) => (
                  <ModelRow key={m.id} model={m} exercise={exOf(m)} onPick={() => onPick({ exercise: exOf(m), model: m })} />
                ))}
              </Group>
            );
          })}
          {list.length === 0 && <p className="text-sm text-slate-500">Nichts gefunden.</p>}
          {allowNoModel && (
            <button type="button" className="w-full py-2 text-sm text-slate-400" onClick={() => setMf(NONE)}>
              Gerät nicht dabei? Nur die Übung wählen ›
            </button>
          )}
        </>
      )}

      {mf === NONE && (
        <>
          <input className="input" placeholder="Übung suchen" value={q} onChange={(e) => setQ(e.target.value)} />
          {SPLITS.map((s) => {
            const items = exercisesNoModel.filter((e) => e.split === s);
            if (!items.length) return null;
            return (
              <Group key={s} title={SPLIT_LABEL[s] === 'Frei' ? 'Rumpf & Sonstiges' : SPLIT_LABEL[s]}>
                {items.map((e) => (
                  <li key={e.id}>
                    <button type="button" className="w-full px-3 py-2.5 text-left" onClick={() => onPick({ exercise: e })}>
                      {e.name}
                      <span className="block text-xs text-slate-500">{e.muscleGroup}</span>
                    </button>
                  </li>
                ))}
              </Group>
            );
          })}
        </>
      )}

      {!mf && (
        <p className="text-xs text-slate-500">
          Mit Hersteller und Modell werden deine Werte am gleichen Gerät in anderen Gyms vergleichbar.
        </p>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="label">{title}</h3>
      <ul className="divide-y divide-slate-800 rounded-2xl bg-slate-800/50">{children}</ul>
    </section>
  );
}

function ModelRow({ model, exercise, onPick }: { model: EquipmentModel; exercise?: Exercise; onPick: () => void }) {
  return (
    <li>
      <button type="button" className="flex w-full items-center gap-3 px-3 py-2.5 text-left" onClick={onPick}>
        <MuscleTile muscle={exercise?.muscleGroup} exerciseId={exercise?.id} />
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{model.name}</span>
          <span className="block text-xs text-slate-500">{exercise?.name}</span>
        </span>
        <span className="shrink-0 text-right text-xs text-slate-400">{model.line}</span>
      </button>
    </li>
  );
}
