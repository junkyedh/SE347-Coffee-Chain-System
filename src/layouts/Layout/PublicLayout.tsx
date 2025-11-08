import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../../components/common/Footer/Footer';
import Header from '../../components/common/Header/Header';


export default function PublicLayout() {
  const { pathname } = useLocation();

  const hideLayout =
    pathname === "/login" ||
    pathname === "/register";

  return (
    <>
      {!hideLayout && <Header />}
      <main><Outlet /></main>
      {!hideLayout && <Footer />}
    </>
  );
}