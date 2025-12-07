/**
 * API Endpoints Constants
 * File này chứa tất cả các endpoint API thực tế của backend
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    SIGNIN: '/auth/signin',
    REGISTER: '/auth/register',
    CALLBACK: '/auth/callback',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
  },

  // Products
  PRODUCT: {
    LIST: '/product/list',
    DETAIL: (id: string | number) => `/product/${id}`,
    CREATE: '/product',
    UPDATE: (id: string | number) => `/product/${id}`,
    DELETE: (id: string | number) => `/product/${id}`,
    AVAILABLE_BRANCHES: (productId: string | number) => `/product/available-branches/${productId}`,
  },

  // Orders
  ORDER: {
    LIST: '/order/list',
    CREATE: '/order',
    DETAIL: (id: string | number) => `/order/${id}`,
    UPDATE: (id: string | number) => `/order/${id}`,
    DETAIL_ADD: (orderId: string | number) => `/order/detail/${orderId}`,
    BY_CUSTOMER: (phone: string) => `/order/customer/${encodeURIComponent(phone)}`,
  },

  // Branch Orders (for staff)
  BRANCH_ORDER: {
    LIST: '/branch-order/list',
    UPDATE_STATUS: (id: string | number) => `/branch-order/status/${id}`,
  },

  // Customer
  CUSTOMER: {
    LIST: '/customer/list',
    DETAIL: (identifier: string | number) => `/customer/${identifier}`, // có thể dùng phone hoặc id
    CREATE: '/customer',
    UPDATE: (id: string | number) => `/customer/${id}`,
    DELETE: (id: string | number) => `/customer/${id}`,
  },

  // Ratings/Reviews
  RATINGS: {
    LIST: '/ratings/list',
    BY_PRODUCT: (productId: string | number) => `/ratings/product/${productId}`,
    CREATE: '/ratings',
    UPDATE: (id: string | number) => `/ratings/${id}`,
    DELETE: (id: string | number) => `/ratings/${id}`,
  },

  // Promotions/Coupons
  PROMOTE: {
    COUPON_LIST: '/promote/coupon/list',
    COUPON_DETAIL: (id: string | number) => `/promote/coupon/${id}`,
    CREATE: '/promote/coupon',
    UPDATE: (id: string | number) => `/promote/coupon/${id}`,
    DELETE: (id: string | number) => `/promote/coupon/${id}`,
  },

  // Membership
  MEMBERSHIP: {
    LIST: '/membership/list',
    DETAIL: (id: string | number) => `/membership/${id}`,
  },

  // Payment
  PAYMENT: {
    VNPAY: {
      CREATE: '/payment/vnpay/create',
      CALLBACK: '/payment/vnpay/callback',
    },
    MOMO: {
      CREATE: '/payment/momo/create',
      CALLBACK: '/payment/momo/callback',
    },
  },

  // Branches
  BRANCH: {
    LIST: '/branch/list',
    DETAIL: (id: string | number) => `/branch/${id}`,
    CREATE: '/branch',
    UPDATE: (id: string | number) => `/branch/${id}`,
    DELETE: (id: string | number) => `/branch/${id}`,
  },

  // Employees/Staff
  EMPLOYEE: {
    LIST: '/employee/list',
    DETAIL: (id: string | number) => `/employee/${id}`,
    CREATE: '/employee',
    UPDATE: (id: string | number) => `/employee/${id}`,
    DELETE: (id: string | number) => `/employee/${id}`,
  },

  // Materials/Inventory
  MATERIAL: {
    LIST: '/material/list',
    DETAIL: (id: string | number) => `/material/${id}`,
    CREATE: '/material',
    UPDATE: (id: string | number) => `/material/${id}`,
    DELETE: (id: string | number) => `/material/${id}`,
  },

  // Tables
  TABLE: {
    LIST: '/table/list',
    DETAIL: (id: string | number) => `/table/${id}`,
    CREATE: '/table',
    UPDATE: (id: string | number) => `/table/${id}`,
    UPDATE_STATUS: (id: string | number) => `/table/${id}/status`,
    DELETE: (id: string | number) => `/table/${id}`,
    AVAILABLE: '/table/available',
  },

  // Statistics
  STATISTICS: {
    DASHBOARD: '/statistics/dashboard',
    REVENUE: '/statistics/revenue',
    ORDERS: '/statistics/orders',
    PRODUCTS: '/statistics/products',
    CUSTOMERS: '/statistics/customers',
  },
} as const;

/**
 * Frontend Routes Constants
 */
export const ROUTES = {
  // Public/Customer routes
  HOME: '/',
  ABOUT: '/gioi-thieu',
  CONTACT: '/lien-he',
  MENU: '/thuc-don',
  PRODUCT_DETAIL: (slug: string) => `/san-pham/${slug}`,
  
  // Auth routes
  LOGIN: '/dang-nhap',
  REGISTER: '/dang-ky',
  FORGOT_PASSWORD: '/quen-mat-khau',
  
  // Customer routes
  PROFILE: '/thong-tin-tai-khoan',
  HISTORY_ORDERS: '/lich-su-don-hang',
  TRACKING_ORDER: (slug: string) => `/theo-doi-don-hang/${slug}`,
  CHECKOUT: '/thanh-toan',
  FEEDBACK: (slug: string) => `/danh-gia/${slug}`,
  TERMS: '/dieu-khoan-dich-vu',
  
  // Payment callback
  VNPAY_CALLBACK: '/vnpay-callback',
  MOMO_CALLBACK: '/momo-callback',
  
  // Admin routes (ADMIN_SYSTEM)
  ADMIN: {
    LOGIN: '/quan-tri/dang-nhap',
    STATISTICS: '/quan-tri/thong-ke',
    BRANCHES: '/quan-tri/danh-sach-chi-nhanh',
    MATERIALS: '/quan-tri/danh-sach-nguyen-lieu',
    PRODUCTS: '/quan-tri/danh-sach-san-pham',
    ORDERS: '/quan-tri/danh-sach-don-hang',
    EMPLOYEES: '/quan-tri/danh-sach-nhan-vien',
    CUSTOMERS: '/quan-tri/danh-sach-khach-hang',
    PROMOTIONS: '/quan-tri/khuyen-mai',
    RATINGS: '/quan-tri/danh-gia',
  },
  
  // Manager routes (ADMIN_BRAND)
  MANAGER: {
    STATISTICS: '/quan-ly/thong-ke',
    PRODUCTS: '/quan-ly/danh-sach-san-pham',
    MATERIALS: '/quan-ly/danh-sach-nguyen-lieu',
    EMPLOYEES: '/quan-ly/danh-sach-nhan-vien',
    TABLES: '/quan-ly/danh-sach-ban-ghe',
    CUSTOMERS: '/quan-ly/danh-sach-khach-hang',
    ORDERS: '/quan-ly/danh-sach-don-hang',
    PROMOTIONS: '/quan-ly/khuyen-mai',
    RATINGS: '/quan-ly/danh-gia',
    BRANCH_INFO: '/quan-ly/thong-tin-quan',
  },
  
  // Staff routes (STAFF)
  STAFF: {
    STATISTICS: '/nhan-vien/thong-ke',
    ORDER_SELECT_TABLE: '/nhan-vien/don-hang/chon-ban',
    ORDER_MENU: '/nhan-vien/don-hang/dat-mon',
    ORDER_LIST: '/nhan-vien/don-hang/danh-sach-don-hang',
    CUSTOMERS: '/nhan-vien/danh-sach-khach-hang',
    EMPLOYEES: '/nhan-vien/danh-sach-nhan-vien',
    PROFILE: '/nhan-vien/thong-tin',
  },
  
  // Error pages
  NOT_FOUND: '/404',
} as const;

/**
 * Status Constants
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERING: 'delivering',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  CLEANING: 'cleaning',
} as const;

export const PAYMENT_METHOD = {
  CASH: 'cash',
  VNPAY: 'vnpay',
  MOMO: 'momo',
  BANK_TRANSFER: 'bank_transfer',
} as const;

export const USER_ROLE = {
  ADMIN_SYSTEM: 'ADMIN_SYSTEM', // Admin hệ thống - quản lý toàn bộ chuỗi
  ADMIN_BRAND: 'ADMIN_BRAND',   // Manager - quản lý chi nhánh
  STAFF: 'STAFF',               // Nhân viên
  CUSTOMER: 'CUSTOMER',         // Khách hàng
} as const;

/**
 * User Type for authentication
 */
export const USER_TYPE = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
} as const;
