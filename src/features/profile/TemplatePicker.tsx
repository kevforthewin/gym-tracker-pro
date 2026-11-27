import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from '../../components/ui';
import { slotById, TEMPLATES } from '../../domain/slots';
import { all, save } from '../../local/db';
import { createPlanFromTemplate } from '../../local/plans';

/** Neuer Plan: aus Vorlage oder leer */
export function TemplatePicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);
  const [freq, setFreq] = useState<Record<string, number>>({});

  const take = async (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id)!;
    const plan = await createPlanFromTemplate(id, freq[id] ?? t.frequencies[0]);
    onClose();
    nav(`/plan/${plan.id}`);
  };
  const empty = async () => {
    // Name lässt sich im Plan über „Name ändern“ anpassen
    const plan = await save('plans', { name: 'Mein Plan', order: (await all('plans')).length });
    onClose();
    nav(`/plan/${plan.id}`);
  };

  return (
    <Modal open={open} onClose={onClose} title="Neuer Plan">
      <p className="mb-3 text-sm text-slate-400">
        Vorlagen enthalten Bewegungen statt fester Geräte. Im Gym wird automatisch die passende Übung gewählt – je nachdem, was dort steht.
      </p>
      <div className="space-y-2">
        {TEMPLATES.map((t) => {
          const f = freq[t.id] ?? t.frequencies[0];
          const expanded = openId === t.id;
          return (
            <div key={t.id} className="rounded-2xl bg-slate-800/60 p-3">
              <button type="button" className="flex w-full items-start justify-between text-left" onClick={() => setOpenId(expanded ? null : t.id)}>
                <span>
                  <span className="block font-semibold">{t.name}</span>
                  <span className="block text-xs text-slate-400">{t.description}</span>
                </span>
                <span className="chip ml-2 shrink-0 bg-slate-700 text-slate-200">{t.frequencies.join(' / ')}× pro Woche</span>
              </button>
              {expanded && (
                <div className="mt-3 space-y-3">
                  {t.days.map((d) => (
                    <div key={d.name}>
                      <p className="text-sm font-semibold">{d.name}</p>
                      <p className="text-xs text-slate-400">{d.slots.map((s) => slotById(s)?.label).join(' · ')}</p>
                    </div>
                  ))}
                  {t.frequencies.length > 1 && (
                    <div className="flex gap-2">
                      {t.frequencies.map((x) => (
                        <button
                          key={x}
                          type="button"
                          onClick={() => setFreq({ ...freq, [t.id]: x })}
                          className={`flex-1 rounded-full py-2 text-sm font-semibold ${f === x ? 'bg-white text-black' : 'bg-slate-700 text-slate-300'}`}
                        >
                          {x}× pro Woche
                        </button>
                      ))}
                    </div>
                  )}
                  <Button className="w-full" onClick={() => take(t.id)}>
                    Übernehmen
                  </Button>
                  <p className="text-[11px] text-slate-500">Setzt dein Wochenziel auf {f}×. Danach kannst du alles anpassen.</p>
                </div>
              )}
            </div>
          );
        })}
        <Button variant="ghost" className="w-full" onClick={empty}>
          Leeren Plan anlegen
        </Button>
      </div>
    </Modal>
  );
}
