import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSystemContext } from '../../hooks/useSystemContext';
import { comparePathname } from '../../utils/uri';
import './Sidebar.scss';

type Route = {
  title: string;
  link: string;
  icon: string;
  roles: string[];
  children?: Route[];
};

type SubRoutesState = {
  [key: string]: boolean;
};

const Sidebar: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('');
  const [openSubRoutes, setOpenSubRoutes] = useState<SubRoutesState>({});
  const location = useLocation();
  const { role } = useSystemContext();

  let routes: Route[] = [];

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  if (role === 'ADMIN_SYSTEM') {
    routes = [
      {
        title: 'THỐNG KÊ',
        link: '/quan-tri/thong-ke',
        icon: 'fa-solid fa-chart-line',
        roles: ['ADMIN_SYSTEM'],
      },
      {
        title: 'DANH SÁCH CHI NHÁNH',
        link: '/quan-tri/danh-sach-chi-nhanh',
        icon: 'fa-solid fa-building',
        roles: ['ADMIN_SYSTEM'],
      },
      {
        title: 'DANH SÁCH NGUYÊN LIỆU',
        link: '/quan-tri/danh-sach-nguyen-lieu',
        icon: 'fa-solid fa-boxes-stacked',
        roles: ['ADMIN_SYSTEM'],
      },
      {
        title: 'DANH SÁCH SẢN PHẨM',
        link: '/quan-tri/danh-sach-san-pham',
        icon: 'fa-solid fa-box',
        roles: ['ADMIN_SYSTEM'],
      },
      {
        title: 'DANH SÁCH ĐƠN HÀNG',
        link: '/quan-tri/danh-sach-don-hang',
        icon: 'fa-solid fa-receipt',
        roles: ['ADMIN_SYSTEM'],
      },
      {
        title: 'DANH SÁCH NHÂN VIÊN',
        link: '/quan-tri/danh-sach-nhan-vien',
        icon: 'fa-solid fa-users',
        roles: ['ADMIN_SYSTEM'],
      },
      {
        title: 'DANH SÁCH KHÁCH HÀNG',
        link: '/quan-tri/danh-sach-khach-hang',
        icon: 'fa-solid fa-user',
        roles: ['ADMIN_SYSTEM'],
      },
      {
        title: 'KHUYẾN MÃI',
        link: '/quan-tri/khuyen-mai',
        icon: 'fa-solid fa-ticket',
        roles: ['ADMIN_SYSTEM'],
      },
      {
        title: 'ĐÁNH GIÁ',
        link: '/quan-tri/danh-gia',
        icon: 'fa-solid fa-star',
        roles: ['ADMIN_SYSTEM'],
      },
    ];
  } else if (role === 'ADMIN_BRAND') {
    routes = [
      {
        title: 'Thống kê',
        link: '/quan-ly/thong-ke',
        icon: 'fa-solid fa-chart-line',
        roles: ['ADMIN_BRAND'],
      },
      {
        title: 'Nguyên liệu',
        link: '/quan-ly/danh-sach-nguyen-lieu',
        icon: 'fa-solid fa-boxes-stacked',
        roles: ['ADMIN_BRAND'],
      },
      {
        title: 'Sản phẩm',
        link: '/quan-ly/danh-sach-san-pham',
        icon: 'fa-solid fa-box',
        roles: ['ADMIN_BRAND'],
      },
      {
        title: 'Đơn hàng',
        link: '/quan-ly/danh-sach-don-hang',
        icon: 'fa-solid fa-receipt',
        roles: ['ADMIN_BRAND'],
      },
      {
        title: 'Nhân viên',
        link: '/quan-ly/danh-sach-nhan-vien',
        icon: 'fa-solid fa-users',
        roles: ['ADMIN_BRAND'],
      },
      {
        title: 'Bàn ghế',
        link: '/quan-ly/danh-sach-ban-ghe',
        icon: 'fa-solid fa-table',
        roles: ['ADMIN_BRAND'],
      },
      {
        title: 'Khách hàng',
        link: '/quan-ly/danh-sach-khach-hang',
        icon: 'fa-solid fa-user',
        roles: ['ADMIN_BRAND'],
      },
      {
        title: 'Khuyến mãi',
        link: '/quan-ly/khuyen-mai',
        icon: 'fa-solid fa-ticket',
        roles: ['ADMIN_BRAND'],
      },
      {
        title: 'Đánh giá',
        link: '/quan-ly/danh-gia',
        icon: 'fa-solid fa-star',
        roles: ['ADMIN_BRAND'],
      },
      {
        title: 'Thông tin quán',
        link: '/quan-ly/thong-tin-quan',
        icon: 'fa-solid fa-building',
        roles: ['ADMIN_BRAND'],
      },
    ];
  } else if (role === 'STAFF') {
    routes = [
      {
        title: 'ĐẶT MÓN',
        link: '/nhan-vien/don-hang',
        icon: 'fa-solid fa-cart-plus',
        roles: ['STAFF'],
        children: [
          {
            title: 'Chọn bàn',
            link: 'chon-ban',
            icon: 'fa-solid fa-mug-saucer',
            roles: ['STAFF'],
          },
          {
            title: 'Gọi món',
            link: 'dat-mon',
            icon: 'fa-solid fa-cart-plus',
            roles: ['STAFF'],
          },
          {
            title: 'Danh sách đơn hàng',
            link: 'danh-sach-don-hang',
            icon: 'fa-solid fa-receipt',
            roles: ['STAFF'],
          },
        ],
      },
      {
        title: 'Danh sách nhân viên',
        link: '/nhan-vien/danh-sach-nhan-vien',
        icon: 'fa-solid fa-users',
        roles: ['STAFF'],
      },
      {
        title: 'Danh sách khách hàng',
        link: '/nhan-vien/danh-sach-khach-hang',
        icon: 'fa-solid fa-users',
        roles: ['STAFF'],
      },
      {
        title: 'Thông tin nhân viên',
        link: '/nhan-vien/thong-tin',
        icon: 'fa-solid fa-user',
        roles: ['STAFF'],
      },
    ];
  } else if (role === 'CUSTOMER') {
    routes = [
      { title: 'Trang chủ', link: '/', icon: 'fa-solid fa-house', roles: ['CUSTOMER'] },
      {
        title: 'Giới thiệu',
        link: '/gioi-thieu',
        icon: 'fa-solid fa-circle-info',
        roles: ['CUSTOMER'],
      },
      { title: 'Liên hệ', link: '/lien-he', icon: 'fa-solid fa-phone', roles: ['CUSTOMER'] },
      // { title: 'Đặt phòng', link: '/dat-phong', icon: 'fa-solid fa-calendar', roles: ['CUSTOMER'] },
      {
        title: 'Lịch sử',
        link: '/lich-su-don-hang',
        icon: 'fa-solid fa-clock-rotate-left',
        roles: ['CUSTOMER'],
      },
      {
        title: 'Thông tin cá nhân',
        link: '/tai-khoan',
        icon: 'fa-solid fa-user',
        roles: ['CUSTOMER'],
      },
    ];
  }
  if (routes.length === 0) return null;

  const toggleSubRoutes = (path: string) => {
    setOpenSubRoutes((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('isBrand');
    window.location.href = '/quan-tri/dang-nhap';
  };

  const renderNavigationList = () => {
    return routes.map((route, index) => {
      if (!route.roles) return null;
      if (localStorage.getItem('role') && !route.roles.includes(localStorage.getItem('role') || ''))
        return null;

      const hasChildren = route.children && route.children.length > 0;
      const isActive = comparePathname(route.link ?? '', currentPath);
      const isOpen = openSubRoutes[route.link ?? ''];

      return (
        <li key={index} className={`side-item ${hasChildren ? 'dropdown' : ''}`}>
          <Link
            to={hasChildren ? '#' : route.link ?? '#'}
            className={`side-link ${isActive ? 'side-link-active' : ''}`}
            onClick={
              hasChildren
                ? (e) => {
                    e.preventDefault();
                    if (route.link) {
                      toggleSubRoutes(route.link);
                    }
                  }
                : undefined
            }
          >
            <span className="icon">
              <i className={route.icon}></i>
            </span>
            <span className={`title ${isActive ? 'title-active' : ''}`}>{route.title}</span>
            {hasChildren && (
              <span className={`arrow ${isOpen ? 'up' : 'down'}`}>
                <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
              </span>
            )}
          </Link>
          {hasChildren && isOpen && (
            <ul className="side-children side side-pills">
              {route.children?.map((subRoute, subIndex) => {
                if (!subRoute.roles) return null;
                if (
                  localStorage.getItem('role') &&
                  !subRoute.roles.includes(localStorage.getItem('role') || '')
                )
                  return null;
                return (
                  <li key={subIndex} className="side-item">
                    <Link
                      to={`${route.link}/${subRoute.link}`}
                      className={`side-link ${
                        comparePathname(`${route.link}/${subRoute.link}`, currentPath)
                          ? 'side-link-active'
                          : ''
                      }`}
                    >
                      <span className="icon">
                        <i className={subRoute.icon}></i>
                      </span>
                      <span
                        className={`title ${
                          comparePathname(`${route.link}/${subRoute.link}`, currentPath)
                            ? 'title-active'
                            : ''
                        }`}
                      >
                        {subRoute.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    });
  };

  return (
    <>
      <div className="d-flex sidebar menulist">
        <ul className="side side-pills">
          <h1 className="logo">
            <svg
              width="90"
              height="50"
              viewBox="0 0 100 61"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_1_4813)">
                <path
                  d="M85.7065 5.92603H22.6784C15.2321 5.92603 9.17236 11.465 9.17236 18.2714V29.9214C9.17236 34.2546 10.8921 38.1928 13.6744 41.2215V79.9984C13.6744 81.0898 14.1487 82.1365 14.993 82.9082C15.8373 83.68 16.9824 84.1135 18.1764 84.1135H54.1924C55.3864 84.1135 56.5315 83.68 57.3758 82.9082C58.2201 82.1365 58.6944 81.0898 58.6944 79.9984V59.4227H76.7025V79.9984C76.7025 81.0898 77.1768 82.1365 78.0211 82.9082C78.8654 83.68 80.0105 84.1135 81.2045 84.1135H90.2085C91.4025 84.1135 92.5476 83.68 93.3919 82.9082C94.2362 82.1365 94.7105 81.0898 94.7105 79.9984V41.2174C97.4927 38.1928 99.2125 34.2546 99.2125 29.9172V18.2714C99.2125 11.465 93.1528 5.92603 85.7065 5.92603ZM90.2085 18.2714V29.9214C90.2085 34.6126 86.3863 38.6125 81.6952 38.8388L81.2045 38.8471C76.2388 38.8471 72.2005 35.1558 72.2005 30.6168V14.1563H85.7065C88.1916 14.1563 90.2085 16.004 90.2085 18.2714ZM45.1884 30.6168V14.1563H63.1964V30.6168C63.1964 35.1558 59.1581 38.8471 54.1924 38.8471C49.2267 38.8471 45.1884 35.1558 45.1884 30.6168ZM18.1764 18.2714C18.1764 16.004 20.1933 14.1563 22.6784 14.1563H36.1844V30.6168C36.1844 35.1558 32.1461 38.8471 27.1804 38.8471L26.6897 38.8347C21.9986 38.6125 18.1764 34.6126 18.1764 29.9214V18.2714ZM45.1884 63.5379H27.1804V51.1925H45.1884V63.5379Z"
                  fill="url(#paint0_linear_1_4813)"
                />
                <path
                  d="M85.7065 5.92603H22.6784C15.2321 5.92603 9.17236 11.465 9.17236 18.2714V29.9214C9.17236 34.2546 10.8921 38.1928 13.6744 41.2215V79.9984C13.6744 81.0898 14.1487 82.1365 14.993 82.9082C15.8373 83.68 16.9824 84.1135 18.1764 84.1135H54.1924C55.3864 84.1135 56.5315 83.68 57.3758 82.9082C58.2201 82.1365 58.6944 81.0898 58.6944 79.9984V59.4227H76.7025V79.9984C76.7025 81.0898 77.1768 82.1365 78.0211 82.9082C78.8654 83.68 80.0105 84.1135 81.2045 84.1135H90.2085C91.4025 84.1135 92.5476 83.68 93.3919 82.9082C94.2362 82.1365 94.7105 81.0898 94.7105 79.9984V41.2174C97.4927 38.1928 99.2125 34.2546 99.2125 29.9172V18.2714C99.2125 11.465 93.1528 5.92603 85.7065 5.92603ZM90.2085 18.2714V29.9214C90.2085 34.6126 86.3863 38.6125 81.6952 38.8388L81.2045 38.8471C76.2388 38.8471 72.2005 35.1558 72.2005 30.6168V14.1563H85.7065C88.1916 14.1563 90.2085 16.004 90.2085 18.2714ZM45.1884 30.6168V14.1563H63.1964V30.6168C63.1964 35.1558 59.1581 38.8471 54.1924 38.8471C49.2267 38.8471 45.1884 35.1558 45.1884 30.6168ZM18.1764 18.2714C18.1764 16.004 20.1933 14.1563 22.6784 14.1563H36.1844V30.6168C36.1844 35.1558 32.1461 38.8471 27.1804 38.8471L26.6897 38.8347C21.9986 38.6125 18.1764 34.6126 18.1764 29.9214V18.2714ZM45.1884 63.5379H27.1804V51.1925H45.1884V63.5379Z"
                  fill="url(#paint0_linear_1_4813)"
                />
              </g>
              <defs>
                <linearGradient
                  id="paint0_linear_1_4813"
                  x1="54.1924"
                  y1="5.92603"
                  x2="54.1924"
                  y2="84.1135"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#557C8D" />
                  <stop offset="1" stop-color="#2F4156" />
                </linearGradient>
                <clipPath id="clip0_1_4813">
                  <rect
                    width="98.6741"
                    height="60"
                    fill="white"
                    transform="translate(0.538574 0.82251)"
                  />
                </clipPath>
              </defs>
            </svg>
          </h1>
          {renderNavigationList()}
          <button className="logout-box" onClick={handleLogout}>
            <i className="fa-solid fa-sign-out"></i>
            LOG OUT
          </button>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
