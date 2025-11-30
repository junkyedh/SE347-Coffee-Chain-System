import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSystemContext } from '@/hooks/useSystemContext';
import { FaPhoneAlt, FaLock } from 'react-icons/fa';
import './AdminLogin.scss';
import { AdminApiRequest } from '@/services/AdminApiRequest';
import { message } from 'antd';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, logout } = useSystemContext();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await AdminApiRequest.post('/auth/signin', {
        phone,
        password,
        userType: 'staff',
      });

      const token = res.data?.token;
      const role = res.data?.user?.role;

      if ((res.status === 200 || res.status === 201) && token && role) {
        // Chỉ cho phép các role quản trị đăng nhập admin
        if (role === 'ADMIN_SYSTEM' || role === 'ADMIN_BRAND' || role === 'STAFF') {
          setAuth(token, role);
          console.log('Đăng nhập thành công:', { token, role });
          switch (role) {
            case 'ADMIN_SYSTEM':
              navigate('/admin/dashboard');
              break;
            case 'ADMIN_BRAND':
              navigate('/manager/dashboard');
              break;
            case 'STAFF':
              navigate('/staff/dashboard');
              break;
          }
        } else {
          message.error('Bạn không có quyền truy cập vào hệ thống quản trị.');
        }
      } else {
        message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
      }
    } catch (error) {
      message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
    }
  };

  return (
    <div className="bg-login">
      <motion.div
        className="card1"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Đăng nhập Quản trị</h1>
        <div className="text-center mb-3 mt-2">
          <span className="text-muted">Dành cho quản trị viên, nhân viên, quản lý chi nhánh</span>
        </div>


        <form method="POST" className="needs-validation">
          <div className="my-3">
            <label htmlFor="phone" className="form-label">
              <FaPhoneAlt className="mx-3 me-2 my-2" /> Số điện thoại
            </label>
            <input
              type="phone"
              id="phone"
              className="form-control"
              name="phone"
              value={phone}
              placeholder="Nhập số điện thoại"
              required
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              <FaLock className="mx-3 me-2 mb-2" /> Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              name="password"
              value={password}
              placeholder="Nhập mật khẩu"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <input
                type="checkbox"
                id="remember"
                className="form-check-input"
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember" className="form-check-label ms-2 mt-1">
                Ghi nhớ đăng nhập
              </label>
            </div>
            <a href="/forgot-password" className="text-muted">
              Quên mật khẩu?
            </a>
          </div>
          <button type="button" className="btn btn-primary w-100" onClick={handleLogin}>
            Đăng nhập
          </button>
          <div className="text-center mt-3">
            <span className="text-muted">Bạn là khách hàng? </span>
            <span
              className="text-primary"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/login')}
            >
              Đăng nhập khách hàng
            </span>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
