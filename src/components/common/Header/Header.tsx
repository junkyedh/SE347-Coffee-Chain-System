'use client';

import { useEffect, useState } from 'react';
import { Container, Navbar, Offcanvas, Nav, NavDropdown } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import './Header.scss';
import { User, Settings, Clock, LogOut, Home, Info, Coffee, Phone } from 'lucide-react';
import { useSystemContext } from '../../../hooks/useSystemContext';
import CartDrawer from '../../customer/CartDrawer/CartDrawer';
import { ROUTES } from '../../../constants';
import React from 'react';

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { isLoggedIn, logout, userInfo, isLoadingUser } = useSystemContext();
  const navigate = useNavigate();

  const toggleMenu = () => setOpen(!open);

  const isSticky = () => {
    const header = document.querySelector('.header-section');
    if (!header) return;
    const scrollTop = window.scrollY;
    scrollTop >= 120 ? header.classList.add('is-sticky') : header.classList.remove('is-sticky');
  };

  useEffect(() => {
    window.addEventListener('scroll', isSticky);
    return () => {
      window.removeEventListener('scroll', isSticky);
    };
  }, []);

  const closeMenu = () => {
    if (window.innerWidth <= 991) {
      setOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Navigation items with icons
  const navItems = [
    { to: ROUTES.HOME, icon: Home, label: 'Trang chủ' },
    { to: ROUTES.ABOUT, icon: Info, label: 'Giới thiệu' },
    { to: ROUTES.MENU, icon: Coffee, label: 'Thực đơn' },
    { to: ROUTES.CONTACT, icon: Phone, label: 'Liên hệ' },
  ];

  // User dropdown items (synchronized between desktop and mobile)
  const userDropdownItems = [
    {
      icon: Settings,
      label: 'Hồ sơ của tôi',
      action: () => navigate(ROUTES.PROFILE),
    },
    {
      icon: Clock,
      label: 'Lịch sử đơn hàng',
      action: () => navigate(ROUTES.HISTORY_ORDERS),
    },
    {
      icon: LogOut,
      label: 'Đăng xuất',
      action: handleLogout,
      isDanger: true,
    },
  ];

  return (
    <header className="header-section d-flex align-items-center">
      <Container>
        <Navbar expand="lg" className="justify-content-between w-100">
          {/* Logo */}
          <Navbar.Brand className="logo">
            <NavLink to={ROUTES.HOME}>
              <Coffee className="logo-icon" />
              Café w Fen
            </NavLink>
          </Navbar.Brand>

          {/* Toggle button (mobile) */}
          <button className="toggle-btn d-lg-none" onClick={toggleMenu} aria-label="Toggle menu">
            <i className={open ? 'bi bi-x-lg' : 'bi bi-list'} />
          </button>

          {/* Offcanvas slide-out menu (mobile only) */}
          <Navbar.Offcanvas
            show={open}
            onHide={toggleMenu}
            className="offcanvas-menu-panel d-lg-none"
            placement="start"
            id="offcanvas-menu"
            backdrop={true}
          >
            <Offcanvas.Header className="offcanvas-menu-header">
              <Offcanvas.Title className="offcanvas-logo">
                <Coffee className="offcanvas-logo-icon" />
                Café w Fen
              </Offcanvas.Title>
              <button className="offcanvas-close-btn" onClick={toggleMenu} aria-label="Close menu">
                <i className="bi bi-x-lg"></i>
              </button>
            </Offcanvas.Header>

            <Offcanvas.Body className="offcanvas-menu-body">
              <Nav className="offcanvas-nav-list">
                {navItems.map(({ to, icon: Icon, label }) => (
                  <NavLink key={to} to={to} className="offcanvas-nav-item" onClick={closeMenu}>
                    <Icon className="offcanvas-nav-icon" />
                    {label}
                  </NavLink>
                ))}
              </Nav>

              <div className="offcanvas-user-section mt-4">
                {isLoggedIn && userInfo ? (
                  <div className="offcanvas-user-menu">
                    <div className="user-info-card">
                      <User className="user-avatar-icon" />
                      <span className="user-name">{userInfo.name}</span>
                    </div>
                    <div className="user-actions">
                      {userDropdownItems.map(({ icon: Icon, label, action, isDanger }, index) => (
                        <button
                          key={index}
                          className={`offcanvas-nav-item ${isDanger ? 'danger' : ''}`}
                          onClick={() => {
                            action();
                            closeMenu();
                          }}
                        >
                          <Icon className="offcanvas-nav-icon" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : isLoggedIn && isLoadingUser ? (
                  <div className="text-center text-muted">
                    Đang tải...
                  </div>
                ) : (
                  <NavLink
                    to={ROUTES.LOGIN}
                    className="offcanvas-login-btn d-block text-center"
                    onClick={closeMenu}
                  >
                    <LogOut className="me-2" />
                    Đăng nhập
                  </NavLink>
                )}
              </div>
            </Offcanvas.Body>
          </Navbar.Offcanvas>

          {/* Desktop nav + user + cart */}
          <div className="right-column d-none d-lg-flex align-items-center">
            <Nav className="desktop-nav">
              {navItems.map(({ to, label }) => (
                <NavLink key={to} className="nav-link" to={to}>
                  {label}
                </NavLink>
              ))}

              {isLoggedIn && userInfo ? (
                <NavDropdown
                  title={
                    <span className="user-dropdown-title">
                      <User className="user-icon" />
                      {userInfo.name}
                    </span>
                  }
                  id="user-dropdown"
                  className="user-dropdown"
                >
                  {userDropdownItems.map(({ icon: Icon, label, action, isDanger }, index) => (
                    <React.Fragment key={index}>
                      <NavDropdown.Item
                        onClick={action}
                        className={isDanger ? 'dropdown-item-danger' : ''}
                      >
                        <Icon className="dropdown-icon" />
                        {label}
                      </NavDropdown.Item>
                      {index < userDropdownItems.length - 1 && !isDanger && <NavDropdown.Divider />}
                    </React.Fragment>
                  ))}
                </NavDropdown>
              ) : isLoggedIn && isLoadingUser ? (
                <span className="text-muted">Đang tải...</span>
              ) : (
                <NavLink className="login-btn" to={ROUTES.LOGIN}>
                  <LogOut className="login-icon" />
                  Đăng nhập
                </NavLink>
              )}
            </Nav>
            {isLoggedIn && <CartDrawer />}
          </div>
        </Navbar>
      </Container>
    </header>
  );
};

export default Header;
