import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, EmptyState, Field, Modal, PageHeader } from '../../components/ui';
import { all, currentUserId, db, patch, remove, save } from '../../local/db';
import { gymMachines, type MachineView } from '../../local/queries';
import { SPLIT_LABEL } from '../../domain/dashboard';
import type { Split } from '../../model/types';
import { AddMachineModal } from './MachineForm';

const SPLIT_ORDER: Split[] = ['push', 'pull', 'legs', 'other'];

export function GymPage() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const gym = useLiveQuery(() => db.gyms.get(id), [id]);
  const machines = useLiveQuery(() => gymMachines(id), [id]);
  const me = useLiveQuery(currentUserId, []);
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState<MachineView | null>(null);

  if (gym === undefined) return null;
  if (!gym)
    return (
      <>
        <PageHeader title="Gym" back={() => nav('/gyms')} />
        <EmptyState title="Gym nicht gefunden." />
      </>
    );

  const groups = SPLIT_ORDER.map((s) => ({
    split: s,
    items: (machines ?? []).filter((m) => (m.exercise?.split ?? 'other') === s).sort((a, b) => a.label.localeCompare(b.label, 'de')),
  })).filter((g) => g.items.length);

  const leave = async () => {
    if (!confirm(`„${gym.name}“ aus deinen Gyms entfernen? Deine Trainings bleiben erhalten.`)) return;
    for (const l of (await all('userGyms')).filter((l) => l.gymId === id)) await remove('userGyms', l.id);
    nav('/gyms');
  };

  return (
    <>
      <PageHeader title={gym.name} back={() => nav('/gyms')} right={<Button onClick={() => setAdding(true)}>+ Gerät</Button>} />
      <p className="-mt-2 mb-4 text-sm text-slate-500">{[gym.chain, gym.address, gym.city].filter(Boolean).join(' · ')}</p>

      {machines?.length === 0 && (
        <EmptyState title="Noch keine Geräte erfasst.">
          <p className="mb-3 text-sm">Was du hier anlegst, sehen auch andere Mitglieder dieses Gyms.</p>
          <Button onClick={() => setAdding(true)}>Erstes Gerät hinzufügen</Button>
        </EmptyState>
      )}

      <div className="space-y-4">
        {groups.map((g) => (
          <section key={g.split}>
            <h2 className="mb-1.5 text-sm font-semibold text-slate-400">
              {SPLIT_LABEL[g.split]} <span className="font-normal">· {g.items.length}</span>
            </h2>
            <Card className="divide-y divide-slate-700 p-0">
              {g.items.map((m) => (
                <button key={m.id} type="button" className="block w-full px-4 py-2.5 text-left" onClick={() => setOpen(m)}>
                  <span className="font-medium">{m.label}</span>
                  <span className="block text-xs text-slate-500">
                    {m.exercise?.name}
                    {m.modelTitle ? ` · ${m.manufacturer?.name ?? ''} ${m.model?.line ?? ''}` : ' · ohne Modell'} · {m.weightStepKg} kg Schritte
                  </span>
                </button>
              ))}
            </Card>
          </section>
        ))}
      </div>

      <button type="button" className="mt-8 w-full py-2 text-sm text-slate-500" onClick={leave}>
        Gym aus meiner Liste entfernen
      </button>

      <AddMachineModal gymId={id} open={adding} onClose={() => setAdding(false)} />
      {open && <MachineModal machine={open} mine={open.createdBy === me} onClose={() => setOpen(null)} />}
    </>
  );
}

function MachineModal({ machine, mine, onClose }: { machine: MachineView; mine: boolean; onClose: () => void }) {
  const note = useLiveQuery(async () => (await all('machineNotes')).find((n) => n.machineId === machine.id), [machine.id]);
  const [text, setText] = useState<string | null>(null);
  const [step, setStep] = useState(String(machine.weightStepKg));
  const value = text ?? note?.note ?? '';

  const saveAll = async () => {
    if (text !== null) {
      if (note) await patch('machineNotes', note.id, { note: text });
      else if (text.trim()) await save('machineNotes', { machineId: machine.id, note: text });
    }
    const s = Number(step.replace(',', '.'));
    if (mine && s > 0 && s !== machine.weightStepKg) await patch('gymMachines', machine.id, { weightStepKg: s });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={machine.label}>
      <div className="space-y-3 text-sm">
        <p className="text-slate-400">
          {machine.exercise?.name}
          <br />
          {machine.modelTitle ?? 'Kein Modell hinterlegt'}
        </p>
        <Field label="Meine Einstellungen (privat)">
          <textarea className="input" rows={2} placeholder="z. B. Sitz 4, Polster 2" value={value} onChange={(e) => setText(e.target.value)} />
        </Field>
        <Field label="Gewichtssprung (kg)">
          <input className="input" inputMode="decimal" disabled={!mine} value={step} onChange={(e) => setStep(e.target.value)} />
        </Field>
        {!mine && <p className="text-xs text-slate-500">Von einem anderen Mitglied angelegt – nur der Ersteller kann es ändern.</p>}
        <div className="flex gap-2">
          {mine && (
            <Button
              variant="danger"
              onClick={async () => {
                if (!confirm('Gerät für alle entfernen? Deine bisherigen Sätze bleiben erhalten.')) return;
                await remove('gymMachines', machine.id);
                onClose();
              }}
            >
              Löschen
            </Button>
          )}
          <Button className="flex-1" onClick={saveAll}>
            Speichern
          </Button>
        </div>
      </div>
    </Modal>
  );
}
