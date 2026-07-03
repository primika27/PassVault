import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';

export default function NavbarLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet /> {}
      </main>
    </>
  );
}