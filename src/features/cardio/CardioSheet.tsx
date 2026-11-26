/** Ein einziges Formular für Cardio – eigenständig oder als Teil eines Krafttrainings. */
import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { CardioIcon } from '../../components/CardioIcon';
import { Button, Field, Modal, Stepper } from '../../components/ui';
import { getMeta, patch, remove, save, setMeta } from '../../local/db';
import { isoOf } from '../../domain/dashboard';
import { fmtNumber, parseNum } from '../../domain/units';
import { CARDIO_KINDS, cardioKind, type CardioEntry } from '../../model/types';

export function CardioSheet({
  open,
  onClose,
  entry,
  sessionId,
  gymId,
}: {
  open: boolean;
  onClose: () => void;
  /** bestehender Eintrag zum Bearbeiten */
  entry?: CardioEntry;
  /** im laufenden Training: Eintrag gehört zu diesem Training */
  sessionId?: string;
  gymId?: string;
}) {
  const [kind, setKind] = useState('treadmill');
  const [minutes, setMinutes] = useState<number | undefined>(20);
  const [km, setKm] = useState('');
  const [kcal, setKcal] = useState('');
  const [date, setDate] = useState(isoOf(Date.now()));

  useEffect(() => {
    if (!open) return;
    if (entry) {
      setKind(entry.kind);
      setMinutes(entry.durationMin);
      setKm(entry.distanceKm ? fmtNumber(entry.distanceKm, 2) : '');
      setKcal(entry.kcal ? String(entry.kcal) : '');
      setDate(entry.date);
    } else {
      getMeta<string>('lastCardioKind').then((k) => k && setKind(k));
      setMinutes(sessionId ? 10 : 20);
      setKm('');
      setKcal('');
      setDate(isoOf(Date.now()));
    }
  }, [open, entry, sessionId]);

  const k = cardioKind(kind);
  const valid = !!minutes && minutes > 0;

  const submit = async () => {
    if (!valid) return;
    const data = {
      kind,
      durationMin: minutes!,
      distanceKm: k.distance ? parseNum(km) : undefined,
      kcal: parseNum(kcal),
      date,
    };
    if (entry) await patch('cardio', entry.id, data);
    else await save('cardio', { ...data, sessionId, gymId, createdAt: Date.now() });
    await setMeta('lastCardioKind', kind);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={entry ? 'Cardio bearbeiten' : 'Cardio eintragen'}>
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-1.5">
          {CARDIO_KINDS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setKind(c.id)}
              className={`flex flex-col items-center rounded-2xl px-1 py-2 text-[10px] leading-tight ${kind === c.id ? 'bg-white text-black' : 'bg-slate-800 text-slate-300'}`}
            >
              <CardioIcon kind={c.id} size={22} className="mb-1" />
              {c.label}
            </button>
          ))}
        </div>
        <Stepper label="Dauer (min)" value={minutes} onChange={setMinutes} step={5} />
        <div className="grid grid-cols-2 gap-2">
          {k.distance && (
            <Field label="Distanz (km)">
              <input className="input text-center" inputMode="decimal" placeholder="optional" value={km} onChange={(e) => setKm(e.target.value)} />
            </Field>
          )}
          <Field label="Kalorien">
            <input className="input text-center" inputMode="numeric" placeholder="optional" value={kcal} onChange={(e) => setKcal(e.target.value)} />
          </Field>
        </div>
        {!sessionId && !entry?.sessionId && (
          <Field label="Datum">
            <input className="input" type="date" value={date} max={isoOf(Date.now())} onChange={(e) => setDate(e.target.value)} />
          </Field>
        )}
        <div className="flex gap-2">
          {entry && (
            <Button
              variant="danger"
              onClick={async () => {
                await remove('cardio', entry.id);
                onClose();
              }}
            >
              Löschen
            </Button>
          )}
          <Button className="flex-1" disabled={!valid} onClick={submit}>
            Speichern
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** Kompakte Zeile für einen Cardio-Eintrag */
export function CardioRow({ entry, onClick }: { entry: CardioEntry; onClick?: () => void }) {
  const k = cardioKind(entry.kind);
  const pace = entry.distanceKm && entry.durationMin ? entry.durationMin / entry.distanceKm : undefined;
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-card bg-slate-900 px-4 py-3 text-left active:bg-slate-800">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-best/15 text-best" aria-hidden>
        <CardioIcon kind={k.id} size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{k.label}</span>
        <span className="block text-sm text-slate-500">
          {[
            `${fmtNumber(entry.durationMin, 0)} min`,
            entry.distanceKm ? `${fmtNumber(entry.distanceKm, 2)} km` : '',
            pace && entry.kind !== 'cycling' && entry.kind !== 'bike' ? `${Math.floor(pace)}:${String(Math.round((pace % 1) * 60)).padStart(2, '0')} /km` : '',
            entry.kcal ? `${entry.kcal} kcal` : '',
          ]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </span>
      {onClick && <ChevronRight size={18} className="text-slate-600" />}
    </button>
  );
}
