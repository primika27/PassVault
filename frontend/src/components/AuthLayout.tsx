import { Outlet } from 'react-router-dom';
import Logo from './Logo';

export default function AuthLayout() {
  return (
    <>
      <Logo />
      <main>
        <Outlet />
      </main>
    </>
  );
}
