import { useCart } from '@/hooks/cartContext';
import { useAuth } from '@/hooks/useAuth';
import LoginPromptModal from '@/components/common/LoginPromptModal/LoginPromptModal';
import { message } from 'antd';
import React, { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { createProductUrl } from '@/utils/slugify';
import './CardListView.scss';

export interface ProductSize {
  sizeName: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  available: boolean;
  sizes: ProductSize[];
  hot?: boolean;
  cold?: boolean;
  description?: string;
  isPopular: boolean;
  isNew?: boolean;
  rating?: number;
  discount?: number;
}

interface Props {
  product: Product;
  onProductClick?: (productId: string) => void;
  onAddToCart?: (productId: number, size: string, quantity: number, mood?: string) => void;
}

const CardListView: React.FC<Props> = ({ product, onProductClick, onAddToCart: onAddToCartProp }) => {
  const [selectedSizeIndex] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  const size = product.sizes[selectedSizeIndex];
  const finalPrice = (size.price - (product.discount || 0)).toLocaleString('vi-VN') + '₫';

  const defaultMood = ['Cà phê', 'Trà trái cây'].includes(product.category)
    ? product.hot
      ? 'hot'
      : 'cold'
    : undefined;

  const handleProductClick = () => {
    if (onProductClick) {
      onProductClick(product.id);
    } else {
      navigate(createProductUrl(product.name, product.id));
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.available) return;
    
    // Nếu có onAddToCart từ parent, sử dụng nó (parent sẽ handle login check)
    if (onAddToCartProp) {
      onAddToCartProp(Number(product.id), size.sizeName, 1, defaultMood);
      return;
    }
    
    // Nếu không, sử dụng logic mặc định với login check
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    
    addToCart(Number(product.id), size.sizeName, 1, defaultMood)
      .then(() => message.success('Đã thêm vào giỏ hàng'))
      .catch((err) => {
        console.error('Error adding to cart:', err);
        message.error('Không thể thêm vào giỏ hàng');
      });
  };

  return (
    <>
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
      <div className="product-list-item" onClick={handleProductClick}>
        <div className="pli__image">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="pli__info">
          <h3 className="pli__title">{product.name}</h3>
          {product.description && <p className="pli__desc">{product.description}</p>}
          <div className="pli__badges">
            <span className="badge category">{product.category}</span>
            {product.isPopular && <span className="badge hot">Hot</span>}
          </div>
        </div>
        <div className="pli__actions">
          <span className="pli__price">{finalPrice}</span>
          <button className="pli__btn" onClick={handleAddToCart} disabled={!product.available}>
            <FaShoppingCart size={16} color="#fff" />
          </button>
        </div>
      </div>
    </>
  );
};

export default CardListView;
