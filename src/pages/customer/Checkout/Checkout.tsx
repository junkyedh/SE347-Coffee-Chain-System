import Breadcrumbs from '@/components/common/Breadcrumbs/Breadcrumbs';
import LoadingIndicator from '@/components/common/LoadingIndicator/Loading';
import SEO from '@/components/common/SEO';
import { useCart, type CartItem } from '@/hooks/cartContext';
import { MainApiRequest } from '@/services/MainApiRequest';
import { ROUTES } from '@/constants';
import { CheckCircle, Clock, CreditCard, MapPin, Tag, Wallet, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Checkout.scss';
import { getProductDisplayInfo } from '@/utils/productSize';
import { calculateOrderTotal, Coupon } from '@/utils/priceCalculator';
import { useToast } from '@/components/common/Toast/Toast';
import { Modal } from 'antd';
import { useSystemContext } from '@/hooks/useSystemContext';

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

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
}

export const Checkout: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cart, fetchCart, removeCartItemsAfterOrder, getCartBranchId } = useCart();
  const { isLoggedIn } = useSystemContext();

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
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [fixedBranch, setFixedBranch] = useState<Branch | null>(null); // Chi nhánh được cố định từ Menu
  
  const [membershipRank, setMembershipRank] = useState<string>(''); 
  
  const [loading, setLoading] = useState(false);
  
  const toast = useToast();

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để thanh toán');
      navigate(ROUTES.LOGIN);
    }
  }, [isLoggedIn, navigate, toast]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        if (
          state?.initialItems &&
          Array.isArray(state.initialItems) &&
          state.initialItems.length > 0
        ) {
          const mapped = await Promise.all(
            (state.initialItems as LocationStateItem[]).map(async (it) => {
              const { data: product } = await MainApiRequest.get<{
                id: string;
                name: string;
                image: string;
                category: string;
                sizes: { sizeName: string; price: number }[];
              }>(`/product/${it.productId}`);

              const { price } = getProductDisplayInfo(product as any, it.size);

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

  useEffect(() => {
    if (!state?.initialItems && cart.length > 0) {
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
      // Kiểm tra xem có chi nhánh cố định từ giỏ hàng không
      const cartBranchId = getCartBranchId();
      
      if (cartBranchId) {
        // Nếu có chi nhánh từ giỏ hàng (từ Menu), lấy thông tin chi nhánh đó
        try {
          const res = await MainApiRequest.get<Branch>(`/branch/${cartBranchId}`);
          setFixedBranch(res.data);
          setSelectedBranch(cartBranchId);
          setBranches([res.data]);
          return;
        } catch (error) {
          console.error('Error loading fixed branch:', error);
          toast.error('Không thể tải thông tin chi nhánh.');
        }
      }
      
      // Nếu không có chi nhánh cố định, load các chi nhánh có sản phẩm
      const lists = await Promise.all(
        items.map((it) =>
          MainApiRequest.get<Branch[]>(`/product/available-branches/${it.productId}`)
            .then((res) => res.data)
            .catch(() => [])
        )
      );
      if (lists.length === 0) return;
      
      const common = lists.reduce((prev, curr) =>
        prev.filter((b) => curr.some((c) => c.id === b.id))
      );
      
      if (common.length === 0) {
        toast.warning('Không có chi nhánh nào có đủ tất cả sản phẩm trong giỏ hàng. Vui lòng kiểm tra lại.');
      }
      
      setBranches(common);
      if (common.length && selectedBranch === null) setSelectedBranch(common[0].id);
    };
    loadBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, selectedBranch, getCartBranchId]);

  useEffect(() => {
    const fetchMembershipRank = async () => {
      try {
        const res = await MainApiRequest.get<{ msg: string; data: { rank: string } }>(
          '/auth/callback'
        );
        const rank = res.data.data.rank;
        setMembershipRank(rank || '');
      } catch (err) {
        setMembershipRank('');
      }
    };
    fetchMembershipRank();
  }, []);

  // Reset coupon khi đổi chi nhánh để tránh áp coupon của chi nhánh cũ
  useEffect(() => {
    if (!appliedCoupon) return;
    setAppliedCoupon(null);
    setCouponCode('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = deliveryMethod === 'delivery' ? 10000 : 0;

  const { 
    finalTotal, 
    couponDiscount, 
    membershipDiscount, 
    isMembershipSkipped,
    totalDiscount
  } = calculateOrderTotal({
    subtotal,
    deliveryFee,
    coupon: appliedCoupon,
    membershipRank: membershipRank
  });

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      toast.warning('Vui lòng nhập mã giảm giá.');
      return;
    }

    if (!selectedBranch) {
      toast.warning('Vui lòng chọn chi nhánh trước khi áp dụng mã giảm giá.');
      return;
    }

    setIsCheckingCoupon(true);
    try {
      const res = await MainApiRequest.get<Coupon[] | Coupon>(
        `/promote/coupon/check?code=${encodeURIComponent(code)}&branchId=${selectedBranch}`
      );
      
      // Xử lý response: có thể là array hoặc object
      let couponData: Coupon | null = null;
      
      if (Array.isArray(res.data)) {
        couponData = res.data.length > 0 ? res.data[0] : null;
      } else if (res.data && typeof res.data === 'object') {
        couponData = res.data;
      }
      
      if (!couponData || !couponData.code) {
        toast.error('Mã giảm giá không tồn tại.');
        setAppliedCoupon(null);
        return;
      }
      
      // Kiểm tra status của coupon
      if (couponData.status?.toLowerCase() === 'hết hạn') {
        toast.error('Chương trình khuyến mãi đã kết thúc.');
        setAppliedCoupon(null);
        return;
      }
      
      if (couponData.status?.toLowerCase() !== 'có hiệu lực') {
        toast.error(`Mã giảm giá không khả dụng (${couponData.status}).`);
        setAppliedCoupon(null);
        return;
      }
      
      // Nếu có membership rank, hiển thị modal thông báo
      if (membershipRank) {
        Modal.confirm({
          title: 'Xác nhận áp dụng mã giảm giá',
          content: (
            <div>
              <p style={{ marginBottom: '12px' }}>
                Bạn hiện đang có ưu đãi thành viên <strong style={{ color: '#059669' }}>{membershipRank}</strong>.
              </p>
              <div style={{ 
                marginBottom: '12px', 
                padding: '12px',
                backgroundColor: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '8px'
              }}>
                <p style={{ color: '#f59e0b', marginBottom: '8px' }}>
                  ⚠️ Khi áp dụng mã <strong>{couponData.code}</strong>, 
                  ưu đãi thành viên sẽ <strong>không được áp dụng đồng thời</strong>.
                </p>
              </div>
              <p>Bạn có chắc chắn muốn sử dụng mã giảm giá này không?</p>
            </div>
          ),
          okText: 'Xác nhận',
          cancelText: 'Hủy',
          onOk: () => {
            setAppliedCoupon(couponData);
            toast.success(`Áp dụng mã giảm giá "${couponData.code}" thành công!`);
          },
          onCancel: () => {
            // Không làm gì khi hủy
          },
        });
      } else {
        // Áp dụng trực tiếp nếu không có member discount
        setAppliedCoupon(couponData);
        toast.success(`Áp dụng mã giảm giá "${couponData.code}" thành công!`);
      }
    } catch (err: any) {
      setAppliedCoupon(null);
      const status = err?.response?.status;
      const rawMsg = err?.response?.data?.message;
      
      let errorMessage = 'Mã giảm giá không hợp lệ!';
      
      if (status === 404) {
        errorMessage = 'Mã giảm giá không tồn tại hoặc không áp dụng cho chi nhánh này.';
      } else if (status === 400 && rawMsg) {
        errorMessage = Array.isArray(rawMsg) ? rawMsg.join(', ') : rawMsg;
      } else if (rawMsg) {
        errorMessage = Array.isArray(rawMsg) ? rawMsg.join(', ') : rawMsg;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');

    if (membershipRank) {
      toast.info(
        `Đã hủy mã giảm giá. Ưu đãi thành viên (${membershipRank}) đã được áp dụng lại.`
      );
    } else {
      toast.success('Đã hủy mã giảm giá.');
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

    if (items.length === 0) {
      alert('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.');
      return;
    }

    if (paymentMethod === 'vnpay' && finalTotal < 5000) {
      alert(
        'Số tiền thanh toán qua VNPay phải từ 5,000đ trở lên. Vui lòng thêm sản phẩm hoặc chọn phương thức thanh toán khác.'
      );
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

      // Cập nhật thông tin chi tiết đơn hàng
      await MainApiRequest.put(`/order/${orderId}`, {
        phoneCustomer: phone,
        serviceType: deliveryMethod === 'delivery' ? 'TAKE AWAY' : 'DINE IN',
        totalPrice: finalTotal,
        orderDate: new Date().toISOString(),
        status: orderStatus,
        paymentMethod: paymentMethod,
        paymentStatus: 'Chưa thanh toán',
        discount: totalDiscount
      });

      await Promise.all(
        items.map((it) => {
          return MainApiRequest.post(`/order/detail/${orderId}`, {
            orderID: orderId,
            productID: Number(it.productId),
            size: it.size,
            mood: it.mood,
            quantity: it.quantity,
            price: it.price
          });
        })
      );

      await removeCartItemsAfterOrder(items);

      if (!isLoggedIn) {
        const guestHistory = JSON.parse(localStorage.getItem('guest_order_history') || '[]');
        const newHistory = [{ orderId, phone }, ...guestHistory].slice(0, 10);
        localStorage.setItem('guest_order_history', JSON.stringify(newHistory));
      }

      // VNPay Return URL - trỏ trực tiếp về frontend
      const vnpayReturnUrl =
        process.env.REACT_APP_VNPAY_RETURN_URL?.trim() ||
        `${(process.env.REACT_APP_BASE_URL || window.location.origin).replace(/\/+$/, '')}/vnpay-callback`;

      if (paymentMethod === 'vnpay') {
        try {
          const { data: paymentData } = await MainApiRequest.post('/payment/vnpay/create', {
            orderId,
            amount: finalTotal,
            orderInfo: `Thanh toan don hang ${orderId}`,
            returnUrl: vnpayReturnUrl,
          });

          if (paymentData.paymentUrl) {
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
        description="Thanh toán đơn hàng tại SE347 Coffee Chain."
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
                  {fixedBranch ? (
                    <div style={{
                      padding: '12px 16px',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <MapPin size={18} color="#6b7280" />
                      <div>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{fixedBranch.name}</div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>{fixedBranch.address}</div>
                      </div>
                      <div style={{
                        marginLeft: 'auto',
                        padding: '4px 8px',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        fontSize: '12px',
                        borderRadius: '4px',
                        fontWeight: 500
                      }}>
                        Đã chọn từ Menu
                      </div>
                    </div>
                  ) : (
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
                  )}
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

                {!appliedCoupon ? (
                  <div className="coupon-input">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Nhập mã giảm giá"
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      disabled={isCheckingCoupon}
                    />
                    <button 
                      className="primaryBtn" 
                      onClick={handleApplyCoupon}
                      disabled={isCheckingCoupon}
                    >
                      {isCheckingCoupon ? 'Đang kiểm tra...' : 'Áp dụng'}
                    </button>
                  </div>
                ) : (
                  <div
                    className="applied-coupon-container"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      marginTop: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle className="coupon-icon" size={18} color="#16a34a" />
                      <div>
                        <div
                          className="coupon-code"
                          style={{ fontWeight: 'bold', color: '#16a34a' }}
                        >
                          {appliedCoupon.code}
                        </div>
                        <div className="coupon-desc" style={{ fontSize: '12px', color: '#666' }}>
                          {appliedCoupon.promote.name}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '14px',
                      }}
                    >
                      <X size={16} /> Bỏ chọn
                    </button>
                  </div>
                )}

                {appliedCoupon && (
                  <div
                    className="coupon-discount"
                    style={{
                      textAlign: 'right',
                      marginTop: '5px',
                      fontSize: '14px',
                      color: '#16a34a',
                    }}
                  >
                    Giảm:{' '}
                    {appliedCoupon.promote.promoteType === 'Phần trăm'
                      ? `-${appliedCoupon.promote.discount}%`
                      : `-${Number(appliedCoupon.promote.discount || 0).toLocaleString('vi-VN')}₫`}
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

                  {(membershipDiscount > 0 || (isMembershipSkipped && membershipRank)) && (
                    <div
                      className="total-line discount"
                      style={{
                        opacity: isMembershipSkipped ? 0.5 : 1,
                        textDecoration: isMembershipSkipped ? 'line-through' : 'none',
                      }}
                    >
                      <span>
                        Giảm giá thành viên ({membershipRank})
                        {isMembershipSkipped && (
                          <span style={{ fontSize: '11px', display: 'block', textDecoration: 'none' }}>
                            (Không áp dụng cùng voucher)
                          </span>
                        )}
                      </span>
                      <span>-{Number(membershipDiscount || 0).toLocaleString('vi-VN')}₫</span>
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