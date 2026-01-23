import Breadcrumbs from '@/components/common/Breadcrumbs/Breadcrumbs';
import LoadingIndicator from '@/components/common/LoadingIndicator/Loading';
import LoginPromptModal from '@/components/common/LoginPromptModal/LoginPromptModal';
import SEO from '@/components/common/SEO';
import ProductRating from '@/components/customer/RatingStar/ProductRating';
import { useCart } from '@/hooks/cartContext';
import { useAuth } from '@/hooks/useAuth';
import { UnifiedApiRequest } from '@/services/UnifiedApiRequest';
import { yellow } from '@mui/material/colors';
import { message } from 'antd';
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { FaMinus, FaPlus, FaStar } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { extractIdFromSlug } from '@/utils/slugify';
import './ProductDetail.scss';

interface ProductSize {
  sizeName: string;
  price: number;
}

interface ProductMaterial {
  materialId: number;
  materialQuantity: number;
  name: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  available: boolean;
  isPopular: boolean;
  isNew: boolean;
  hot?: boolean;
  cold?: boolean;
  sizes: ProductSize[];
  materials: ProductMaterial[];
}

interface RatingEntry {
  id: number;
  description: string;
  star: number;
  createdAt: string;
  customer: {
    phone: string;
    name: string;
    rank: string;
  };
}

interface RatingData {
  averageStar: number;
  totalRatings: number;
  starCounts: Record<'1' | '2' | '3' | '4' | '5', number>;
  ratings: RatingEntry[];
}

const DetailProduct: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedTemp, setSelectedTemp] = useState<'hot' | 'cold'>('cold');
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [filterStar, setFilterStar] = useState<'5' | '4' | '3' | '2' | '1' | 'all'>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest'>('newest');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) return;
    
    const productId = extractIdFromSlug(slug);
    
    UnifiedApiRequest.get(`/product/${productId}`)
      .then((res) => {
        const p: Product = res.data;
        setProduct(p);
        setSelectedSize(p.sizes[0]?.sizeName || '');
        if (p.hot) setSelectedTemp('hot');
        else if (p.cold) setSelectedTemp('cold');
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          console.error(err);
        }
      });

    UnifiedApiRequest.get<RatingData>(`/ratings/product/${productId}`)
      .then((res) => setRatingData(res.data))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        console.error('Failed to fetch ratings:', err);
        setRatingData(null);
      });
  }, [slug]);

  const displayedRatings = useMemo(() => {
    if (!ratingData) return [];
    let list = ratingData.ratings;

    if (filterStar !== 'all') {
      list = list.filter((r) => r.star.toString() === filterStar);
    }
    if (sortOption === 'newest') {
      list = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      list = [...list].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    return list;
  }, [ratingData, filterStar, sortOption]);

  if (!product)
    return (
      <div className="detailProduct__empty">
        <LoadingIndicator text="Đang tải sản phẩm..." />
      </div>
    );
  const isCake = product.category === 'Bánh ngọt';

  const drinkCategories = ['Cà phê', 'Trà trái cây', 'Trà sữa', 'Nước ép', 'Sinh tố'];
  const needsTemp = drinkCategories.includes(product.category)
    ? product.hot
      ? 'hot'
      : product.cold
      ? 'cold'
      : undefined
    : undefined;

  const currentPrice = (() => {
    if (isCake) {
      const base = product.sizes[0].price;
      return selectedSize === 'whole' ? base * 8 : base;
    }
    const sz = product.sizes.find((s) => s.sizeName === selectedSize);
    return sz?.price || 0;
  })();

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    
    try {
      await addToCart(
        Number(product.id),
        selectedSize,
        quantity,
        needsTemp ? selectedTemp : undefined
      );
      message.success('Đã thêm vào giỏ hàng!');
    } catch (error: any) {
      console.error('Thêm vào giỏ hàng thất bại:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Thêm vào giỏ hàng thất bại. Vui lòng thử lại sau.';
      message.error(errorMsg);
    }
  };

  const handlePlaceOrder = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    
    if (!product.available) return message.error('Sản phẩm đang hết hàng.');
    navigate(`/thanh-toan`, {
      state: {
        initialItems: [
          {
            productId: product.id,
            size: selectedSize,
            mood: needsTemp ? selectedTemp : undefined,
            quantity,
          },
        ],
      },
    });
  };

  return (
    <>
      <SEO
        title={product.name}
        description={`${product.description || product.name} - ${product.category}. Giá từ ${product.sizes[0]?.price.toLocaleString('vi-VN')}₫. Đặt hàng ngay tại SE347 Coffee Chain.`}
        keywords={`${product.name}, ${product.category}, cà phê, coffee, đặt hàng online, ${product.sizes.map(s => s.sizeName).join(', ')}`}
        ogImage={product.image}
      />
      <LoginPromptModal 
        isOpen={showLoginPrompt} 
        onClose={() => setShowLoginPrompt(false)} 
      />
      <Breadcrumbs
        title={product.name}
        items={[
          { label: 'Trang chủ', to: '/' },
          { label: product.category, to: `/san-pham/${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="detailProduct">
        <div className="detailProduct__left">
          <div className="image-wrapper">
            <img src={product.image} alt={product.name} />
            {product.isPopular && <span className="badge popular">Bán chạy</span>}
            {product.isNew && <span className="badge new">Mới</span>}
          </div>

          <div className="reviews">
            <div className="rating-summary">
              <h3>Đánh giá từ khách hàng</h3>
              {ratingData ? (
                <>
                  <div className="big-number">{ratingData.averageStar.toFixed(1)}</div>
                  <ProductRating
                    averageStar={ratingData.averageStar}
                    totalRatings={ratingData.totalRatings}
                  />
                  <ul className="star-breakdown">
                    {(['5', '4', '3', '2', '1'] as Array<'5' | '4' | '3' | '2' | '1'>).map(
                      (star) => {
                        const percentage = ratingData.totalRatings > 0 
                          ? (ratingData.starCounts[star] / ratingData.totalRatings) * 100 
                          : 0;
                        
                        return (
                          <li key={star}>
                            <span className="star-label">
                              {star}
                              <span
                                style={{
                                  marginLeft: 4,
                                  fontSize: 16,
                                  justifyContent: 'flex-start',
                                  top: -2,
                                }}
                              >
                                <FaStar style={{ color: yellow[700] }} />
                              </span>
                            </span>
                            <div className="bar">
                              <div
                                className={`fill ${ratingData.totalRatings === 0 ? 'no-ratings' : ''}`}
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>
                            <span className="count">{ratingData.starCounts[star]}</span>
                          </li>
                        );
                      }
                    )}
                  </ul>
                </>
              ) : (
                <div>Đang tải đánh giá…</div>
              )}
            </div>

            <div className="review-list">
              <div className="review-filters">
                <div className="filter-group">
                  <label>Lọc:</label>
                  <select
                    value={filterStar}
                    onChange={(e) =>
                      setFilterStar(e.target.value as '5' | '4' | '3' | '2' | '1' | 'all')
                    }
                  >
                    <option value="all">Tất cả</option>
                    <option value="5">5 sao</option>
                    <option value="4">4 sao</option>
                    <option value="3">3 sao</option>
                    <option value="2">2 sao</option>
                    <option value="1">1 sao</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Sắp xếp:</label>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as 'newest' | 'oldest')}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                  </select>
                </div>
              </div>
              {displayedRatings.map((r) => (
                <div key={r.id} className="review-item">
                  <div className="avatar">{r.customer.name.charAt(0)}</div>
                  <div className="review-content">
                    <div className="name-line">
                      <span className="name">{r.customer.name}</span>
                      <span className="purchased">Đã mua hàng</span>
                      <span className="date">
                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <ProductRating averageStar={r.star} showText={false} />
                    <div className="title">
                      {r.star >= 5 ? 'Tuyệt vời' : r.star >= 4 ? 'Tốt' : ''}
                    </div>
                    <p className="comment">{r.description}</p>
                    <div className="helpful">👍 Hữu ích (0)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="detailProduct__right">
          <div className="header">
            <div className="header-info">
              <span className="category">{product.category}</span>
              <span className={`status ${product.available ? 'in' : 'out'}`}>
                {product.available ? 'Có sẵn' : 'Hết hàng'}
              </span>
            </div>
            <h1>{product.name}</h1>
            {ratingData && (
              <ProductRating
                averageStar={ratingData.averageStar}
                totalRatings={ratingData.totalRatings}
              />
            )}
            <p className="desc">{product.description}</p>
          </div>

          <div className="materials">
            <h4>Nguyên liệu</h4>
            <div className="material-list">
              {product.materials.map((m) => (
                <span key={m.materialId} className="material-badge">
                  {m.name}
                </span>
              ))}
            </div>
          </div>

          <hr className="divider" />

          {/* Size */}
          <div className="options size-options">
            <p className="option-title">{isCake ? 'Phần ăn:' : 'Kích thước:'}</p>
            <div className="option-cards">
              {isCake
                ? ['piece', 'whole'].map((val) => (
                    <label
                      key={val}
                      className={`option-card ${selectedSize === val ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={val}
                        checked={selectedSize === val}
                        onChange={() => setSelectedSize(val)}
                      />
                      <span className="label-text">
                        {val === 'piece' ? '🍰 1 miếng' : '🎂 Cả bánh'}
                      </span>
                      <span className="label-price">
                        {(
                          (val === 'piece' ? product.sizes[0].price : product.sizes[0].price * 8) ||
                          0
                        ).toLocaleString('vi-VN')}
                        ₫
                      </span>
                    </label>
                  ))
                : product.sizes.map((s) => (
                    <label
                      key={s.sizeName}
                      className={`option-card ${selectedSize === s.sizeName ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={s.sizeName}
                        checked={selectedSize === s.sizeName}
                        onChange={() => setSelectedSize(s.sizeName)}
                      />
                      <span className="label-text">{s.sizeName}</span>
                      <span className="label-price">{s.price.toLocaleString('vi-VN')}₫</span>
                    </label>
                  ))}
            </div>
          </div>

          {needsTemp && (
            <div className="options temp-options">
              <p className="option-title">Nhiệt độ:</p>
              <div className="option-cards">
                <button
                  className={`option-card ${selectedTemp === 'hot' ? 'active' : ''}`}
                  onClick={() => setSelectedTemp('hot')}
                >
                  <input
                    type="radio"
                    name="temp"
                    value="hot"
                    checked={selectedTemp === 'hot'}
                    onChange={() => setSelectedTemp('hot')}
                  />
                  <span className="label-text">🔥 Nóng</span>
                </button>
                <button
                  className={`option-card ${selectedTemp === 'cold' ? 'active' : ''}`}
                  onClick={() => setSelectedTemp('cold')}
                >
                  <input
                    type="radio"
                    name="temp"
                    value="cold"
                    checked={selectedTemp === 'cold'}
                    onChange={() => setSelectedTemp('cold')}
                  />
                  <span className="label-text">🧊 Lạnh</span>
                </button>
              </div>
            </div>
          )}

          <div className="quantity">
            <h4>Số lượng</h4>
            <div className="quantity-controls">
              <button
                className="quantity-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <FaMinus />
              </button>
              <span className="quantity-value">{quantity}</span>
              <button className="quantity-btn" onClick={() => setQuantity((q) => q + 1)}>
                <FaPlus />
              </button>
            </div>
          </div>

          <hr className="divider" />

          <div className="summary">
            <div className="summary-price">
              Tổng cộng:
              <span>{(currentPrice * quantity).toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="summary-actions">
              <button className="btn add-cart" onClick={handleAddToCart}>
                Thêm vào giỏ hàng
              </button>
              <button className="btn buy-now" onClick={handlePlaceOrder}>
                Mua ngay
              </button>
            </div>
          </div>

          <hr className="divider" />

          <div className="info">
            <p>⏰ Thời gian chuẩn bị: {isCake ? '10-15 phút' : '5-10 phút'}</p>
            <p>🚚 Giao hàng: 15-30 phút</p>
            <p>📍 Có sẵn tại: Tất cả cửa hàng</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailProduct;
