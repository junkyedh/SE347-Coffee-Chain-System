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
        title: "Thống kê",
        link: "/admin/dashboard",
        icon: "fa-solid fa-chart-line",
        roles: ["ADMIN_SYSTEM"],
    },
    {
        title: "Chi nhánh",
        link: "/admin/branchlist",
        icon: "fa-solid fa-building",
        roles: ["ADMIN_SYSTEM"],
    },
    {
        title: "Nhân viên",
        link: "/admin/stafflist",
        icon: "fa-solid fa-users",
        roles: ["ADMIN_SYSTEM"],
    },
    {
        title: "Khách hàng",
        link: "/admin/customerlist",
        icon: "fa-solid fa-user",
        roles: ["ADMIN_SYSTEM"],
    },
    {
        title: "Đơn hàng",
        link: "/admin/orderlist",
        icon: "fa-solid fa-receipt",
        roles: ["ADMIN_SYSTEM"],
    },
    {
        title: "Sản phẩm",
        link: "/admin/productlist",
        icon: "fa-solid fa-box",
        roles: ["ADMIN_SYSTEM"],
    },
    {
        title: "Khuyến mãi",
        link: "/admin/promote",
        icon: "fa-solid fa-ticket",
        roles: ["ADMIN_SYSTEM"],
    },
    {
        title: "Đánh giá",
        link: "/admin/rating",
        icon: "fa-solid fa-star",
        roles: ["ADMIN_SYSTEM"],
    },

    // Manager routes
    {
        title: "Thống kê",
        link: "/manager/dashboard",
        icon: "fa-solid fa-chart-line",
        roles: ["ADMIN_BRAND"],
    },
    {
        title: "Nguyên liệu",
        link: "/manager/materiallist",
        icon: "fa-solid fa-boxes-stacked",
        roles: ["ADMIN_BRAND"],
    },
    {
        title: "Sản phẩm",
        link: "/manager/productlist",
        icon: "fa-solid fa-box",
        roles: ["ADMIN_BRAND"],
    },
    {
        title: "Đơn hàng",
        link: "/manager/orderlist",
        icon: "fa-solid fa-receipt",
        roles: ["ADMIN_BRAND"],
    },
    {
        title: "Nhân viên",
        link: "/manager/stafflist",
        icon: "fa-solid fa-users",
        roles: ["ADMIN_BRAND"],
    },
    {
        title: "Bàn ghế",
        link: "/manager/table",
        icon: "fa-solid fa-table",
        roles: ["ADMIN_BRAND"],
    },
    {
        title: "Khách hàng",
        link: "/manager/customerlist",
        icon: "fa-solid fa-user",
        roles: ["ADMIN_BRAND"],
    },
    {
        title: "Khuyến mãi",
        link: "/manager/promote",
        icon: "fa-solid fa-ticket",
        roles: ["ADMIN_BRAND"],
    },
    {
        title: "Đánh giá",
        link: "/manager/rating",
        icon: "fa-solid fa-star",
        roles: ["ADMIN_BRAND"],
    },
    {
        title: "Thông tin quán",
        link: "/manager/info",
        icon: "fa-solid fa-building",
        roles: ["ADMIN_BRAND"],
    },

    // Staff routes
    {
        title: "Đặt hàng",
        link: "/manager/order",
        icon: "fa-solid fa-cart-plus",
        roles: ["STAFF"],
        children: [
            {
                title: "Chọn bàn",
                link: "/manager/choose-table",
                icon: "fa-solid fa-mug-saucer",
                roles: ["STAFF"],
            },
            {
                title: "Gọi món",
                link: "/manager/place-order",
                icon: "fa-solid fa-cart-plus",
                roles: ["STAFF"],
            },
            {
                title: "Danh sách đơn hàng",
                link: "/manager/order-list",
                icon: "fa-solid fa-receipt",
                roles: ["STAFF"],
            },
        ],
    },
    {
        title: "Danh sách khách hàng",
        link: "/manager/customer-list",
        icon: "fa-solid fa-users",
        roles: ["STAFF"],
    },
    {
        title: "Thông tin nhân viên",
        link: "/manager/info",
        icon: "fa-solid fa-user",
        roles: ["STAFF"],
    },

    // Customer routes
    {
        title: "Trang chủ",
        link: "/",
        icon: "fa-solid fa-house",
        roles: ["CUSTOMER"],
    },
    {
        title: "Giới thiệu",
        link: "/about-us",
        icon: "fa-solid fa-circle-info",
        roles: ["CUSTOMER"],
    },
    {
        title: "Liên hệ",
        link: "/contact-us",
        icon: "fa-solid fa-phone",
        roles: ["CUSTOMER"],
    },
    {
        title: "Đặt phòng",
        link: "/booking",
        icon: "fa-solid fa-calendar",
        roles: ["CUSTOMER"],
    },
    {
        title: "Lịch sử",
        link: "/history",
        icon: "fa-solid fa-clock-rotate-left",
        roles: ["CUSTOMER"],
    },
    {
        title: "Thông tin cá nhân",
        link: "/profile-user",
        icon: "fa-solid fa-user",
        roles: ["CUSTOMER"],
    },
]