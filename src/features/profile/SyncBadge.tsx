import { Link } from 'react-router-dom';
import { useSyncStore } from '../../sync/useSync';

const STYLE = {
  local: ['Lokal', 'text-slate-500'],
  idle: ['☁︎ Sync', 'text-emerald-400'],
  syncing: ['☁︎ …', 'text-slate-400'],
  offline: ['Offline', 'text-amber-400'],
  error: ['Sync-Fehler', 'text-red-400'],
} as const;

export function SyncBadge() {
  const { state, auth } = useSyncStore();
  const s = state !== 'local' && !auth ? 'local' : state;
  const [label, cls] = STYLE[s];
  return (
    <Link to="/profile" className={`text-xs font-semibold ${cls}`}>
      {label}
    </Link>
  );
}
