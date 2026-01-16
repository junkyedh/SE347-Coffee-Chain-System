import { Outlet, useLocation } from 'react-router-dom';
import Footer from '../../components/common/Footer/Footer';
import Header from '../../components/common/Header/Header';
import { ROUTES } from '../../constants';

export default function PublicLayout() {
  const { pathname } = useLocation();

  const hideLayoutPages = new Set([ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD]);
  const hideLayout = hideLayoutPages.has(pathname);

  return (
    <>
      {!hideLayout && <Header />}
      <main>
        <Outlet />
      </main>
      {!hideLayout && <Footer />}
    </>
  );
}
