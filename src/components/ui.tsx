import { type ButtonHTMLAttributes, type ReactNode, useEffect } from 'react';
import { ChevronLeft, X } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent';
const variants: Record<Variant, string> = {
  primary: 'bg-white text-black active:bg-slate-200 disabled:bg-white/30 disabled:text-black/50',
  accent: 'bg-emerald-500 text-black active:bg-emerald-600 disabled:bg-emerald-500/30',
  secondary: 'bg-slate-800 text-slate-50 active:bg-slate-700 disabled:text-slate-500',
  danger: 'bg-red-500/15 text-red-400 active:bg-red-500/25',
  ghost: 'text-slate-400 active:bg-slate-800',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2 font-semibold transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

/** Runder Icon-Button (z. B. ⋯, Zurück) */
export function IconButton({ label, children, onClick, className = '' }: { label: string; children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-lg text-slate-200 active:bg-slate-700 ${className}`}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-card bg-slate-900 p-4 ${className}`}>{children}</div>;
}

/** Großer Seitentitel im iOS-Stil; mit `back` kompakte Kopfzeile mit Zurück-Knopf. */
export function PageHeader({ title, subtitle, right, back }: { title: string; subtitle?: ReactNode; right?: ReactNode; back?: () => void }) {
  return (
    <header className="mb-5 pt-[max(env(safe-area-inset-top),0.75rem)]">
      <div className="flex min-h-10 items-center justify-between gap-2">
        {back ? (
          <IconButton label="Zurück" onClick={back}>
            <ChevronLeft size={22} strokeWidth={2} />
          </IconButton>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">{right}</div>
      </div>
      <h1 className="mt-2 text-[2rem] font-bold leading-tight tracking-tight">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
    </header>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-slate-700 p-6 text-center text-slate-400">
      <p className="font-semibold text-slate-200">{title}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-[1.75rem] bg-slate-900 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-[1.75rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <IconButton label="Schließen" onClick={onClose} className="h-8 w-8 text-sm">
            <X size={16} strokeWidth={2.2} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Zahleneingabe mit −/+ Buttons. */
export function Stepper({
  value,
  onChange,
  step,
  steps,
  min = 0,
  label,
  suffix,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  step: number;
  steps?: number[];
  min?: number;
  label: string;
  suffix?: string;
}) {
  const bump = (d: number) => {
    const cur = value ?? 0;
    if (steps?.length) {
      const sorted = [...steps].sort((a, b) => a - b);
      const next = d > 0 ? sorted.find((x) => x > cur + 1e-9) : [...sorted].reverse().find((x) => x < cur - 1e-9);
      if (next !== undefined) return onChange(next);
    }
    onChange(Math.max(min, Math.round((cur + d) * 1000) / 1000));
  };
  return (
    <div className="flex-1">
      <span className="label text-center">{label}</span>
      <div className="flex items-stretch overflow-hidden rounded-2xl bg-slate-800">
        <button type="button" className="w-12 text-2xl text-slate-300 active:bg-slate-700" onClick={() => bump(-step)} aria-label={`${label} verringern`}>
          −
        </button>
        <div className="relative flex-1">
          <input
            inputMode="decimal"
            aria-label={label}
            className="h-12 w-full bg-transparent text-center text-xl font-bold tabular-nums outline-none"
            value={value ?? ''}
            onChange={(e) => {
              const v = e.target.value.replace(',', '.');
              if (v === '') return onChange(undefined);
              const n = Number(v);
              if (!Number.isNaN(n)) onChange(n);
            }}
          />
          {suffix && <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">{suffix}</span>}
        </div>
        <button type="button" className="w-12 text-2xl text-slate-300 active:bg-slate-700" onClick={() => bump(step)} aria-label={`${label} erhöhen`}>
          +
        </button>
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="flex gap-1 rounded-full bg-slate-900 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${value === o.value ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Kennzahlen-Leiste (z. B. Besuche · Letzter Besuch · Geräte) */
export function StatRow({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid divide-x divide-slate-800 rounded-card bg-slate-900" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((i) => (
        <div key={i.label} className="px-4 py-3">
          <dd className="text-2xl font-bold tabular-nums leading-tight">{i.value}</dd>
          <dt className="text-xs text-slate-500">{i.label}</dt>
        </div>
      ))}
    </dl>
  );
}

/** Gelbes „Neuer Bestwert“-Abzeichen */
export function BestBadge({ label = 'Neuer Bestwert' }: { label?: string }) {
  return <span className="chip bg-best px-1.5 py-0 text-[10px] uppercase tracking-wide text-black">✦ {label}</span>;
}
