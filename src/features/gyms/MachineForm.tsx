import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Button, Field, Modal } from '../../components/ui';
import { all, save } from '../../local/db';
import { searchModels } from '../../local/queries';
import type { GymMachine } from '../../model/types';

/** Gerät zu einem Gym hinzufügen: Modell aus dem Katalog suchen oder nur die Übung wählen. */
export function AddMachineModal({
  gymId,
  open,
  onClose,
  exerciseId: presetExercise,
  onCreated,
}: {
  gymId: string;
  open: boolean;
  onClose: () => void;
  /** Vorauswahl, z. B. wenn im Training ein Gerät fehlt */
  exerciseId?: string;
  onCreated?: (m: GymMachine) => void;
}) {
  const [q, setQ] = useState('');
  const [pick, setPick] = useState<{ exerciseId: string; modelId?: string; label: string; step: number } | null>(null);
  const exercises = useLiveQuery(() => all('exercises'), []);
  const models = useLiveQuery(() => (q.trim().length >= 2 || presetExercise ? searchModels(q, presetExercise) : Promise.resolve([])), [q, presetExercise]);

  useEffect(() => {
    if (!open) {
      setQ('');
      setPick(null);
    }
  }, [open]);

  const exMatches = (exercises ?? [])
    .filter((e) => (presetExercise ? e.id === presetExercise : q.trim() && e.name.toLowerCase().includes(q.trim().toLowerCase())))
    .slice(0, 8);

  const create = async () => {
    if (!pick) return;
    const m = await save('gymMachines', {
      gymId,
      exerciseId: pick.exerciseId,
      modelId: pick.modelId,
      label: pick.label.trim(),
      weightStepKg: pick.step,
    });
    onCreated?.(m);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Gerät hinzufügen">
      {!pick ? (
        <div className="space-y-3">
          <input
            className="input"
            placeholder="Hersteller, Linie oder Gerät – z. B. „hoist brust“"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />
          {!!models?.length && (
            <section>
              <h3 className="mb-1 text-xs font-semibold uppercase text-slate-500">Gerätemodelle</h3>
              <ul className="divide-y divide-slate-700">
                {models.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      className="w-full py-2 text-left text-sm"
                      onClick={() => setPick({ exerciseId: m.exerciseId!, modelId: m.id, label: m.name, step: m.weightStepKg ?? 2.5 })}
                    >
                      {m.title}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {!!exMatches.length && (
            <section>
              <h3 className="mb-1 text-xs font-semibold uppercase text-slate-500">Ohne Modell (nur Übung)</h3>
              <ul className="divide-y divide-slate-700">
                {exMatches.map((e) => (
                  <li key={e.id}>
                    <button type="button" className="w-full py-2 text-left text-sm" onClick={() => setPick({ exerciseId: e.id, label: e.name, step: 2.5 })}>
                      {e.name} <span className="text-xs text-slate-500">· {e.muscleGroup}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <p className="text-xs text-slate-500">
            Mit Modell werden deine Werte mit demselben Gerät in anderen Gyms vergleichbar. Modell nicht im Katalog? Wähle die Übung und benenne das Gerät
            selbst.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">{exercises?.find((e) => e.id === pick.exerciseId)?.name}</p>
          <Field label="Name im Gym">
            <input className="input" value={pick.label} onChange={(e) => setPick({ ...pick, label: e.target.value })} />
          </Field>
          <Field label="Kleinster Gewichtssprung (kg)">
            <input
              className="input"
              inputMode="decimal"
              value={pick.step}
              onChange={(e) => setPick({ ...pick, step: Number(e.target.value.replace(',', '.')) || 0 })}
            />
          </Field>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setPick(null)}>
              Zurück
            </Button>
            <Button className="flex-1" disabled={!pick.label.trim() || !(pick.step > 0)} onClick={create}>
              Hinzufügen
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
