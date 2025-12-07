import "@/App.scss";
import AdminBranchList from "@/pages/admin/admin/AdminBranchList";
import AdminCustomerList from "@/pages/admin/admin/AdminCustomerList";
import AdminMaterialList from "@/pages/admin/admin/AdminMaterialList";
import AdminOrderList from "@/pages/admin/admin/AdminOrderList";
import AdminProductList from "@/pages/admin/admin/AdminProduct";
import AdminPromotion from "@/pages/admin/admin/AdminPromotion";
import AdminStaffList from "@/pages/admin/admin/AdminStaffList";
import Statistic from "@/pages/admin/admin/AdminStatistic";
import AdminCustomerRating from "@/pages/admin/admin/Rating";
import ManagerBranchInfo from "@/pages/admin/manager/ManagerBranchInfo";
import ManagerCustomerList from "@/pages/admin/manager/ManagerCustomerList";
import ManagerMaterialList from "@/pages/admin/manager/ManagerMaterialList";
import ManagerOrderList from "@/pages/admin/manager/ManagerOrderList";
import ManagerProductList from "@/pages/admin/manager/ManagerProduct";
import ManagerPromotion from "@/pages/admin/manager/ManagerPromotion";
import ManagerStaffList from "@/pages/admin/manager/ManagerStaffList";
import ManagerStatistic from "@/pages/admin/manager/ManagerStatistic";
import ManagerTableList from "@/pages/admin/manager/ManagerTable";
import CustomerList from "@/pages/admin/staff/CustomerList";
import AdminMenu from "@/pages/admin/staff/Menu/AdminMenu";
import OrderList from "@/pages/admin/staff/OrderList";
import StaffList from "@/pages/admin/staff/StaffList";
import StaffProfile from "@/pages/admin/staff/StaffProfile/StaffProfile";
import AdminTableOrder from "@/pages/admin/staff/TableOrder/TableOrder";
import About from "@/pages/customer/About/About";
import { Checkout } from "@/pages/customer/Checkout/Checkout";
import Contact from "@/pages/customer/Contact/Contact";
import FeedbackPage from "@/pages/customer/Feedback/FeedbackPage";
import HistoryOrder from "@/pages/customer/HistoryOrder/HistoryOrder";
import Login from "@/pages/customer/Login/Login";
import Menu from "@/pages/customer/Menu/Menu";
import DetailProduct from "@/pages/customer/ProductDetail/ProductDetail";
import RegisterCustomer from "@/pages/customer/Register/RegisterCustomer";
import { TrackingOrder } from "@/pages/customer/TrackingOrder/TrackingOrder";
import { VNPayCallback } from "@/pages/customer/VNPayCallback";
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from "../layouts/Layout/Layout";
import PublicLayout from "../layouts/Layout/PublicLayout";
import PageNotFound from "../layouts/PageNotFound";
import HomePage from "../pages/customer/HomePage/HomePage";
import ProtectedRoute from "./ProtectedRoute";
import AdminLogin from "@/pages/admin/AdminLogin/AdminLogin";
import ProfileUser from "@/pages/customer/ProfileUser/ProfileUser";

const MainRoutes: React.FC = () => {
  return (
      <Routes>
          {/* Customer routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/dang-nhap" element={<Login />} />
            <Route path="/gioi-thieu" element={<About />} />
            <Route path="/lien-he" element={<Contact />} />
            <Route path="/san-pham/:slug" element={<DetailProduct />} />
            <Route path="/thuc-don" element={<Menu />} />
            <Route path="/thong-tin-tai-khoan" element={<ProfileUser />}/>
            <Route path="/thanh-toan" element={<Checkout />} />
            <Route path="/vnpay-callback" element={<VNPayCallback />} />
            <Route path="/theo-doi-don-hang/:slug" element={<TrackingOrder />} />
            <Route path="/lich-su-don-hang" element={<HistoryOrder />} />
            <Route path="/danh-gia/:slug" element={<FeedbackPage />} />
            <Route path="/dang-ky" element={<RegisterCustomer />} />
          </Route>

      <Route path="/quan-tri/dang-nhap" element={<AdminLogin />} />


      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN_SYSTEM', 'ADMIN_BRAND', 'STAFF']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Các route chung cho Admin, Manager, Staff */}
        <Route path="/quan-tri/thong-ke" element={<Statistic />} />
        <Route path="/quan-tri/danh-sach-chi-nhanh" element={<AdminBranchList />} />
        <Route path="/quan-tri/danh-sach-nguyen-lieu" element={<AdminMaterialList />} />
        <Route path="/quan-tri/danh-sach-san-pham" element={<AdminProductList />} />
        <Route path="/quan-tri/danh-sach-don-hang" element={<AdminOrderList />} />
        <Route path="/quan-tri/danh-sach-nhan-vien" element={<AdminStaffList />} />
        <Route path="/quan-tri/danh-sach-khach-hang" element={<AdminCustomerList />} />
        <Route path="/quan-tri/khuyen-mai" element={<AdminPromotion />} />
        <Route path="/quan-tri/danh-gia" element={<AdminCustomerRating />} />

        <Route path="/quan-ly/thong-ke" element={<ManagerStatistic />} />
        <Route path="/quan-ly/danh-sach-san-pham" element={<ManagerProductList />} />
        <Route path="/quan-ly/danh-sach-nguyen-lieu" element={<ManagerMaterialList />} />
        <Route path="/quan-ly/danh-sach-nhan-vien" element={<ManagerStaffList />} />
        <Route path="/quan-ly/danh-sach-ban-ghe" element={<ManagerTableList />} />
        <Route path="/quan-ly/danh-sach-khach-hang" element={<ManagerCustomerList />} />
        <Route path="/quan-ly/danh-sach-don-hang" element={<ManagerOrderList />} />
        <Route path="/quan-ly/khuyen-mai" element={<ManagerPromotion />} />
        <Route path="/quan-ly/danh-gia" element={<AdminCustomerRating />} />
        <Route path="/quan-ly/thong-tin-quan" element={<ManagerBranchInfo />} />

        <Route path="/nhan-vien/thong-ke" element={<ManagerBranchInfo />} />
        <Route path="/nhan-vien/don-hang/dat-mon" element={<AdminMenu />} />
        <Route path="/nhan-vien/don-hang/chon-ban" element={<AdminTableOrder />} />
        <Route path="/nhan-vien/don-hang/danh-sach-don-hang" element={<OrderList />} />
        <Route path="/nhan-vien/danh-sach-khach-hang" element={<CustomerList />} />
        <Route path="/nhan-vien/danh-sach-nhan-vien" element={<StaffList />} />
        <Route path="/nhan-vien/thong-tin" element={<StaffProfile />} />
      </Route>
      <Route path="/404" element={<PageNotFound />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default MainRoutes;