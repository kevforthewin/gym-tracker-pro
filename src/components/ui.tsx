import { type ButtonHTMLAttributes, type ReactNode, useEffect } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
const variants: Record<Variant, string> = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-600/40 disabled:text-white/50',
  secondary:
    'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800',
};

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60 ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({ title, right, back }: { title: string; right?: ReactNode; back?: () => void }) {
  return (
    <header className="sticky top-0 z-10 -mx-4 mb-4 flex items-center gap-2 border-b border-slate-200 bg-slate-50/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      {back && (
        <button type="button" onClick={back} className="-ml-2 rounded p-2 text-xl" aria-label="Zurück">
          ‹
        </button>
      )}
      <h1 className="flex-1 truncate text-xl font-bold">{title}</h1>
      {right}
    </header>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-700">
      <p className="font-medium">{title}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] dark:bg-slate-800 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} className="rounded p-2 text-slate-500" aria-label="Schließen">
            ✕
          </button>
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
  /** Optionale feste Werte (z. B. Gewichtsstufen des Geräts). */
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
      <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600">
        <button type="button" className="w-11 bg-slate-100 text-xl dark:bg-slate-700" onClick={() => bump(-step)} aria-label={`${label} verringern`}>
          −
        </button>
        <div className="relative flex-1">
          <input
            inputMode="decimal"
            aria-label={label}
            className="h-11 w-full bg-white text-center text-lg font-semibold outline-none dark:bg-slate-800"
            value={value ?? ''}
            onChange={(e) => {
              const v = e.target.value.replace(',', '.');
              if (v === '') return onChange(undefined);
              const n = Number(v);
              if (!Number.isNaN(n)) onChange(n);
            }}
          />
          {suffix && <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">{suffix}</span>}
        </div>
        <button type="button" className="w-11 bg-slate-100 text-xl dark:bg-slate-700" onClick={() => bump(step)} aria-label={`${label} erhöhen`}>
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

export function Tabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="mb-4 flex gap-1 rounded-lg bg-slate-200 p-1 dark:bg-slate-800">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold ${
            value === o.value ? 'bg-white shadow dark:bg-slate-600' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
