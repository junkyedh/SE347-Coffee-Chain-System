import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../../constants";
import { useSystemContext } from "../../hooks/useSystemContext";
import { comparePathname } from "../../utils/uri";
import "./Sidebar.scss";

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
  const [currentPath, setCurrentPath] = useState("");
  const [openSubRoutes, setOpenSubRoutes] = useState<SubRoutesState>({});
  const location = useLocation();
  const { role } = useSystemContext();

  let routes: Route[] = [];

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  // --- (Giữ nguyên phần định nghĩa routes như cũ của bạn) ---
  if (role === "ADMIN_SYSTEM") {
    routes = [
      {
        title: "THỐNG KÊ",
        link: ROUTES.ADMIN.STATISTICS,
        icon: "fa-solid fa-chart-line",
        roles: ["ADMIN_SYSTEM"],
      },
      {
        title: "DANH SÁCH CHI NHÁNH",
        link: ROUTES.ADMIN.BRANCHES,
        icon: "fa-solid fa-building",
        roles: ["ADMIN_SYSTEM"],
      },
      {
        title: "DANH SÁCH NGUYÊN LIỆU",
        link: ROUTES.ADMIN.MATERIALS,
        icon: "fa-solid fa-boxes-stacked",
        roles: ["ADMIN_SYSTEM"],
      },
      {
        title: "DANH SÁCH SẢN PHẨM",
        link: ROUTES.ADMIN.PRODUCTS,
        icon: "fa-solid fa-box",
        roles: ["ADMIN_SYSTEM"],
      },
      {
        title: "DANH SÁCH ĐƠN HÀNG",
        link: ROUTES.ADMIN.ORDERS,
        icon: "fa-solid fa-receipt",
        roles: ["ADMIN_SYSTEM"],
      },
      {
        title: "DANH SÁCH NHÂN VIÊN",
        link: ROUTES.ADMIN.EMPLOYEES,
        icon: "fa-solid fa-users",
        roles: ["ADMIN_SYSTEM"],
      },
      {
        title: "DANH SÁCH KHÁCH HÀNG",
        link: ROUTES.ADMIN.CUSTOMERS,
        icon: "fa-solid fa-user",
        roles: ["ADMIN_SYSTEM"],
      },
      {
        title: "KHUYẾN MÃI",
        link: ROUTES.ADMIN.PROMOTIONS,
        icon: "fa-solid fa-ticket",
        roles: ["ADMIN_SYSTEM"],
      },
      {
        title: "ĐÁNH GIÁ",
        link: ROUTES.ADMIN.RATINGS,
        icon: "fa-solid fa-star",
        roles: ["ADMIN_SYSTEM"],
      },
    ];
  } else if (role === "ADMIN_BRAND") {
    routes = [
      {
        title: "Thống kê",
        link: ROUTES.MANAGER.STATISTICS,
        icon: "fa-solid fa-chart-line",
        roles: ["ADMIN_BRAND"],
      },
      {
        title: "Nguyên liệu",
        link: ROUTES.MANAGER.MATERIALS,
        icon: "fa-solid fa-boxes-stacked",
        roles: ["ADMIN_BRAND"],
      },
      {
        title: "Sản phẩm",
        link: ROUTES.MANAGER.PRODUCTS,
        icon: "fa-solid fa-box",
        roles: ["ADMIN_BRAND"],
      },
      {
        title: "Đơn hàng",
        link: ROUTES.MANAGER.ORDERS,
        icon: "fa-solid fa-receipt",
        roles: ["ADMIN_BRAND"],
      },
      {
        title: "Nhân viên",
        link: ROUTES.MANAGER.EMPLOYEES,
        icon: "fa-solid fa-users",
        roles: ["ADMIN_BRAND"],
      },
      {
        title: "Bàn ghế",
        link: ROUTES.MANAGER.TABLES,
        icon: "fa-solid fa-table",
        roles: ["ADMIN_BRAND"],
      },
      {
        title: "Khách hàng",
        link: ROUTES.MANAGER.CUSTOMERS,
        icon: "fa-solid fa-user",
        roles: ["ADMIN_BRAND"],
      },
      {
        title: "Khuyến mãi",
        link: ROUTES.MANAGER.PROMOTIONS,
        icon: "fa-solid fa-ticket",
        roles: ["ADMIN_BRAND"],
      },
      {
        title: "Đánh giá",
        link: ROUTES.MANAGER.RATINGS,
        icon: "fa-solid fa-star",
        roles: ["ADMIN_BRAND"],
      },
      {
        title: "Thông tin quán",
        link: ROUTES.MANAGER.BRANCH_INFO,
        icon: "fa-solid fa-building",
        roles: ["ADMIN_BRAND"],
      },
    ];
  } else if (role === "STAFF") {
    routes = [
      {
        title: "ĐẶT MÓN",
        link: "/nhan-vien/don-hang",
        icon: "fa-solid fa-cart-plus",
        roles: ["STAFF"],
        children: [
          {
            title: "Chọn bàn",
            link: "chon-ban",
            icon: "fa-solid fa-mug-saucer",
            roles: ["STAFF"],
          },
          {
            title: "Gọi món",
            link: "dat-mon",
            icon: "fa-solid fa-cart-plus",
            roles: ["STAFF"],
          },
          {
            title: "Danh sách đơn hàng",
            link: "danh-sach-don-hang",
            icon: "fa-solid fa-receipt",
            roles: ["STAFF"],
          },
        ],
      },
      {
        title: "Danh sách nhân viên",
        link: ROUTES.STAFF.EMPLOYEES,
        icon: "fa-solid fa-users",
        roles: ["STAFF"],
      },
      {
        title: "Danh sách khách hàng",
        link: ROUTES.STAFF.CUSTOMERS,
        icon: "fa-solid fa-users",
        roles: ["STAFF"],
      },
      {
        title: "Thông tin nhân viên",
        link: ROUTES.STAFF.PROFILE,
        icon: "fa-solid fa-user",
        roles: ["STAFF"],
      },
    ];
  } else if (role === "CUSTOMER") {
    routes = [
      {
        title: "Trang chủ",
        link: ROUTES.HOME,
        icon: "fa-solid fa-house",
        roles: ["CUSTOMER"],
      },
      {
        title: "Giới thiệu",
        link: ROUTES.ABOUT,
        icon: "fa-solid fa-circle-info",
        roles: ["CUSTOMER"],
      },
      {
        title: "Liên hệ",
        link: ROUTES.CONTACT,
        icon: "fa-solid fa-phone",
        roles: ["CUSTOMER"],
      },
      {
        title: "Lịch sử",
        link: ROUTES.HISTORY_ORDERS,
        icon: "fa-solid fa-clock-rotate-left",
        roles: ["CUSTOMER"],
      },
      {
        title: "Thông tin cá nhân",
        link: ROUTES.PROFILE,
        icon: "fa-solid fa-user",
        roles: ["CUSTOMER"],
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
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("isBrand");
    window.location.href = ROUTES.ADMIN.LOGIN;
  };

  const renderNavigationList = () => {
    return routes.map((route, index) => {
      if (!route.roles) return null;
      if (
        localStorage.getItem("role") &&
        !route.roles.includes(localStorage.getItem("role") || "")
      )
        return null;

      const hasChildren = route.children && route.children.length > 0;
      const isActive = comparePathname(route.link ?? "", currentPath);
      const isOpen = openSubRoutes[route.link ?? ""];

      return (
        <li
          key={index}
          className={`side-item ${hasChildren ? "dropdown" : ""}`}
        >
          <Link
            to={hasChildren ? "#" : route.link ?? "#"}
            className={`side-link ${isActive ? "side-link-active" : ""}`}
            // THÊM TITLE Ở ĐÂY ĐỂ HIỆN TOOLTIP NATIVE
            title={route.title}
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
            <span className={`title ${isActive ? "title-active" : ""}`}>
              {route.title}
            </span>
            {hasChildren && (
              <span className={`arrow ${isOpen ? "up" : "down"}`}>
                <i className={`fas fa-chevron-${isOpen ? "up" : "down"}`}></i>
              </span>
            )}
          </Link>
          {hasChildren && isOpen && (
            <ul className="side-children side side-pills">
              {route.children?.map((subRoute, subIndex) => {
                if (!subRoute.roles) return null;
                if (
                  localStorage.getItem("role") &&
                  !subRoute.roles.includes(localStorage.getItem("role") || "")
                )
                  return null;
                return (
                  <li key={subIndex} className="side-item">
                    <Link
                      to={`${route.link}/${subRoute.link}`}
                      // THÊM TITLE Ở ĐÂY CHO SUB MENU
                      title={subRoute.title}
                      className={`side-link ${
                        comparePathname(
                          `${route.link}/${subRoute.link}`,
                          currentPath
                        )
                          ? "side-link-active"
                          : ""
                      }`}
                    >
                      <span className="icon">
                        <i className={subRoute.icon}></i>
                      </span>
                      <span
                        className={`title ${
                          comparePathname(
                            `${route.link}/${subRoute.link}`,
                            currentPath
                          )
                            ? "title-active"
                            : ""
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
        <div className="logo-container">
          <h1 className="logo">
            {/* Logo SVG code - giữ nguyên như cũ */}
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
        </div>

        <ul className="side side-pills">{renderNavigationList()}</ul>

        {/* THÊM TITLE VÀO NÚT LOGOUT */}
        <button className="logout-box" onClick={handleLogout} title="Đăng xuất">
          <i className="fa-solid fa-sign-out"></i>
          <span className="logout-text">LOG OUT</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;
