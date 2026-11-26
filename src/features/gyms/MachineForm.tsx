import { useEffect, useState } from 'react';
import { Button, Field, Modal } from '../../components/ui';
import { save } from '../../local/db';
import type { GymMachine } from '../../model/types';
import { ModelPicker } from './ModelPicker';

/** Gerät zu einem Gym hinzufügen: Hersteller → Modell, oder nur die Übung. */
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
  const [pick, setPick] = useState<{ exerciseId: string; exerciseName: string; modelId?: string; modelName?: string; label: string; step: number } | null>(
    null,
  );

  useEffect(() => {
    if (!open) setPick(null);
  }, [open]);

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
        <ModelPicker
          preferExerciseId={presetExercise}
          onPick={({ exercise, model }) =>
            setPick({
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              modelId: model?.id,
              modelName: model ? `${model.name} · ${model.line ?? ''}` : undefined,
              label: exercise.name,
              step: model?.weightStepKg ?? 2.5,
            })
          }
        />
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
