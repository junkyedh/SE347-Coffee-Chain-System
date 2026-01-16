import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ROUTES } from '../constants';

import ProtectedRoute from './ProtectedRoute';
import PublicLayout from '@/layouts/Layout/PublicLayout';
import Home from '@/pages/customer/HomePage/HomePage';
import About from '@/pages/customer/About/About';
import Menu from '@/pages/customer/Menu/Menu';
import Contact from '@/pages/customer/Contact/Contact';
import Login from '@/pages/customer/Login/Login';
import RegisterCustomer from '@/pages/customer/Register/RegisterCustomer';
import HistoryOrder from '@/pages/customer/HistoryOrder/HistoryOrder';
import { Checkout } from '@/pages/customer/Checkout/Checkout';
import ProfileUser from '@/pages/customer/ProfileUser/ProfileUser';
import { VNPayCallback } from '@/pages/customer/VNPayCallback';
import { TrackingOrder } from '@/pages/customer/TrackingOrder/TrackingOrder';
import DetailProduct from '@/pages/customer/ProductDetail/ProductDetail';
import FeedbackPage from '@/pages/customer/Feedback/FeedbackPage';
import AdminLogin from '@/pages/admin/AdminLogin/AdminLogin';
import Layout from '@/layouts/Layout/Layout';
import Statistic from '@/pages/admin/admin/AdminStatistic';
import AdminBranchList from '@/pages/admin/admin/AdminBranchList';
import AdminMaterialList from '@/pages/admin/admin/AdminMaterialList';
import AdminProductList from '@/pages/admin/admin/AdminProduct';
import AdminOrderList from '@/pages/admin/admin/AdminOrderList';
import AdminStaffList from '@/pages/admin/admin/AdminStaffList';
import AdminCustomerList from '@/pages/admin/admin/AdminCustomerList';
import AdminPromotion from '@/pages/admin/admin/AdminPromotion';
import AdminCustomerRating from '@/pages/admin/admin/AdminCustomerRating';
import ManagerStatistic from '@/pages/admin/manager/ManagerStatistic';
import ManagerMaterialList from '@/pages/admin/manager/ManagerMaterialList';
import ManagerProductList from '@/pages/admin/manager/ManagerProduct';
import ManagerOrderList from '@/pages/admin/manager/ManagerOrderList';
import ManagerStaffList from '@/pages/admin/manager/ManagerStaffList';
import ManagerTableList from '@/pages/admin/manager/ManagerTable';
import ManagerCustomerList from '@/pages/admin/manager/ManagerCustomerList';
import ManagerPromotion from '@/pages/admin/manager/ManagerPromotion';
import ManagerBranchInfo from '@/pages/admin/manager/ManagerBranchInfo';
import ManagerCustomerRating from '@/pages/admin/manager/ManagerCustomerRating';
import AdminTableOrder from '@/pages/admin/staff/TableOrder/TableOrder';
import OrderList from '@/pages/admin/staff/OrderList';
import StaffList from '@/pages/admin/staff/StaffList';
import CustomerList from '@/pages/admin/staff/CustomerList';
import StaffProfile from '@/pages/admin/staff/StaffProfile/StaffProfile';
import AdminMenu from '@/pages/admin/staff/Menu/AdminMenu';
import PageNotFound from '@/layouts/PageNotFound';

export default function MainRoutes() {
  return (
    <Routes>
      {/* PUBLIC / CUSTOMER ROUTES */}
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.ABOUT} element={<About />} />
        <Route path={ROUTES.MENU} element={<Menu />} />
        <Route path={ROUTES.CONTACT} element={<Contact />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<RegisterCustomer />} />
        <Route path={ROUTES.HISTORY_ORDERS} element={<HistoryOrder />} />
        <Route path={ROUTES.CHECKOUT} element={<Checkout />} />
        <Route path={ROUTES.PROFILE} element={<ProfileUser />} />
        <Route path={ROUTES.VNPay_CALLBACK} element={<VNPayCallback />} />
        <Route path={ROUTES.TRACKING_ORDER_PATTERN} element={<TrackingOrder />} />
        <Route path={ROUTES.PRODUCT_DETAIL_PATTERN} element={<DetailProduct />} />
        <Route path={ROUTES.FEEDBACK_PATTERN} element={<FeedbackPage />} />
      </Route>

      {/* ADMIN LOGIN */}
      <Route path={ROUTES.ADMIN.LOGIN} element={<AdminLogin />} />

      {/* PROTECTED ROUTES - ADMIN / MANAGER / STAFF */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={['ADMIN_SYSTEM', 'ADMIN_BRAND', 'STAFF']}
            redirectTo={ROUTES.ADMIN.LOGIN}
          >
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* ADMIN_SYSTEM ROUTES */}
        <Route path={ROUTES.ADMIN.STATISTICS} element={<Statistic />} />
        <Route path={ROUTES.ADMIN.BRANCHES} element={<AdminBranchList />} />
        <Route path={ROUTES.ADMIN.MATERIALS} element={<AdminMaterialList />} />
        <Route path={ROUTES.ADMIN.PRODUCTS} element={<AdminProductList />} />
        <Route path={ROUTES.ADMIN.ORDERS} element={<AdminOrderList />} />
        <Route path={ROUTES.ADMIN.EMPLOYEES} element={<AdminStaffList />} />
        <Route path={ROUTES.ADMIN.CUSTOMERS} element={<AdminCustomerList />} />
        <Route path={ROUTES.ADMIN.PROMOTIONS} element={<AdminPromotion />} />
        <Route path={ROUTES.ADMIN.RATINGS} element={<AdminCustomerRating />} />

        {/* ADMIN_BRAND (MANAGER) ROUTES */}
        <Route path={ROUTES.MANAGER.STATISTICS} element={<ManagerStatistic />} />
        <Route path={ROUTES.MANAGER.MATERIALS} element={<ManagerMaterialList />} />
        <Route path={ROUTES.MANAGER.PRODUCTS} element={<ManagerProductList />} />
        <Route path={ROUTES.MANAGER.ORDERS} element={<ManagerOrderList />} />
        <Route path={ROUTES.MANAGER.EMPLOYEES} element={<ManagerStaffList />} />
        <Route path={ROUTES.MANAGER.TABLES} element={<ManagerTableList />} />
        <Route path={ROUTES.MANAGER.CUSTOMERS} element={<ManagerCustomerList />} />
        <Route path={ROUTES.MANAGER.PROMOTIONS} element={<ManagerPromotion />} />
        <Route path={ROUTES.MANAGER.RATINGS} element={<ManagerCustomerRating />} />
        <Route path={ROUTES.MANAGER.BRANCH_INFO} element={<ManagerBranchInfo />} />

        {/* STAFF ROUTES */}
        <Route path={ROUTES.STAFF.STATISTICS} element={<StaffProfile />} />
        <Route path={ROUTES.STAFF.ORDER_SELECT_TABLE} element={<AdminTableOrder />} />
        <Route path={ROUTES.STAFF.ORDER_PLACE} element={<AdminMenu />} />
        <Route path={ROUTES.STAFF.ORDER_LIST} element={<OrderList />} />
        <Route path={ROUTES.STAFF.EMPLOYEES} element={<StaffList />} />
        <Route path={ROUTES.STAFF.CUSTOMERS} element={<CustomerList />} />
        <Route path={ROUTES.STAFF.PROFILE} element={<StaffProfile />} />
      </Route>

      {/* ERROR ROUTES */}
      <Route path={ROUTES.NOT_FOUND} element={<PageNotFound />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}
