import { useState } from 'react';
import { ChevronRight, ExternalLink } from 'lucide-react';
import { UscPlans } from './UscPlans';
import { MergeGym } from './MergeGym';
import { MuscleTile } from '../../components/MuscleIcon';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, EmptyState, Field, Modal, PageHeader, Segmented, StatRow } from '../../components/ui';
import { all, currentUserId, db, patch, remove, save } from '../../local/db';
import { counted, gymMachines, type MachineView } from '../../local/queries';
import { e1rm } from '../../domain/metrics';
import { fmtNumber } from '../../domain/units';
import { SPLIT_LABEL } from '../../domain/dashboard';
import type { Split } from '../../model/types';
import { AddMachineModal } from './MachineForm';
import { ModelPicker } from './ModelPicker';

const SPLIT_ORDER: Split[] = ['push', 'pull', 'legs', 'other'];

export function GymPage() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const gym = useLiveQuery(() => db.gyms.get(id), [id]);
  const machines = useLiveQuery(() => gymMachines(id), [id]);
  const me = useLiveQuery(currentUserId, []);
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState<MachineView | null>(null);
  const [sort, setSort] = useState<'split' | 'exercise' | 'az'>('split');
  const stats = useLiveQuery(async () => {
    const sessions = (await db.sessions.where('gymId').equals(id).toArray()).filter((s) => !s.deletedAt);
    const machineIds = new Set((await db.gymMachines.where('gymId').equals(id).toArray()).map((m) => m.id));
    const perMachine = new Map<string, { best: { w: number; r: number; v: number }; last: number }>();
    for (const st of (await db.sets.toArray()).filter((x) => counted(x) && x.machineId && machineIds.has(x.machineId))) {
      const cur = perMachine.get(st.machineId!) ?? { best: { w: 0, r: 0, v: -1 }, last: 0 };
      const v = e1rm(st.weightKg ?? 0, st.reps ?? 0);
      if (v > cur.best.v) cur.best = { w: st.weightKg ?? 0, r: st.reps ?? 0, v };
      cur.last = Math.max(cur.last, st.createdAt);
      perMachine.set(st.machineId!, cur);
    }
    return { visits: sessions.length, last: Math.max(0, ...sessions.map((x) => x.startedAt)), perMachine };
  }, [id]);

  if (gym === undefined) return null;
  if (!gym)
    return (
      <>
        <PageHeader title="Gym" back={() => nav('/gyms')} />
        <EmptyState title="Gym nicht gefunden." />
      </>
    );

  const sorted = [...(machines ?? [])].sort((a, b) => a.label.localeCompare(b.label, 'de'));
  const groups =
    sort === 'split'
      ? SPLIT_ORDER.map((s) => ({ key: s, title: SPLIT_LABEL[s], items: sorted.filter((m) => (m.exercise?.split ?? 'other') === s) }))
      : sort === 'exercise'
        ? [...new Set(sorted.map((m) => m.exercise?.name ?? '?'))]
            .sort((a, b) => a.localeCompare(b, 'de'))
            .map((n) => ({ key: n, title: n, items: sorted.filter((m) => (m.exercise?.name ?? '?') === n) }))
        : [{ key: 'az', title: '', items: sorted }];
  const lastVisit = stats?.last ? relDay(stats.last, true) : '—';
  const leave = async () => {
    if (!confirm(`„${gym.name}“ aus deinen Gyms entfernen? Deine Trainings bleiben erhalten.`)) return;
    for (const l of (await all('userGyms')).filter((l) => l.gymId === id)) await remove('userGyms', l.id);
    nav('/gyms');
  };

  return (
    <>
      <PageHeader
        title={gym.name}
        subtitle={
          <>
            {[gym.address, gym.district, gym.city].filter(Boolean).join(' · ')}
            {gym.uscPlans && (
              <span className="mt-1.5 flex flex-wrap items-center gap-2">
                <UscPlans plans={gym.uscPlans} />
                {gym.sourceUrl && (
                  <a href={gym.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-xs text-slate-400 underline">
                    bei USC ansehen <ExternalLink size={11} />
                  </a>
                )}
              </span>
            )}
          </>
        }
        back={() => nav('/gyms')}
        right={<Button onClick={() => setAdding(true)}>+ Gerät</Button>}
      />
      <StatRow
        items={[
          { label: 'Besuche', value: stats?.visits ?? 0 },
          { label: 'Letzter Besuch', value: lastVisit },
          { label: 'Geräte', value: machines?.length ?? 0 },
        ]}
      />

      {machines?.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="Noch keine Geräte erfasst.">
            <p className="mb-3 text-sm">Was du hier anlegst, sehen auch andere Mitglieder dieses Gyms.</p>
            <Button onClick={() => setAdding(true)}>Erstes Gerät hinzufügen</Button>
          </EmptyState>
        </div>
      ) : (
        <>
          <h2 className="section-title">Geräte</h2>
          <Segmented
            value={sort}
            onChange={setSort}
            options={[
              { value: 'split', label: 'Bereich' },
              { value: 'exercise', label: 'Übung' },
              { value: 'az', label: 'A–Z' },
            ]}
          />
        </>
      )}

      <div className="mt-4 space-y-5">
        {groups
          .filter((g) => g.items.length)
          .map((g) => (
            <section key={g.key}>
              {g.title && (
                <h3 className="mb-2 text-base font-semibold">
                  {g.title} <span className="font-normal text-slate-500">{g.items.length}</span>
                </h3>
              )}
              <Card className="divide-y divide-slate-800 p-0">
                {g.items.map((m) => {
                  const st = stats?.perMachine.get(m.id);
                  return (
                    <button key={m.id} type="button" className="flex w-full items-center gap-3 px-4 py-3 text-left" onClick={() => setOpen(m)}>
                      <MuscleTile muscle={m.exercise?.muscleGroup} exerciseId={m.exerciseId} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{m.label}</span>
                        <span className="block truncate text-xs text-slate-500">{m.modelTitle ?? `${m.exercise?.name ?? ''} · ohne Modell`}</span>
                      </span>
                      {st && st.best.v > 0 && (
                        <span className="shrink-0 text-right text-sm">
                          <span className="font-semibold tabular-nums">
                            <span className="text-best">✦</span> {fmtNumber(st.best.w)} × {st.best.r}
                          </span>
                          <span className="block text-xs text-slate-500">{relDay(st.last)}</span>
                        </span>
                      )}
                      <ChevronRight size={18} className="text-slate-600" />
                    </button>
                  );
                })}
              </Card>
            </section>
          ))}
      </div>

      {gym.createdBy && gym.createdBy === me && !gym.uscPlans && <MergeGym gym={gym} />}

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
  const [choosing, setChoosing] = useState(false);
  const current = useLiveQuery(async () => {
    const m = await db.gymMachines.get(machine.id);
    const model = m?.modelId ? await db.equipmentModels.get(m.modelId) : undefined;
    const mf = model ? await db.manufacturers.get(model.manufacturerId) : undefined;
    return { model, mf };
  }, [machine.id]);
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
    <>
    <Modal open={choosing} onClose={() => setChoosing(false)} title="Modell zuordnen">
      <ModelPicker
        preferExerciseId={machine.exerciseId}
        allowNoModel={false}
        onPick={async ({ model }) => {
          if (model) await patch('gymMachines', machine.id, { modelId: model.id });
          setChoosing(false);
        }}
      />
      {current?.model && (
        <button
          type="button"
          className="mt-3 w-full py-2 text-sm text-slate-400"
          onClick={async () => {
            await patch('gymMachines', machine.id, { modelId: undefined });
            setChoosing(false);
          }}
        >
          Modell entfernen
        </button>
      )}
    </Modal>
    <Modal open={!choosing} onClose={onClose} title={machine.label}>
      <div className="space-y-3 text-sm">
        <p className="text-slate-400">{machine.exercise?.name}</p>
        <div className="flex items-center gap-3 rounded-2xl bg-slate-800/60 px-3 py-2.5">
          <span className="min-w-0 flex-1">
            <span className="label mb-0">Modell</span>
            {current?.model ? (
              <>
                <span className="block font-medium text-slate-100">{current.model.name}</span>
                <span className="block text-xs text-slate-500">{[current.mf?.name, current.model.line].filter(Boolean).join(' ')}</span>
              </>
            ) : (
              <span className="block text-slate-400">Kein Modell hinterlegt</span>
            )}
          </span>
          {mine && (
            <Button variant="secondary" className="min-h-9 px-3 py-1 text-sm" onClick={() => setChoosing(true)}>
              {current?.model ? 'Ändern' : 'Zuordnen'}
            </Button>
          )}
        </div>
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
    </>
  );
}

function relDay(ts: number, short = false): string {
  const d = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(ts).setHours(0, 0, 0, 0)) / 86400000);
  if (d <= 0) return 'Heute';
  if (d === 1) return 'Gestern';
  if (d < 7) return short ? `vor ${d} T.` : `vor ${d} Tagen`;
  return new Date(ts).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}
