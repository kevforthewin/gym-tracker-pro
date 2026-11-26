import { USC_PLANS } from '../../catalog/uscKoeln';

/** Kleine Kennzeichnung der Urban-Sports-Club-Pakete (E · C · P · M) */
export function UscPlans({ plans, className = '' }: { plans: string[]; className?: string }) {
  return (
    <span className={`flex flex-wrap items-center gap-1 ${className}`} aria-label={`Urban Sports Club: ${plans.join(', ')}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">USC</span>
      {USC_PLANS.map((p) => (
        <span
          key={p}
          className={`rounded-full px-1.5 py-px text-[10px] font-semibold ${plans.includes(p) ? 'bg-slate-700 text-slate-100' : 'text-slate-600 line-through'}`}
        >
          {p}
        </span>
      ))}
    </span>
  );
}
