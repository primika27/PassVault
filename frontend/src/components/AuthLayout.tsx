import { Outlet, useLocation } from 'react-router-dom';
import Logo from './Logo';

export default function AuthLayout() {
  const { pathname } = useLocation();
  const isMfaPage = pathname === '/mfa';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isMfaPage ? 'flex-start' : 'center',
        paddingTop: isMfaPage ? '2rem' : 0,
      }}
    >
      <Logo />
      <main
        style={{
          width: '100%',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
