import { NavLink, useLocation } from 'react-router-dom';

const items = [
  { to: '/', label: 'Training', icon: '🏋️', match: (p: string) => p === '/' || p.startsWith('/session') },
  { to: '/history', label: 'Verlauf', icon: '🕘', match: (p: string) => p.startsWith('/history') },
  { to: '/progress', label: 'Fortschritt', icon: '📈', match: (p: string) => p.startsWith('/progress') },
  { to: '/gyms', label: 'Gyms', icon: '📍', match: (p: string) => p.startsWith('/gyms') },
  { to: '/profile', label: 'Profil', icon: '👤', match: (p: string) => p.startsWith('/profile') },
];

/** Schwebende Navigationsleiste in Pillenform */
export function BottomNav() {
  const { pathname } = useLocation();
  if (/^\/session\/[^/]+$/.test(pathname)) return null; // im laufenden Training ausblenden
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-20 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <ul className="pointer-events-auto mx-auto flex max-w-md rounded-full border border-white/10 bg-slate-900/85 p-1 shadow-2xl backdrop-blur-xl">
        {items.map((i) => {
          const active = i.match(pathname);
          return (
            <li key={i.to} className="flex-1">
              <NavLink
                to={i.to}
                className={`flex flex-col items-center rounded-full py-1.5 text-[10px] font-medium ${active ? 'bg-slate-700/80 text-white' : 'text-slate-500'}`}
              >
                <span className={`text-lg leading-6 ${active ? '' : 'opacity-60 grayscale'}`} aria-hidden>
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
