import { Cloud, CloudOff, HardDrive, RefreshCw, TriangleAlert, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSyncStore } from '../../sync/useSync';

const STYLE: Record<string, [string, string, LucideIcon]> = {
  local: ['Lokal', 'text-slate-500', HardDrive],
  idle: ['Sync', 'text-emerald-400', Cloud],
  syncing: ['Sync', 'text-slate-400', RefreshCw],
  offline: ['Offline', 'text-amber-400', CloudOff],
  error: ['Sync-Fehler', 'text-red-400', TriangleAlert],
};

export function SyncBadge() {
  const { state, auth } = useSyncStore();
  const s = state !== 'local' && !auth ? 'local' : state;
  const [label, cls, Icon] = STYLE[s];
  return (
    <Link to="/profile" className={`flex items-center gap-1 text-xs font-semibold ${cls}`}>
      <Icon size={14} strokeWidth={2} className={s === 'syncing' ? 'animate-spin' : ''} />
      {label}
    </Link>
  );
}
