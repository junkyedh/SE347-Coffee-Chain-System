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
            <Route path="/login" element={<Login />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/contact-us" element={<Contact />} />
            <Route path="/product/:id" element={<DetailProduct />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/profile-user" element={<ProfileUser />}/>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="tracking-order/:id" element={<TrackingOrder />} />
            <Route path="/history" element={<HistoryOrder />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/register" element={<RegisterCustomer />} />
          </Route>

      <Route path="/admin/login" element={<AdminLogin />} />


      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN_SYSTEM', 'ADMIN_BRAND', 'STAFF']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Các route chung cho Admin, Manager, Staff */}
        <Route path="/admin/dashboard" element={<Statistic />} />
        <Route path="/admin/branchlist" element={<AdminBranchList />} />
        <Route path="/admin/materiallist" element={<AdminMaterialList />} />
        <Route path="/admin/productlist" element={<AdminProductList />} />
        <Route path="/admin/orderlist" element={<AdminOrderList />} />
        <Route path="/admin/stafflist" element={<AdminStaffList />} />
        <Route path="/admin/customerlist" element={<AdminCustomerList />} />
        <Route path="/admin/promote" element={<AdminPromotion />} />
        <Route path="/admin/rating" element={<AdminCustomerRating />} />

        <Route path="/manager/dashboard" element={<ManagerStatistic />} />
        <Route path="/manager/productlist" element={<ManagerProductList />} />
        <Route path="/manager/materiallist" element={<ManagerMaterialList />} />
        <Route path="/manager/stafflist" element={<ManagerStaffList />} />
        <Route path="/manager/table" element={<ManagerTableList />} />
        <Route path="/manager/customerlist" element={<ManagerCustomerList />} />
        <Route path="/manager/orderlist" element={<ManagerOrderList />} />
        <Route path="/manager/promote" element={<ManagerPromotion />} />
        <Route path="/manager/rating" element={<AdminCustomerRating />} />
        <Route path="/manager/info" element={<ManagerBranchInfo />} />

        <Route path="/staff/dashboard" element={<ManagerBranchInfo />} />
        <Route path="/staff/order/place-order" element={<AdminMenu />} />
        <Route path="/staff/order/choose-table" element={<AdminTableOrder />} />
        <Route path="/staff/order/order-list" element={<OrderList />} />
        <Route path="/staff/customer-list" element={<CustomerList />} />
        <Route path="/staff/staff-list" element={<StaffList />} />
        <Route path="/staff/info" element={<StaffProfile />} />
      </Route>
      <Route path="/404" element={<PageNotFound />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default MainRoutes;