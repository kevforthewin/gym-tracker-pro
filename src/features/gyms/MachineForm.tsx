import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Button, Field, Modal } from '../../components/ui';
import { save } from '../../local/db';
import { SPLIT_LABEL } from '../../domain/dashboard';
import type { GymMachine, Split } from '../../model/types';
import { ModelPicker, type PickResult } from './ModelPicker';

/**
 * Gerät zu einem Gym hinzufügen: Hersteller → Modell, oder nur die Übung.
 * Schnell-Modus (Standard): Ein Tipp fügt das Gerät hinzu, die Liste bleibt offen – so lassen sich
 * mehrere Geräte nacheinander erfassen. Name und Gewichtssprung lassen sich später am Gerät ändern.
 * Mit `onCreated` (z. B. aus dem Training): erst Details prüfen, dann schließen.
 */
export function AddMachineModal({
  gymId,
  open,
  onClose,
  exerciseId: presetExercise,
  onCreated,
  split,
}: {
  gymId: string;
  open: boolean;
  onClose: () => void;
  /** Vorauswahl, z. B. wenn im Training ein Gerät fehlt */
  exerciseId?: string;
  onCreated?: (m: GymMachine) => void;
  /** nur Geräte dieses Bereichs anzeigen */
  split?: Split;
}) {
  const quick = !onCreated;
  const [pick, setPick] = useState<{ exerciseId: string; exerciseName: string; modelId?: string; modelName?: string; label: string; step: number } | null>(
    null,
  );
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [last, setLast] = useState('');

  useEffect(() => {
    if (!open) {
      setPick(null);
      setAdded(new Set());
      setLast('');
    }
  }, [open]);

  const store = async (exerciseId: string, label: string, step: number, modelId?: string) =>
    save('gymMachines', { gymId, exerciseId, modelId, label: label.trim(), weightStepKg: step });

  const onPick = async ({ exercise, model }: PickResult) => {
    if (quick) {
      await store(exercise.id, exercise.name, model?.weightStepKg ?? 2.5, model?.id);
      setAdded((s) => new Set(s).add(model ? `m:${model.id}` : `e:${exercise.id}`));
      setLast(model ? `${model.name} (${exercise.name})` : exercise.name);
      return;
    }
    setPick({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      modelId: model?.id,
      modelName: model ? `${model.name} · ${model.line ?? ''}` : undefined,
      label: exercise.name,
      step: model?.weightStepKg ?? 2.5,
    });
  };

  const create = async () => {
    if (!pick) return;
    const m = await store(pick.exerciseId, pick.label, pick.step, pick.modelId);
    onCreated?.(m);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={split ? `Gerät hinzufügen · ${split === 'other' ? 'Rumpf' : SPLIT_LABEL[split]}` : 'Gerät hinzufügen'}>
      {!pick ? (
        <>
          {quick && (
            <p className="mb-3 text-xs text-slate-500">Antippen fügt das Gerät sofort hinzu – du kannst mehrere nacheinander wählen.</p>
          )}
          <ModelPicker preferExerciseId={presetExercise} split={split} added={added} onPick={onPick} />
          {quick && added.size > 0 && (
            <div className="sticky bottom-0 -mx-5 mt-3 flex items-center gap-3 border-t border-slate-800 bg-slate-900 px-5 pb-1 pt-3">
              <span className="min-w-0 flex-1 text-sm">
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <Check size={16} /> {added.size} {added.size === 1 ? 'Gerät' : 'Geräte'} hinzugefügt
                </span>
                <span className="block truncate text-xs text-slate-500">Zuletzt: {last}</span>
              </span>
              <Button onClick={onClose}>Fertig</Button>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            {pick.exerciseName}
            {pick.modelName && <span className="block text-xs text-slate-500">{pick.modelName}</span>}
          </p>
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
