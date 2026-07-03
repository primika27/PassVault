import { cn } from '#lib/utils';
import { Link, useLocation } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from './ui/navigation-menu';
import Logo from './Logo';

const links = [
  { to: '/generator', label: 'Generator' },
  { to: '/evaluator', label: 'Evaluator' },
  { to: '/vault', label: 'Vault' },
  { to: '/home', label: 'Home' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <NavigationMenu
      className={cn('w-full', 'flex items-center justify-between fixed top-0 px-4')}
    >
      <Logo size="small" />
      <NavigationMenuList>
        {links.map(({ to, label }) => (
          <NavigationMenuItem key={to}>
            <NavigationMenuLink asChild active={pathname === to}>
              <Link to={to} className="block rounded-sm px-3 py-2 text-sm hover:bg-muted">
                {label}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}