import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPhoneAlt, FaLock, FaUser, FaMapMarkerAlt, FaVenusMars } from 'react-icons/fa';
import { AdminApiRequest } from '@/services/AdminApiRequest';
import './AdminLogin.scss';
import { message } from 'antd';

const RegisterCustomer: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    phone: '',
    name: '',
    gender: '',
    address: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const res = await AdminApiRequest.post('/auth/register', form);
    
      if (res.status === 201 || res.status === 200) {
        // Xóa sessionId của guest
        localStorage.removeItem('sessionId');
        message.success('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        message.error('Đăng ký thất bại.');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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
        <h1>Đăng ký tài khoản</h1>

        <form method="POST" className="needs-validation">
          <div className="my-3">
            <label htmlFor="phone" className="form-label">
              <FaPhoneAlt className="me-2" /> Số điện thoại
            </label>
            <input
              type="text"
              id="phone"
              className="form-control"
              name="phone"
              value={form.phone}
              placeholder="Nhập số điện thoại"
              required
              onChange={handleChange}
            />
          </div>

          <div className="my-3">
            <label htmlFor="name" className="form-label">
              <FaUser className="me-2" /> Họ tên
            </label>
            <input
              type="text"
              id="name"
              className="form-control"
              name="name"
              value={form.name}
              placeholder="Nhập họ tên"
              required
              onChange={handleChange}
            />
          </div>

          <div className="my-3">
            <label htmlFor="gender" className="form-label">
              <FaVenusMars className="me-2" /> Giới tính
            </label>
            <select
              id="gender"
              className="form-control"
              name="gender"
              value={form.gender}
              required
              onChange={handleChange}
            >
              <option value="">-- Chọn giới tính --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="my-3">
            <label htmlFor="address" className="form-label">
              <FaMapMarkerAlt className="me-2" /> Địa chỉ
            </label>
            <input
              type="text"
              id="address"
              className="form-control"
              name="address"
              value={form.address}
              placeholder="Nhập địa chỉ"
              required
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              <FaLock className="me-2" /> Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              name="password"
              value={form.password}
              placeholder="Nhập mật khẩu"
              required
              onChange={handleChange}
            />
          </div>

          <button
            type="button"
            className="btn btn-primary w-100"
            onClick={handleRegister}
          >
            Đăng ký
          </button>

          <div className="text-center mt-3">
            Đã có tài khoản?{' '}
            <span
              className="text-primary"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </span>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterCustomer;
