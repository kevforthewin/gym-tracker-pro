import { NavLink, useLocation } from 'react-router-dom';

const items = [
  { to: '/', label: 'Training', icon: '🏋️', match: (p: string) => p === '/' || p.startsWith('/session') },
  { to: '/gyms', label: 'Gyms', icon: '📍', match: (p: string) => p.startsWith('/gyms') },
  { to: '/progress', label: 'Fortschritt', icon: '📈', match: (p: string) => p.startsWith('/progress') },
  { to: '/profile', label: 'Profil', icon: '👤', match: (p: string) => p.startsWith('/profile') },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-800 bg-slate-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-2xl">
        {items.map((i) => {
          const active = i.match(pathname);
          return (
            <li key={i.to} className="flex-1">
              <NavLink to={i.to} className={`flex flex-col items-center py-2 text-xs ${active ? 'font-semibold text-emerald-400' : 'text-slate-500'}`}>
                <span className="text-lg" aria-hidden>
                  {i.icon}
                </span>
                {i.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
