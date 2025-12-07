import { ROUTES } from '../../constants';

export type Route = {
  title: string;
  link: string;
  icon: string;
  roles: string[];
  children?: Route[];
};

export type SubRoutesState = {
  [key: string]: boolean;
};

export const sidebarRoutes: Route[] = [
  // Admin routes
  {
    title: 'Thống kê',
    link: ROUTES.ADMIN.STATISTICS,
    icon: 'fa-solid fa-chart-line',
    roles: ['ADMIN_SYSTEM'],
  },
  {
    title: 'Chi nhánh',
    link: ROUTES.ADMIN.BRANCHES,
    icon: 'fa-solid fa-building',
    roles: ['ADMIN_SYSTEM'],
  },
  {
    title: 'Nhân viên',
    link: ROUTES.ADMIN.EMPLOYEES,
    icon: 'fa-solid fa-users',
    roles: ['ADMIN_SYSTEM'],
  },
  {
    title: 'Khách hàng',
    link: ROUTES.ADMIN.CUSTOMERS,
    icon: 'fa-solid fa-user',
    roles: ['ADMIN_SYSTEM'],
  },
  {
    title: 'Đơn hàng',
    link: ROUTES.ADMIN.ORDERS,
    icon: 'fa-solid fa-receipt',
    roles: ['ADMIN_SYSTEM'],
  },
  {
    title: 'Sản phẩm',
    link: ROUTES.ADMIN.PRODUCTS,
    icon: 'fa-solid fa-box',
    roles: ['ADMIN_SYSTEM'],
  },
  {
    title: 'Khuyến mãi',
    link: ROUTES.ADMIN.PROMOTIONS,
    icon: 'fa-solid fa-ticket',
    roles: ['ADMIN_SYSTEM'],
  },
  {
    title: 'Đánh giá',
    link: ROUTES.ADMIN.RATINGS,
    icon: 'fa-solid fa-star',
    roles: ['ADMIN_SYSTEM'],
  },

  // Manager routes
  {
    title: 'Thống kê',
    link: ROUTES.MANAGER.STATISTICS,
    icon: 'fa-solid fa-chart-line',
    roles: ['ADMIN_BRAND'],
  },
  {
    title: 'Nguyên liệu',
    link: ROUTES.MANAGER.MATERIALS,
    icon: 'fa-solid fa-boxes-stacked',
    roles: ['ADMIN_BRAND'],
  },
  {
    title: 'Sản phẩm',
    link: ROUTES.MANAGER.PRODUCTS,
    icon: 'fa-solid fa-box',
    roles: ['ADMIN_BRAND'],
  },
  {
    title: 'Đơn hàng',
    link: ROUTES.MANAGER.ORDERS,
    icon: 'fa-solid fa-receipt',
    roles: ['ADMIN_BRAND'],
  },
  {
    title: 'Nhân viên',
    link: ROUTES.MANAGER.EMPLOYEES,
    icon: 'fa-solid fa-users',
    roles: ['ADMIN_BRAND'],
  },
  {
    title: 'Bàn ghế',
    link: ROUTES.MANAGER.TABLES,
    icon: 'fa-solid fa-table',
    roles: ['ADMIN_BRAND'],
  },
  {
    title: 'Khách hàng',
    link: ROUTES.MANAGER.CUSTOMERS,
    icon: 'fa-solid fa-user',
    roles: ['ADMIN_BRAND'],
  },
  {
    title: 'Khuyến mãi',
    link: ROUTES.MANAGER.PROMOTIONS,
    icon: 'fa-solid fa-ticket',
    roles: ['ADMIN_BRAND'],
  },
  {
    title: 'Đánh giá',
    link: ROUTES.MANAGER.RATINGS,
    icon: 'fa-solid fa-star',
    roles: ['ADMIN_BRAND'],
  },
  {
    title: 'Thông tin quán',
    link: ROUTES.MANAGER.BRANCH_INFO,
    icon: 'fa-solid fa-building',
    roles: ['ADMIN_BRAND'],
  },

  // Staff routes
  {
    title: 'Đặt món',
    link: '/nhan-vien/dat-mon',
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
    title: 'Danh sách khách hàng',
    link: ROUTES.STAFF.CUSTOMERS,
    icon: 'fa-solid fa-users',
    roles: ['STAFF'],
  },
  {
    title: 'Thông tin nhân viên',
    link: ROUTES.STAFF.PROFILE,
    icon: 'fa-solid fa-user',
    roles: ['STAFF'],
  },

  // Customer routes
  {
    title: 'Trang chủ',
    link: ROUTES.HOME,
    icon: 'fa-solid fa-house',
    roles: ['CUSTOMER'],
  },
  {
    title: 'Giới thiệu',
    link: ROUTES.ABOUT,
    icon: 'fa-solid fa-circle-info',
    roles: ['CUSTOMER'],
  },
  {
    title: 'Liên hệ',
    link: ROUTES.CONTACT,
    icon: 'fa-solid fa-phone',
    roles: ['CUSTOMER'],
  },
  {
    title: 'Lịch sử',
    link: ROUTES.HISTORY_ORDERS,
    icon: 'fa-solid fa-clock-rotate-left',
    roles: ['CUSTOMER'],
  },
  {
    title: 'Thông tin cá nhân',
    link: ROUTES.PROFILE,
    icon: 'fa-solid fa-user',
    roles: ['CUSTOMER'],
  },
];
