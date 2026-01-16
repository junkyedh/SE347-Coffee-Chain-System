import Breadcrumbs from '@/components/common/Breadcrumbs/Breadcrumbs';
import { Button } from '@/components/common/Button/Button';
import { Card, CardBody } from '@/components/common/Card/Card';
import { Search } from '@/components/common/Search/Search';
import SEO from '@/components/common/SEO';
import { ROUTES } from '@/constants';
import { MainApiRequest } from '@/services/MainApiRequest';
import { createOrderTrackingUrl, createFeedbackUrl } from '@/utils/slugify';
import { message } from 'antd';
import { Calendar, CheckCircle, Clock, Truck } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { FaEye, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './HistoryOrder.scss';
import { useSystemContext } from '@/hooks/useSystemContext';

interface OrderSummary {
  id: number;
  serviceType: 'TAKE AWAY' | 'DINE IN';
  orderDate: string;
  status: string;
  branchId: number;
  branchName?: string;
  productIDs: (number | null)[];
  paymentMethod?: string;
  paymentStatus?: string;
}

interface OrderDetail {
  productId: number;
  name: string;
  image: string;
  size: string;
  mood?: string;
  quantity: number;
  price: number;
}

interface ProductDetail {
  id: number;
  name: string;
  image: string;
  sizes: {
    sizeName: string;
    price: number;
  }[];
}

// SAU
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
  const [details, setDetails] = useState<Record<number, OrderDetail[]>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [phone, setPhone] = useState<string>('');
  const [guestHistory, setGuestHistory] = useState<{ orderId: number; phone: string }[] | null>(
    null
  );

  const navigate = useNavigate();
  const { isLoggedIn, userInfo, isInitialized } = useSystemContext();

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

  useEffect(() => {
    if (phone) {
      setLoading(true);
      MainApiRequest.get<OrderSummary[]>(`/order/customer/${encodeURIComponent(phone)}`)
        .then((r) => {
          setOrders(r.data);
          setFilteredOrders(r.data);
        })
        .catch((err) => {
          console.error(err);
          message.error('Không tải được lịch sử đơn hàng');
        })
        .finally(() => setLoading(false));
    } else if (guestHistory) {
      if (!guestHistory.length) return setOrders([]);
      setLoading(true);
      Promise.all(
        guestHistory.map(async ({ orderId, phone }) => {
          try {
            const { data: order } = await MainApiRequest.get<any>(
              `/order/customer/${encodeURIComponent(phone)}/${orderId}`
            );
            return {
              id: order.id,
              serviceType: order.serviceType,
              orderDate: order.orderDate,
              status: order.status,
              branchId: order.branchId,
              branchName: order.branchName,
              productIDs: order.order_details?.map((d: any) => d.productId) || [],
              paymentMethod: order.paymentMethod,
              paymentStatus: order.paymentStatus,
            } as OrderSummary;
          } catch {
            return null;
          }
        })
      )
        .then((res) => {
          const validOrders = res.filter(Boolean) as OrderSummary[];
          setOrders(validOrders);
          setFilteredOrders(validOrders);
        })
        .finally(() => setLoading(false));
    }
  }, [phone, guestHistory]);

  // Filter orders based on search and status
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

  const fetchDetails = useCallback(
    async (orderId: number) => {
      if (details[orderId]) return;
      try {
        const res = await MainApiRequest.get<{
          order_details: {
            productId: number;
            size: string;
            mood?: string;
            quantity: number;
          }[];
        }>(`/order/customer/${encodeURIComponent(phone)}/${orderId}`);
        const rawDetails = res.data.order_details;

        const enriched = await Promise.all(
          rawDetails.map(async (d) => {
            const { data: p } = await MainApiRequest.get<ProductDetail>(`/product/${d.productId}`);
            const sz = p.sizes.find((s) => s.sizeName === d.size) || { sizeName: d.size, price: 0 };
            return {
              productId: p.id,
              name: p.name,
              image: p.image,
              size: sz.sizeName,
              mood: d.mood,
              quantity: d.quantity,
              price: sz.price,
            } as OrderDetail;
          })
        );
        setDetails((prev) => ({ ...prev, [orderId]: enriched }));
      } catch (err) {
        console.error(err);
        message.error('Không tải được chi tiết đơn');
      }
    },
    [details, phone]
  );

  useEffect(() => {
    if (!orders.length) return;
    orders.forEach((order) => fetchDetails(order.id));
  }, [orders, fetchDetails]);

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
        description="Quản lý và theo dõi tất cả đơn hàng của bạn tại SE347 Coffee Chain. Xem lịch sử mua hàng, trạng thái đơn hàng và đánh giá sản phẩm."
        keywords="lịch sử đơn hàng, order history, quản lý đơn hàng, theo dõi đơn hàng"
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
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Đang tải lịch sử đơn hàng...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>Không có đơn hàng nào</h3>
              <p>Bạn chưa có đơn hàng nào phù hợp với bộ lọc</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
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
                        <span className="order-payment">
                          {order.paymentMethod === 'vnpay' ? 'VNPay' : 'Tiền mặt (COD)'}
                        </span>
                        <span
                          className={`payment-status ${
                            order.paymentStatus === 'Đã thanh toán' ? 'paid' : 'unpaid'
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
                      {(details[order.id] || []).slice(0, 3).map((item) => (
                        <div key={item.productId} className="order-item-preview">
                          <img
                            src={item.image || '/placeholder.svg'}
                            alt={item.name}
                            className="item-image"
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
                      {(details[order.id] || []).length > 3 && (
                        <div className="more-items">
                          +{(details[order.id] || []).length - 3} sản phẩm khác
                        </div>
                      )}
                    </div>

                    <div className="order-summary">
                      <div className="order-total">
                        <span className="total-label">Tổng tiền:</span>
                        <span className="total-amount">
                          {(details[order.id] || [])
                            .reduce((sum, item) => sum + item.price * item.quantity, 0)
                            .toLocaleString('vi-VN')}
                          ₫
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
                        {(details[order.id] || []).map((item) => (
                          <div key={item.productId} className="detail-item">
                            <img
                              src={item.image || '/placeholder.svg'}
                              alt={item.name}
                              className="detail-image"
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
                                onClick={() => navigate(createFeedbackUrl(order.id))}
                              >
                                Đánh giá
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default HistoryOrder;
