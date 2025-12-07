import { useSystemContext } from '@/hooks/useSystemContext';
import { MainApiRequest } from '@/services/MainApiRequest';
import { message } from 'antd';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { FaLock, FaPhoneAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Login.scss';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, token, setAuth } = useSystemContext();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleRememberOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRemember(e.target.checked);
  };

  const handleLogin = async () => {
    try {
      const res = await MainApiRequest.post('/auth/signin', { phone, password, userType: 'customer' });
      if (res.status === 200 || res.status === 201) {
        const data = res.data;
        const token = data.token;
        // prefer role from response if provided, otherwise fallback to 'CUSTOMER'
        const role = data.user?.role || 'CUSTOMER';
        if (token) {
          setAuth(token, role);
          navigate('/');
        } else {
          message.error('Đăng nhập thất bại: không nhận được token.');
        }
      }
    } catch (error) {
      message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.');
      console.error('Đăng nhập thất bại:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && token) {
      navigate('/');
    }
  }, [isLoggedIn, token, navigate]);

  return (
    <div className="bg-login">
      <motion.div
        className="card1"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Đăng nhập</h1>
        <form className="needs-validation">
          <div className="my-3">
            <label htmlFor="phone" className="form-label">
              <FaPhoneAlt className="mx-3 me-2 my-2" /> Số điện thoại
            </label>
            <input
              type="text"
              id="phone"
              className="form-control"
              name="phone"
              value={phone}
              placeholder="Nhập số điện thoại"
              required
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="invalid-feedback">Số điện thoại không hợp lệ</div>
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
            <div className="invalid-feedback">Mật khẩu không hợp lệ</div>
          </div>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <input
                type="checkbox"
                id="remember"
                className="form-check-input"
                checked={remember}
                onChange={handleRememberOnChange}
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
            <span className="text-muted">Chưa có tài khoản? </span>
            <span
              className="text-primary"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/dang-ky')}
            >
              Đăng ký
            </span>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
