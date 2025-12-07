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
    link: '/quan-tri/thong-ke',
    icon: 'fa-solid fa-chart-line',
    roles: ['ADMIN_SYSTEM'],
  },
  {
    title: 'Chi nhánh',
    link: '/quan-tri/danh-sach-chi-nhanh',
    icon: 'fa-solid fa-building',
    roles: ['ADMIN_SYSTEM'],
  },
  {
    title: 'Nhân viên',
    link: '/quan-tri/danh-sach-nhan-vien',
    icon: 'fa-solid fa-users',
    roles: ['ADMIN_SYSTEM'],
  },
  {
    title: 'Khách hàng',
    link: '/quan-tri/danh-sach-khach-hang',
    icon: 'fa-solid fa-user',
    roles: ['ADMIN_SYSTEM'],
  },
  {
    title: 'Đơn hàng',
    link: '/quan-tri/danh-sach-don-hang',
    icon: 'fa-solid fa-receipt',
    roles: ['ADMIN_SYSTEM'],
  },
  {
    title: 'Sản phẩm',
    link: '/quan-tri/danh-sach-san-pham',
    icon: 'fa-solid fa-box',
    roles: ['ADMIN_SYSTEM'],
  },
  {
    title: 'Khuyến mãi',
    link: '/quan-tri/khuyen-mai',
    icon: 'fa-solid fa-ticket',
    roles: ['ADMIN_SYSTEM'],
  },
  {
    title: 'Đánh giá',
    link: '/quan-tri/danh-gia',
    icon: 'fa-solid fa-star',
    roles: ['ADMIN_SYSTEM'],
  },

  // Manager routes
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

  // Customer routes
  {
    title: 'Trang chủ',
    link: '/',
    icon: 'fa-solid fa-house',
    roles: ['CUSTOMER'],
  },
  {
    title: 'Giới thiệu',
    link: '/gioi-thieu',
    icon: 'fa-solid fa-circle-info',
    roles: ['CUSTOMER'],
  },
  {
    title: 'Liên hệ',
    link: '/lien-he',
    icon: 'fa-solid fa-phone',
    roles: ['CUSTOMER'],
  },
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
