import { useCart } from '@/hooks/cartContext';
import { useAuth } from '@/hooks/useAuth';
import LoginPromptModal from '@/components/common/LoginPromptModal/LoginPromptModal';
import { message } from 'antd';
import React, { useState } from 'react';
import { FaCartPlus, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { createProductUrl } from '@/utils/slugify';
import './CardProduct.scss';

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
  totalRatings?: number;
  discount?: number;
}

interface Props {
  product: Product;
  onProductClick?: (productId: string) => void;
  onAddToCart?: (size: string, quantity: number, mood?: string) => void;
}

function normalizeSizes(raw: any[]): ProductSize[] {
  return raw.map((s) => ({
    sizeName: s.sizeName ?? s.name,
    price: s.price,
  }));
}

const CardProduct: React.FC<Props> = ({ product, onProductClick, onAddToCart }) => {
  const [selectedSizeIndex] = useState(0);
  const [quantity] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  const sizes = normalizeSizes(product.sizes);
  const size = sizes[selectedSizeIndex];
  const finalPrice = size.price - (product.discount || 0);

  const drinkCategories = ['Cà phê', 'Trà trái cây', 'Trà sữa', 'Nước ép', 'Sinh tố'];
  const defaultMood = drinkCategories.includes(product.category)
    ? product.hot
      ? 'hot'
      : product.cold
      ? 'cold'
      : undefined
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
    const idx = selectedSizeIndex ?? 0;
    const sizeName = sizes?.[idx]?.sizeName || sizes?.[0]?.sizeName;
    let mood = defaultMood;
    if (drinkCategories.includes(product.category) && !mood) {
      mood = 'cold';
    }
    if (product.category === 'Trà sữa' && !mood) {
      mood = 'cold';
    }
    
    // Nếu có onAddToCart từ parent, sử dụng nó (parent sẽ handle login check)
    if (onAddToCart) {
      onAddToCart(sizeName, quantity, mood);
    } else {
      // Nếu không, sử dụng logic mặc định với login check
      if (!isLoggedIn) {
        setShowLoginPrompt(true);
        return;
      }
      
      addToCart(Number(product.id), sizeName, 1, mood)
        .then(() => message.success('Đã thêm vào giỏ hàng'))
        .catch(() => message.error('Không thể thêm vào giỏ hàng'));
    }
  };

  return (
    <>
      <LoginPromptModal 
        isOpen={showLoginPrompt} 
        onClose={() => setShowLoginPrompt(false)} 
      />
      <div
        className={`cardProduct ${!product.available ? 'disabled' : ''}`}
        onClick={handleProductClick}
        style={{ cursor: product.available ? 'pointer' : 'not-allowed' }}
      >
      <div className="cardProductImageWrapper">
        <img src={product.image} alt={product.name} className="cardProductImage" />
        {(product.isPopular || product.isNew) && (
          <div className={`cardProductBadge ${product.isNew ? 'badgeNew' : 'badgePopular'}`}>
            {product.isNew ? 'Mới' : 'Phổ biến'}
          </div>
        )}
      </div>

      <div className="cardProductContent">
        <div className="cardProductHeader">
          <span className="cardProductCategory">{product.category}</span>
          {product.rating != null && product.rating > 0 && (
            <div className="cardProductRating">
              <FaStar className="ratingIcon" />
              <span>{product.rating.toFixed(1)}</span>
              {product.totalRatings && product.totalRatings > 0 && (
                <span className="ratingCount">({product.totalRatings})</span>
              )}
            </div>
          )}
        </div>

        <h3 className="cardProductTitle">{product.name}</h3>
        {product.description && <p className="cardProductDescription">{product.description}</p>}

        <div className="cardProductFooter">
          <div className="cardProductPriceGroup">
            <span className="cardProductPrice">{finalPrice.toLocaleString('vi-VN')}₫</span>
          </div>

          <div className="cardProductActions">
            <button
              type="button"
              className="cardProductBtn"
              onClick={(e) => {
                e.stopPropagation();
                handleProductClick();
              }}
              disabled={!product.available}
            >
              Chi tiết
            </button>
            <button
              type="button"
              className="cardProductCartBtn"
              onClick={handleAddToCart}
              disabled={!product.available}
            >
              <FaCartPlus />
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default CardProduct;
