import Breadcrumbs from '@/components/common/Breadcrumbs/Breadcrumbs';
import LoadingIndicator from '@/components/common/LoadingIndicator/Loading';
import SEO from '@/components/common/SEO';
import { useCart, type CartItem } from '@/hooks/cartContext';
import { MainApiRequest } from '@/services/MainApiRequest';
import { ROUTES } from '@/constants';
import { CheckCircle, Clock, CreditCard, MapPin, Tag, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Checkout.scss';

interface LocationStateItem {
  productId: number;
  size: string;
  quantity: number;
  mood?: string;
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
  promote: {
    id: number;
    name: string;
    promoteType: 'Phần trăm' | 'Cố định';
    discount: number;
  };
}

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
}

export const Checkout: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cart, fetchCart, removeCartItemsAfterOrder } = useCart();

  const [items, setItems] = useState<(OrderItem | CartItem)[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'vnpay'>('cash');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
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
    const loadItems = async () => {
      try {
        if (state?.initialItems && Array.isArray(state.initialItems) && state.initialItems.length > 0) {
          const mapped = await Promise.all(
            (state.initialItems as LocationStateItem[]).map(async (it) => {
              // Fetch product details với đầy đủ thông tin
              const { data: product } = await MainApiRequest.get<{
                id: string;
                name: string;
                image: string;
                category: string;
                sizes: { sizeName: string; price: number }[];
              }>(`/product/${it.productId}`);
              
              const isCake = product.category === 'Bánh ngọt';
              
              let price = 0;
              if (isCake) {
                // Với bánh ngọt: whole = piece × 8
                if (it.size === 'whole') {
                  const piecePrice = product.sizes.find((s) => s.sizeName === 'piece')?.price || product.sizes[0]?.price || 0;
                  price = piecePrice * 8;
                } else if (it.size === 'piece') {
                  price = product.sizes.find((s) => s.sizeName === 'piece')?.price || product.sizes[0]?.price || 0;
                } else {
                  const sz = product.sizes.find((s) => s.sizeName === it.size);
                  price = sz?.price || product.sizes[0]?.price || 0;
                }
              } else {
                // Với đồ uống và sản phẩm khác
                const sz = product.sizes.find((s) => s.sizeName === it.size);
                price = sz?.price || product.sizes[0]?.price || 0;
              }
                            
              return {
                productId: Number(product.id),
                name: product.name,
                image: product.image,
                size: it.size,
                mood: it.mood,
                quantity: it.quantity,
                price: price,
              } as OrderItem;
            })
          );
          setItems(mapped);
        } else {
          await fetchCart();
          const cartItems = cart.map((it) => ({
            productId: Number(it.productId),
            name: it.name,
            image: it.image,
            size: it.size,
            mood: it.mood,
            quantity: it.quantity,
            price: it.price,
          }));
          setItems(cartItems);
        }
      } catch (error) {
        console.error('[Checkout] Error loading items:', error);
      }
    };
    loadItems();
  }, [state, cart, fetchCart]);

  // Load from cart if no state provided
  useEffect(() => {
    if (!state?.initialItems && cart.length > 0) {
      console.log('[Checkout] Updating items from cart changes');
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
  }, [cart, state]);

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
    const fetchMembershipRank = async () => {
      try {
        const res = await MainApiRequest.get<{ msg: string; data: { rank: string } }>(
          '/auth/callback'
        );
        const rank = res.data.data.rank;
        // Lưu rank để tính toán giảm giá
        setMembershipDiscount(rank as any);
      } catch (err) {
        console.error('Failed to fetch membership rank:', err);
        setMembershipDiscount(0);
      }
    };
    fetchMembershipRank();
  }, []);

  const deliveryFee = deliveryMethod === 'delivery' ? 10000 : 0;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  
  console.log('[Checkout] Price calculation:', { 
    itemsCount: items.length, 
    subtotal, 
    deliveryFee,
    items: items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity }))
  });
  
  // Tính toán theo thứ tự: subtotal + phí ship - mã giảm giá - giảm giá membership
  const totalAfterDelivery = subtotal + deliveryFee;
  
  // Tính giảm giá từ voucher (có thể là % hoặc số tiền cố định)
  let couponDiscount = 0;
  if (appliedCoupon) {
    const promote = appliedCoupon.promote;
    if (promote.promoteType === 'Phần trăm') {
      // Giảm theo phần trăm
      couponDiscount = Math.floor(totalAfterDelivery * (promote.discount / 100));
    } else {
      // Giảm số tiền cố định
      couponDiscount = promote.discount;
    }
    // Voucher không được giảm quá tổng tiền (tối thiểu phải còn 1,000đ)
    couponDiscount = Math.min(couponDiscount, totalAfterDelivery - 1000);
  }
  
  const totalAfterCoupon = totalAfterDelivery - couponDiscount;
  
  // Tính giảm giá membership dựa trên rank (chỉ áp dụng nếu không dùng coupon)
  let membershipApplied = 0;
  if (!appliedCoupon && membershipDiscount) {
    const rank = membershipDiscount as any as string;
    
    if (rank === 'Kim cương') {
      // Kim cương: giảm 10%
      membershipApplied = Math.floor(totalAfterCoupon * 0.1);
    } else if (rank === 'Vàng') {
      // Vàng: giảm 7%, tối đa 10,000đ
      membershipApplied = Math.min(Math.floor(totalAfterCoupon * 0.07), 10000);
    } else if (rank === 'Bạc') {
      // Bạc: giảm 5%, tối đa 10,000đ
      membershipApplied = Math.min(Math.floor(totalAfterCoupon * 0.05), 10000);
    } else if (rank === 'Đồng') {
      // Đồng: giảm 3%, tối đa 10,000đ
      membershipApplied = Math.min(Math.floor(totalAfterCoupon * 0.03), 10000);
    }
    // Thường: không giảm (membershipApplied = 0)
  }
  
  // Đảm bảo finalTotal luôn >= 1000 VND
  const finalTotal = Math.max(1000, totalAfterCoupon - membershipApplied);
  
  console.log('[Checkout] Final calculation:', { 
    totalAfterDelivery,
    couponDiscount,
    totalAfterCoupon,
    membershipRank: membershipDiscount,
    membershipApplied,
    finalTotal 
  });

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
    
    // Kiểm tra giỏ hàng không rỗng
    if (items.length === 0) {
      alert('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.');
      return;
    }
    
    // Kiểm tra số tiền hợp lệ cho VNPay
    if (paymentMethod === 'vnpay' && finalTotal < 5000) {
      alert('Số tiền thanh toán qua VNPay phải từ 5,000đ trở lên. Vui lòng thêm sản phẩm hoặc chọn phương thức thanh toán khác.');
      return;
    }
    
    setLoading(true);
    try {
      const orderStatus = paymentMethod === 'vnpay' ? 'Nháp' : 'Chờ xác nhận';
      
      const { data: o } = await MainApiRequest.post<{ id: number }>('/order', {
        phoneCustomer: phone,
        name,
        address,
        serviceType: deliveryMethod === 'delivery' ? 'TAKE AWAY' : 'DINE IN',
        orderDate: new Date().toISOString(),
        status: orderStatus,
        productIDs: items.map((it) => Number((it as any).productId)),
        branchId: selectedBranch!,
      });
      const orderId = o.id;

      await MainApiRequest.put(`/order/${orderId}`, {
        phoneCustomer: phone,
        serviceType: deliveryMethod === 'delivery' ? 'TAKE AWAY' : 'DINE IN',
        totalPrice: finalTotal,
        orderDate: new Date().toISOString(),
        status: orderStatus,
        paymentMethod: paymentMethod, // 'cash' hoặc 'vnpay'
        paymentStatus: 'Chưa thanh toán',
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

      // If VNPay payment method is selected, redirect to payment URL
      if (paymentMethod === 'vnpay') {
        try {
          const { data: paymentData } = await MainApiRequest.post('/payment/vnpay/create', {
            orderId,
            amount: finalTotal,
            orderInfo: `Thanh toan don hang ${orderId}`,
            returnUrl: `${window.location.origin}/vnpay-callback`,
          });
                    
          if (paymentData.paymentUrl) {
            // Redirect to VNPay payment page
            window.location.href = paymentData.paymentUrl;
            return;
          } else {
            throw new Error('Không nhận được URL thanh toán từ VNPay');
          }
        } catch (err) {
          console.error('VNPay payment error:', err);
          alert('Không thể tạo thanh toán VNPay. Vui lòng thử lại.');
          setLoading(false);
          return;
        }
      }

      navigate(ROUTES.TRACKING_ORDER(String(orderId)), { replace: true });
    } catch (err) {
      console.error(err);
      alert('Đặt hàng thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="checkout__empty">
        <LoadingIndicator text="Đang tải thông tin thanh toán..." />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Thanh toán"
        description="Thanh toán đơn hàng tại SE347 Coffee Chain. Hỗ trợ nhiều phương thức thanh toán: tiền mặt, thẻ, VNPay. Giao hàng nhanh chóng và tiện lợi."
        keywords="thanh toán, checkout, đặt hàng, payment, giao hàng, VNPay, tiền mặt"
      />
      <Breadcrumbs
        title="Thanh toán"
        items={[{ label: 'Trang chủ', to: ROUTES.HOME }, { label: 'Thanh toán' }]}
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
                      <div className="option-desc">Thanh toán khi nhận hàng (COD)</div>
                    </div>
                  </div>
                  <div
                    className={`radio-option ${paymentMethod === 'vnpay' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('vnpay')}
                  >
                    <input type="radio" checked={paymentMethod === 'vnpay'} readOnly />
                    <CreditCard className="option-icon" />
                    <div className="option-info">
                      <div className="option-title">VNPay</div>
                      <div className="option-desc">Thanh toán online qua VNPay</div>
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
                      <div className="coupon-desc">{appliedCoupon.promote.name}</div>
                    </div>
                    <div className="coupon-discount">
                      {appliedCoupon.promote.promoteType === 'Phần trăm' 
                        ? `-${appliedCoupon.promote.discount}%` 
                        : `-${Number(appliedCoupon.promote.discount || 0).toLocaleString('vi-VN')}₫`
                      }
                    </div>
                  </div>
                )}
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
                  {couponDiscount > 0 && (
                    <div className="total-line discount">
                      <span>Giảm giá voucher</span>
                      <span>-{Number(couponDiscount || 0).toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}
                  {membershipApplied > 0 && (
                    <div className="total-line discount">
                      <span>Giảm giá thành viên ({membershipDiscount})</span>
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
                  Bằng cách đặt hàng, bạn đồng ý với <a href={ROUTES.TERMS}>Điều khoản dịch vụ</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
