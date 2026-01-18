import Breadcrumbs from '@/components/common/Breadcrumbs/Breadcrumbs';
import { Button } from '@/components/common/Button/Button';
import { Card, CardBody } from '@/components/common/Card/Card';
import { Search } from '@/components/common/Search/Search';
import SEO from '@/components/common/SEO';
import { ROUTES } from '@/constants';
import { useSystemContext } from '@/hooks/useSystemContext';
import { MainApiRequest } from '@/services/MainApiRequest';
import { createFeedbackUrl, createOrderTrackingUrl } from '@/utils/slugify';
import { message } from 'antd';
import { Calendar, CheckCircle, Clock, Truck } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { FaEye, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './HistoryOrder.scss';
import { getProductDisplayInfo } from '@/utils/productSize';

// --- Interfaces khớp với dữ liệu Backend ---

interface ProductSize {
  sizeName: string;
  price: number;
}

interface Product {
  id: string | number; // JSON trả về string, nhưng để flexible
  name: string;
  category: string;
  image: string;
  sizes: ProductSize[];
}

interface OrderDetailRaw {
  productId: number | string;
  size: string;
  mood?: string;
  quantity: number;
  feedback: boolean
}

interface OrderSummary {
  id: number;
  serviceType: 'TAKE AWAY' | 'DINE IN';
  orderDate: string;
  status: string;
  branchId: number;
  branchName?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  // Backend cần trả về mảng này trong API list
  order_details: OrderDetailRaw[];
}

const statusMap: Record<string, { label: string; color: string; icon: React.ComponentType }> = {
  Nháp: { label: 'Nháp', color: 'gray', icon: Clock },
  'Chờ xác nhận': { label: 'Chờ xác nhận', color: 'orange', icon: Clock },
  'Đã xác nhận': { label: 'Đã xác nhận', color: 'blue', icon: CheckCircle },
  'Đang chuẩn bị': { label: 'Đang chuẩn bị', color: 'orange', icon: Clock },
  'Sẵn sàng': { label: 'Sẵn sàng', color: 'green', icon: CheckCircle },
  'Đang giao': { label: 'Đang giao', color: 'purple', icon: Truck },
  'Hoàn thành': { label: 'Hoàn thành', color: 'green', icon: CheckCircle },
  'Đã hủy': { label: 'Đã hủy', color: 'red', icon: Clock },
};

const HistoryOrder: React.FC = () => {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderSummary[]>([]);
  // Thay vì lưu details riêng lẻ, ta lưu toàn bộ danh sách sản phẩm
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [phone, setPhone] = useState<string>('');
  const [guestHistory, setGuestHistory] = useState<{ orderId: number; phone: string }[] | null>(null);

  const navigate = useNavigate();
  const { isLoggedIn, userInfo, isInitialized } = useSystemContext();

  // 1. Tạo Map để tra cứu sản phẩm nhanh (O(1)) thay vì find
  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((p) => {
      // Quan trọng: Chuyển ID sang string để khớp với mọi kiểu dữ liệu
      map.set(String(p.id), p);
    });
    return map;
  }, [products]);

  // 2. Fetch danh sách sản phẩm (Chỉ chạy 1 lần khi mount)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Gọi API lấy list sản phẩm để map dữ liệu
        const res = await MainApiRequest.get<Product[]>('/product/list');
        // Xử lý response tùy theo cấu trúc trả về (res.data hoặc res.data.data)
        const rawProducts = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
        setProducts(rawProducts);
      } catch (error) {
        console.error('Lỗi tải danh sách sản phẩm:', error);
      }
    };
    fetchProducts();
  }, []);

  // 3. Xử lý logic Phone & Guest
  useEffect(() => {
    if (!isInitialized) return;

    if (isLoggedIn && userInfo?.phone) {
      setPhone(userInfo.phone);
      setGuestHistory(null);
      return;
    }

    const history = JSON.parse(localStorage.getItem('guest_order_history') || '[]');
    setGuestHistory(history);
    if (history.length > 0) setPhone(history[0].phone);
  }, [isInitialized, isLoggedIn, userInfo?.phone]);

  // 4. Fetch danh sách đơn hàng
  useEffect(() => {
    const fetchOrders = async () => {
      if (!phone && (!guestHistory || guestHistory.length === 0)) return;

      setLoading(true);
      try {
        let fetchedOrders: OrderSummary[] = [];

        if (phone) {
          // Trường hợp User đã đăng nhập: Gọi 1 API duy nhất
          const res = await MainApiRequest.get<OrderSummary[]>(`/order/customer/${encodeURIComponent(phone)}`);
          fetchedOrders = res.data;
        } else if (guestHistory) {
          // Trường hợp Guest: Phải gọi từng đơn (nhưng số lượng ít)
          // Dùng Promise.all để gọi song song
          const results = await Promise.all(
            guestHistory.map(async ({ orderId, phone }) => {
              try {
                const { data } = await MainApiRequest.get<OrderSummary>(
                  `/order/customer/${encodeURIComponent(phone)}/${orderId}`
                );
                return data;
              } catch {
                return null;
              }
            })
          );
          fetchedOrders = results.filter((o): o is OrderSummary => o !== null);
        }

        // Sắp xếp đơn mới nhất lên đầu
        fetchedOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
      } catch (err) {
        console.error(err);
        message.error('Không tải được lịch sử đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [phone, guestHistory]);

  // 5. Filter Logic
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toString().includes(searchTerm) ||
          order.branchName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const getRenderItem = (itemRaw: OrderDetailRaw) => {
    // Tìm sản phẩm trong Map
    const product = productMap.get(String(itemRaw.productId));

    const { price, displaySize, isValid } = getProductDisplayInfo(product, itemRaw.size);

    // Nếu chưa tải xong products hoặc không tìm thấy
    if (!isValid || !product) {
      return {
        ...itemRaw,
        name: product?.name || `Sản phẩm #${itemRaw.productId}`,
        image: product?.image || '/placeholder.svg',
        price: 0,
        displaySize: itemRaw.size,
        feedback: false,
      };
    }

    return {
      productId: product.id,
      name: product.name,
      image: product.image,
      size: displaySize,
      mood: itemRaw.mood,
      quantity: itemRaw.quantity,
      feedback: itemRaw.feedback,
      price: price,
    };
  };

  const getStatusBadge = (status: string) => {
    const info = statusMap[status] || { label: status, color: 'gray', icon: Clock };
    return (
      <div className={`status-badge status-${info.color}`}>
        {React.createElement(info.icon as React.ElementType, { className: 'status-icon' })}
        <span>{info.label}</span>
      </div>
    );
  };

  const uniqueStatuses = Array.from(new Set(orders.map((order) => order.status)));

  return (
    <>
      <SEO
        title="Lịch sử đơn hàng"
        description="Quản lý và theo dõi tất cả đơn hàng của bạn tại SE347 Coffee Chain."
        keywords="lịch sử đơn hàng, order history"
      />
      <Breadcrumbs
        title="Lịch sử đơn hàng"
        items={[
          { label: 'Trang chủ', to: ROUTES.HOME },
          { label: 'Lịch sử đơn hàng', to: ROUTES.HISTORY_ORDERS },
        ]}
      />

      <div className="history-order-container">
        <div className="history-header">
          <h1 className="page-title">Lịch sử đơn hàng</h1>
          <p className="page-subtitle">Quản lý và theo dõi tất cả đơn hàng của bạn</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <Search
            placeholder="Tìm kiếm theo mã đơn hoặc chi nhánh..."
            value={searchTerm}
            onChange={setSearchTerm}
            fullWidth
          />

          <div className="status-filters">
            <Button
              variant={statusFilter === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              Tất cả ({orders.length})
            </Button>
            {uniqueStatuses.map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {statusMap[status]?.label || status} (
                {orders.filter((o) => o.status === status).length})
              </Button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {loading && products.length === 0 ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>Không có đơn hàng nào</h3>
              <p>Bạn chưa có đơn hàng nào phù hợp với bộ lọc</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              // Map dữ liệu chi tiết cho từng đơn hàng
              const renderItems = (order.order_details || []).map(getRenderItem);
              const totalPrice = renderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

              return (
                <Card key={order.id} className="order-card">
                  <CardBody>
                    <div className="order-header">
                      <div className="order-info">
                        <h3 className="order-id">Đơn hàng #{order.id}</h3>
                        <div className="order-meta">
                          <span className="order-date">
                            <Calendar className="meta-icon" />
                            {new Date(order.orderDate).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="order-branch">
                            {order.branchName || 'Chi nhánh không xác định'}
                          </span>
                          <span className="order-type">
                            {order.serviceType === 'TAKE AWAY' ? 'Giao hàng' : 'Tại cửa hàng'}
                          </span>
                          <span
                            className={`payment-status ${order.paymentStatus === 'Đã thanh toán' ? 'paid' : 'unpaid'
                              }`}
                          >
                            {order.paymentStatus || 'Chưa thanh toán'}
                          </span>
                        </div>
                      </div>
                      <div className="order-status">{getStatusBadge(order.status)}</div>
                    </div>

                    <div className="order-body">
                      <div className="order-items">
                        {renderItems.slice(0, 3).map((item, idx) => (
                          <div key={`${item.productId}-${idx}`} className="order-item-preview">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="item-image"
                              onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                            />
                            <div className="item-info">
                              <span className="item-name">{item.name}</span>
                              <span className="item-details">
                                {item.size}
                                {item.mood ? `, ${item.mood === 'hot' ? 'Nóng' : 'Lạnh'}` : ''} ×{' '}
                                {item.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                        {renderItems.length > 3 && (
                          <div className="more-items">
                            +{renderItems.length - 3} sản phẩm khác
                          </div>
                        )}
                      </div>

                      <div className="order-summary">
                        <div className="order-total">
                          <span className="total-label">Tổng tiền:</span>
                          <span className="total-amount">
                            {totalPrice.toLocaleString('vi-VN')}₫
                          </span>
                        </div>
                        <div className="order-actions">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<FaEye />}
                            onClick={() => window.open(createOrderTrackingUrl(order.id), '_blank')}
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable details */}
                    <div className="order-details">
                      <details>
                        <summary className="details-toggle">Xem chi tiết đơn hàng</summary>
                        <div className="details-content">
                          {renderItems.map((item, idx) => (
                            <div key={`${item.productId}-${idx}`} className="detail-item">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="detail-image"
                                onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                              />
                              <div className="detail-info">
                                <div className="detail-name">{item.name}</div>
                                <div className="detail-specs">
                                  Size: {item.size}
                                  {item.mood && `, ${item.mood === 'hot' ? 'Nóng' : 'Lạnh'}`}
                                </div>
                                <div className="detail-quantity">Số lượng: {item.quantity}</div>
                                <div className="detail-price">
                                  Giá: {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                </div>
                              </div>
                              {order.status === 'Hoàn thành' && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  icon={<FaStar />}
                                  onClick={() => navigate(createFeedbackUrl(order.id, item.productId))}
                                  disabled={item.feedback}
                                >
                                  {item.feedback ? "Đã đánh giá" : "Đánh giá"}
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  </CardBody>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default HistoryOrder;