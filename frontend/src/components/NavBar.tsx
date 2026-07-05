import { cn } from '#lib/utils';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

const links = [
  { to: '/generator', label: 'Generator' },
  { to: '/evaluator', label: 'Evaluator' },
  { to: '/vault', label: 'Vault' },
  { to: '/home', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className={cn('fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3', 'bg-[#0f1f3d] text-white shadow-md')}>
      <Link to="/home" className="flex shrink-0 items-center px-2">
        <Logo size="small" />
      </Link>

      <ul className="flex flex-1 items-center justify-evenly gap-2">
        {links.map(({ to, label }) => {
          const isActive = pathname === to;

          return (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  'block rounded-sm px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}