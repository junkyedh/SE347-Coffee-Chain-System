import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPromptModal.scss';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/dang-nhap');
  };

  const handleContinueBrowsing = () => {
    onClose();
  };

  return (
    <div className="login-prompt-overlay" onClick={onClose}>
      <div className="login-prompt-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        
        <div className="modal-icon">
          🔒
        </div>
        
        <h2 className="modal-title">Yêu cầu đăng nhập</h2>
        
        <p className="modal-message">
          Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng và mua hàng.
        </p>
        
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={handleLogin}>
            Đăng nhập ngay
          </button>
          <button className="btn btn-secondary" onClick={handleContinueBrowsing}>
            Tiếp tục lướt xem
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
