import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '#lib/utils';
import Logo from './Logo';
import { logout } from '../api/client';
import { useVault } from '../context/VaultContext';
import { Button } from '#components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#components/ui/dialog';

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
  const navigate = useNavigate();
  const { lockVault } = useVault();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      lockVault();
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

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
        <li>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="block cursor-pointer rounded-sm px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                Logout
              </button>
            </DialogTrigger>

            <DialogContent className="bg-zinc-900 border border-zinc-800 text-white shadow-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-white">
                  Confirm Logout
                </DialogTitle>
                <DialogDescription className="text-sm text-zinc-300">
                  Are you sure you want to log out? Your current session will end and your vault will be locked.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoggingOut}
                    className="border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-white"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleConfirmLogout}
                  disabled={isLoggingOut}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  {isLoggingOut ? 'Logging out...' : 'Log out'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </li>
      </ul>
    </nav>
  );
}