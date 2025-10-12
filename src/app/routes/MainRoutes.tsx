import "@/App.scss";
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from "./ProtectedRoute";
import PublicLayout from "../layouts/Layout/PublicLayout";
import Layout from "../layouts/Layout/Layout";
import HomePage from "../pages/customer/HomePage/HomePage";
import PageNotFound from "../layouts/PageNotFound";

const MainRoutes: React.FC = () => {
  return (
      <Routes>
          {/* Customer routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>

      <Route element=
        {<ProtectedRoute
          allowedRoles={['ADMIN_SYSTEM', 'ADMIN_BRAND', 'STAFF']}>
          <Layout />
        </ProtectedRoute>
        }
      >
        {/* Các route chung cho Admin, Manager, Staff */}
        {/* <Route path="/admin/dashboard" element={<Statistic />} />

        <Route path="/manager/dashboard" element={<BranchStatistic />} />

        <Route path="/staff/dashboard" element={<ManagerBranchInfo />} /> */}

      </Route>
      <Route path="/404" element={<PageNotFound />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default MainRoutes;