import { useCart, type CartItem } from '@/hooks/cartContext';
import { MainApiRequest } from '@/services/MainApiRequest';
import { CheckCircle, Clock, CreditCard, MapPin, Tag, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Checkout.scss';
import LoadingIndicator from '@/components/common/LoadingIndicator/Loading';
import Breadcrumbs from '@/components/common/Breadcrumbs/Breadcrumbs';

interface LocationStateItem {
  productId: number;
  size: string;
  quantity: number;
  mood?: string;
}

interface ProductDetail {
  id: string;
  name: string;
  image: string;
  sizes: { sizeName: string; price: number }[];
}

interface OrderItem {
  productId: number;
  name: string;
  image: string;
  quantity: number;
  size: string;
  price: number;
  mood?: string;
}

interface Coupon {
  code: string;
  discount: number;
  description: string;
}

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
}

interface Membership {
  id: number;
  rank: string;
  mPrice: number;
  discount: number;
}

export const Checkout: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cart, fetchCart, removeCartItemsAfterOrder } = useCart();

  // Order items
  const [items, setItems] = useState<(OrderItem | CartItem)[]>([]);
  // Customer info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  // Methods
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  // Coupons
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  // Branches
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  // Membership
  const [membershipList, setMembershipList] = useState<Membership[]>([]);
  const [membershipDiscount, setMembershipDiscount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    MainApiRequest.get('/auth/callback')
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);

  useEffect(() => {
    MainApiRequest.get<Coupon[]>('/promote/coupon/list')
      .then((res) => setAvailableCoupons(res.data))
      .catch((err) => console.error('Failed to fetch coupons:', err));
  }, []);

  useEffect(() => {
    MainApiRequest.get<Membership[]>('/membership/list')
      .then((res) => setMembershipList(res.data))
      .catch((err) => console.error('Failed to fetch membership:', err));
  }, []);

  // Load items from state or cart
  useEffect(() => {
    const loadItems = async () => {
      if (state?.initialItems) {
        const mapped = await Promise.all(
          (state.initialItems as LocationStateItem[]).map(async (it) => {
            const { data: res } = await MainApiRequest.get<ProductDetail>(
              `/product/${it.productId}`
            );
            const sz = res.sizes.find((s) => s.sizeName === it.size) || {
              sizeName: it.size,
              price: 0,
            };
            return {
              productId: Number(res.id),
              name: res.name,
              image: res.image,
              size: it.size,
              mood: it.mood,
              quantity: it.quantity,
              price: sz?.price || 0,
            } as OrderItem;
          })
        );
        setItems(mapped);
      } else {
        await fetchCart();
        setItems(
          cart.map((it) => ({
            productId: Number(it.productId),
            name: it.name,
            image: it.image,
            size: it.size,
            mood: it.mood,
            quantity: it.quantity,
            price: it.price,
          }))
        );
      }
    };
    loadItems();
  }, [state, cart, fetchCart]);

  // Auto-fill user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await MainApiRequest.get<{
          data: {
            phone?: string;
            name?: string;
            email?: string;
            address?: string;
          };
        }>('/auth/callback');
        const profile = res.data.data;
        if (profile.phone) setPhone(profile.phone);
        if (profile.name) setName(profile.name);
        if (profile.email) setEmail(profile.email);
        if (profile.address) setAddress(profile.address);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };
    fetchUserInfo();
  }, []);

  // Load available branches
  useEffect(() => {
    if (!items.length) return;
    const loadBranches = async () => {
      const lists = await Promise.all(
        items.map((it) =>
          MainApiRequest.get<Branch[]>(`/product/available-branches/${it.productId}`)
            .then((res) => res.data)
            .catch(() => [])
        )
      );
      const common = lists.reduce((prev, curr) =>
        prev.filter((b) => curr.some((c) => c.id === b.id))
      );
      setBranches(common);
      if (common.length && selectedBranch === null) setSelectedBranch(common[0].id);
    };
    loadBranches();
  }, [items, selectedBranch]);

  // Calculate membership discount
  useEffect(() => {
    const fetchMembershipDiscount = async () => {
      try {
        const res = await MainApiRequest.get<{ msg: string; data: { rank: string } }>(
          '/auth/callback'
        );
        const rank = res.data.data.rank;
        const tier = membershipList.find((m) => m.rank === rank);
        if (tier) {
          setMembershipDiscount(tier.discount);
        }
      } catch (err) {
        console.error('Failed to fetch membership rank:', err);
      }
    };
    fetchMembershipDiscount();
  }, [membershipList]);

  const deliveryFee = deliveryMethod === 'delivery' ? 10000 : 0;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const membershipApplied = appliedCoupon ? 0 : membershipDiscount;
  const totalBeforeMembership = subtotal + deliveryFee - discount;
  const finalTotal = totalBeforeMembership - membershipApplied;

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    const c = availableCoupons.find((x) => x.code.toUpperCase() === code);
    if (c) {
      setAppliedCoupon(c);
    } else {
      alert('Mã giảm giá không hợp lệ!');
    }
  };

  const handlePlaceOrder = async () => {
    if (!name.trim() || !phone.trim()) {
      alert('Vui lòng nhập đầy đủ họ tên và số điện thoại.');
      return;
    }
    if (!selectedBranch) {
      alert('Vui lòng chọn chi nhánh.');
      return;
    }
    if (deliveryMethod === 'delivery' && !address.trim()) {
      alert('Vui lòng nhập địa chỉ giao hàng.');
      return;
    }

    setLoading(true);
    try {
      const { data: o } = await MainApiRequest.post<{ id: number }>('/order', {
        phoneCustomer: phone,
        name,
        address,
        serviceType: deliveryMethod === 'delivery' ? 'TAKE AWAY' : 'DINE IN',
        orderDate: new Date().toISOString(),
        status: 'PENDING',
        productIDs: items.map((it) => Number((it as any).productId)),
        branchId: selectedBranch!,
      });
      const orderId = o.id;
      await MainApiRequest.put(`/order/${orderId}`, {
        phoneCustomer: phone,
        serviceType: deliveryMethod === 'delivery' ? 'TAKE AWAY' : 'DINE IN',
        totalPrice: finalTotal,
        orderDate: new Date().toISOString(),
        status: 'PENDING',
      });

      await Promise.all(
        items.map((it) => {
          return MainApiRequest.post(`/order/detail/${orderId}`, {
            orderID: orderId,
            productID: Number(it.productId),
            size: it.size,
            mood: it.mood,
            quantity: it.quantity,
          });
        })
      );

      await removeCartItemsAfterOrder(items);

      if (!isLoggedIn) {
        const guestHistory = JSON.parse(localStorage.getItem('guest_order_history') || '[]');
        const newHistory = [{ orderId, phone }, ...guestHistory].slice(0, 10);
        localStorage.setItem('guest_order_history', JSON.stringify(newHistory));
      }

      navigate(`/tracking-order/${orderId}`, { replace: true });
    } catch (err) {
      console.error(err);
      alert('Đặt hàng thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // loading indicator
  if (!items.length) {
    return (
      <div className="checkout__empty">
        <LoadingIndicator text="Đang tải thông tin thanh toán..." />
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs
        title="Thanh toán"
        items={[{ label: 'Trang chủ', to: '/' }, { label: 'Thanh toán' }]}
      />

      <div className="checkout">
        <div className="container">
          <div className="checkout__grid">
            {/* Left Column */}
            <div className="checkout__left">
              {/* Customer Information */}
              <div className="checkout__card">
                <h2>Thông tin khách hàng</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ và tên *</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại *</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email (tùy chọn)"
                  />
                </div>
              </div>

              {/* Delivery Method */}
              <div className="checkout__card">
                <h2>Phương thức nhận hàng</h2>
                <div className="radio-options">
                  <div
                    className={`radio-option ${deliveryMethod === 'delivery' ? 'selected' : ''}`}
                    onClick={() => setDeliveryMethod('delivery')}
                  >
                    <input type="radio" checked={deliveryMethod === 'delivery'} readOnly />
                    <MapPin className="option-icon" />
                    <div className="option-info">
                      <div className="option-title">Giao hàng tận nơi</div>
                      <div className="option-desc">Phí giao hàng: 10,000₫</div>
                    </div>
                  </div>
                  <div
                    className={`radio-option ${deliveryMethod === 'pickup' ? 'selected' : ''}`}
                    onClick={() => setDeliveryMethod('pickup')}
                  >
                    <input type="radio" checked={deliveryMethod === 'pickup'} readOnly />
                    <Clock className="option-icon" />
                    <div className="option-info">
                      <div className="option-title">Nhận tại cửa hàng</div>
                      <div className="option-desc">Miễn phí – Sẵn sàng sau 15 phút</div>
                    </div>
                  </div>
                </div>

                {deliveryMethod === 'delivery' && (
                  <div className="form-group">
                    <label>Địa chỉ giao hàng *</label>
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Nhập địa chỉ giao hàng"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Chọn chi nhánh</label>
                  <select
                    value={selectedBranch ?? ''}
                    onChange={(e) => setSelectedBranch(Number.parseInt(e.target.value, 10))}
                  >
                    <option value="" disabled>
                      -- Chọn chi nhánh --
                    </option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} - {b.address}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Method */}
              <div className="checkout__card">
                <h2>Phương thức thanh toán</h2>
                <div className="radio-options">
                  <div
                    className={`radio-option ${paymentMethod === 'cash' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <input type="radio" checked={paymentMethod === 'cash'} readOnly />
                    <Wallet className="option-icon" />
                    <div className="option-info">
                      <div className="option-title">Tiền mặt</div>
                      <div className="option-desc">Thanh toán khi nhận hàng</div>
                    </div>
                  </div>
                  <div
                    className={`radio-option ${paymentMethod === 'transfer' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('transfer')}
                  >
                    <input type="radio" checked={paymentMethod === 'transfer'} readOnly />
                    <CreditCard className="option-icon" />
                    <div className="option-info">
                      <div className="option-title">Chuyển khoản</div>
                      <div className="option-desc">Chuyển khoản qua ngân hàng</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              <div className="checkout__card">
                <h2>Ghi chú đơn hàng</h2>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="checkout__right">
              {/* Order Summary */}
              <div className="checkout__card">
                <h2>Đơn hàng của bạn</h2>
                <div className="order-items">
                  {items
                    .filter(
                      (item) =>
                        !!item &&
                        typeof item.price !== 'undefined' &&
                        typeof item.quantity !== 'undefined'
                    )
                    .map((item) => (
                      <div key={item.productId} className="order-item">
                        <img
                          src={item.image || '/placeholder.svg?height=60&width=60'}
                          alt={item.name}
                        />
                        <div className="item-info">
                          <div className="item-name">{item.name}</div>
                          <div className="item-details">
                            ({item.size}
                            {item.mood ? `, ${item.mood}` : ''}) x{item.quantity}
                          </div>
                        </div>
                        <div className="item-price">
                          {(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString(
                            'vi-VN'
                          )}
                          ₫
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Coupon */}
              <div className="checkout__card">
                <h2>
                  <Tag size={20} />
                  Mã giảm giá
                </h2>
                <div className="coupon-input">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                  />
                  <button className="primaryBtn" onClick={handleApplyCoupon}>
                    Áp dụng
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="applied-coupon">
                    <CheckCircle className="coupon-icon" />
                    <div className="coupon-info">
                      <div className="coupon-code">{appliedCoupon.code}</div>
                      <div className="coupon-desc">{appliedCoupon.description}</div>
                    </div>
                    <div className="coupon-discount">
                      -{Number(appliedCoupon.discount || 0).toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                )}

                <div className="available-coupons">
                  <div className="coupons-label">Mã giảm giá có sẵn:</div>
                  {availableCoupons.map((coupon) => (
                    <div
                      key={coupon.code}
                      className="coupon-option"
                      onClick={() => setCouponCode(coupon.code)}
                    >
                      <div className="coupon-content">
                        <div className="coupon-code">{coupon.code}</div>
                        <div className="coupon-desc">{coupon.description}</div>
                      </div>
                      <div className="coupon-discount">
                        -{Number(coupon.discount || 0).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="checkout__card">
                <h2>Tổng cộng</h2>
                <div className="total-breakdown">
                  <div className="total-line">
                    <span>Tạm tính</span>
                    <span>{Number(subtotal || 0).toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="total-line">
                    <span>Phí giao hàng</span>
                    <span>{Number(deliveryFee || 0).toLocaleString('vi-VN')}₫</span>
                  </div>
                  {discount > 0 && (
                    <div className="total-line discount">
                      <span>Giảm giá voucher</span>
                      <span>-{Number(discount || 0).toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}
                  {membershipApplied > 0 && (
                    <div className="total-line discount">
                      <span>Giảm giá thành viên</span>
                      <span>-{Number(membershipApplied || 0).toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}
                  <div className="total-line final">
                    <strong>Tổng cộng</strong>
                    <strong>{Number(finalTotal || 0).toLocaleString('vi-VN')}₫</strong>
                  </div>
                </div>

                <button
                  className="primaryBtn place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                </button>

                <div className="terms-note">
                  Bằng cách đặt hàng, bạn đồng ý với <a href="/terms">Điều khoản dịch vụ</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
