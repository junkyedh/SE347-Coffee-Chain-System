import FloatingLabelInput from '@/components/common/FloatingInput/FloatingLabelInput';
import { AdminApiRequest } from '@/services/AdminApiRequest';
import { ROUTES } from '@/constants';
import { DeleteOutlined, ShoppingCartOutlined, UserAddOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Form, Input, message, Modal, Pagination } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminProductCard from '../AdminCard/AdminProductCard';
import './AdminMenu.scss';
import { printInvoice } from '@/utils/invoicePrinter';
import { getProductDisplayInfo } from '@/utils/productSize';
import { calculateOrderTotal, Coupon } from '@/utils/priceCalculator';
import { useSystemContext } from '@/hooks/useSystemContext';

const categories = ['All', 'Cà phê', 'Trà trái cây', 'Trà sữa', 'Nước ép', 'Bánh ngọt'];

const AdminMenu = () => {
  const [menuList, setMenuList] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search] = useState<string>('');
  const [, setLoading] = useState<boolean>(false);
  
  // State đơn hàng
  const [order, setOrder] = useState<{
    [key: string]: { size: string; mood: string; quantity: number; price: number };
  }>({});
  
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});
  const [selectedMoods, setSelectedMoods] = useState<{ [key: string]: string }>({});
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);

  // Debug log khi state thay đổi
  useEffect(() => {
    console.log('🔵 selectedSizes changed:', selectedSizes);
  }, [selectedSizes]);

  useEffect(() => {
    console.log('🟠 selectedMoods changed:', selectedMoods);
  }, [selectedMoods]);

  // Tạo mã HĐ chỉ 1 lần khi component mount
  const [orderId] = useState(() => Math.floor(Math.random() * 10000));

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [, setIsCustomerLoading] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null); // Lưu object Coupon
  const [customerRank, setCustomerRank] = useState<string>(''); // Lưu tên hạng (Vàng, Bạc...)

  const location = useLocation();
  const navigate = useNavigate();
  const { tableId, tableName, serviceType: initialServiceType } = location.state || {};
  const { branchId } = useSystemContext();
  const currentBranchId = Number(branchId) || 1;

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const subtotal = Object.values(order).reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const { 
    finalTotal, 
    totalDiscount, 
    couponDiscount, 
    membershipDiscount, 
    isMembershipSkipped 
  } = calculateOrderTotal({
    subtotal: subtotal,
    deliveryFee: 0, 
    coupon: appliedCoupon,
    membershipRank: customerRank
  });

  const fetchMenuList = async () => {
    try {
      setLoading(true);
      const res = await AdminApiRequest.get('/product/list');
      setMenuList(res.data.data || res.data);
    } catch (error) {
      if (axios.isCancel(error)) return; // Ignore canceled requests
      console.error('Error fetching menu list:', error);
      message.error('Failed to fetch menu list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkMemberRank = async (phoneNumber: string) => {
    if (!phoneNumber) {
      setCustomerRank('');
      return;
    }
    try {
      const customerRes = await AdminApiRequest.get(`/customer/${phoneNumber}`);
      const customer = customerRes.data;
      if (customer) {
        setName(customer.name);
        if (customer.rank) {
          setCustomerRank(customer.rank);
          message.success(`Khách hàng: ${customer.name} - Hạng: ${customer.rank}`);
        } else {
          setCustomerRank('');
        }
      } else {
        setName('');
        setCustomerRank('');
      }
    } catch (error) {
      setName('');
      setCustomerRank('');
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddToOrder = (id: number, size: string) => {
    const product = menuList.find((p) => p.id === id);
    if (product && size) {
      const mood = product.hot || product.cold ? selectedMoods[id.toString()] : '';
      
      const { price, isValid } = getProductDisplayInfo(product, size);

      if (!isValid) {
        message.error('Kích thước hoặc sản phẩm không hợp lệ');
        return;
      }

      const key = `${id}-${size}-${mood}`;
      setOrder((prevOrder) => ({
        ...prevOrder,
        [key]: {
          size,
          mood,
          quantity: (prevOrder[key]?.quantity || 0) + 1,
          price, // Giá này đã được nhân nếu là cả bánh
        },
      }));

      // Giữ lại selection để dễ thêm tiếp món tương tự
      message.success(`Đã thêm ${product.name} vào giỏ hàng`);
    }
  };

  const handleRemoveItem = (key: string) => {
    setOrder((prevOrder) => {
      const newOrder = { ...prevOrder };
      delete newOrder[key];
      return newOrder;
    });
  };

  const handleUpdateQuantity = (key: string, delta: number) => {
    setOrder((prevOrder) => {
      const newOrder = { ...prevOrder };
      const item = newOrder[key];
      if (item) {
        const newQuantity = item.quantity + delta;
        // Không cho giảm xuống dưới 1
        if (delta < 0 && item.quantity === 1) {
          message.warning('Số lượng tối thiểu là 1. Dùng nút xóa để bỏ món.');
          return prevOrder;
        }
        if (newQuantity > 0) {
          newOrder[key] = { ...item, quantity: newQuantity };
        }
      }
      return newOrder;
    });
  };

  const handleApplyCoupon = async () => {
    try {
      if (!couponCode.trim()) {
        setAppliedCoupon(null);
        return;
      }

      const code = couponCode.trim().toUpperCase();
      const response = await AdminApiRequest.get<Coupon[] | Coupon>(
        `/promote/coupon/check?code=${encodeURIComponent(code)}&branchId=${currentBranchId}`
      );

      const couponData = Array.isArray(response.data) ? response.data[0] : response.data;

      if (!couponData) {
        setAppliedCoupon(null);
        message.error('Mã giảm giá không tồn tại.');
        return;
      }
      
      // Kiểm tra status
      if (couponData.status?.toLowerCase() === 'hết hạn') {
        setAppliedCoupon(null);
        message.error('Chương trình khuyến mãi đã kết thúc.');
        return;
      }
      
      if (couponData.status?.toLowerCase() !== 'có hiệu lực') {
        setAppliedCoupon(null);
        message.error(`Mã giảm giá không khả dụng (${couponData.status}).`);
        return;
      }

      // Nếu có customer rank, hiển modal xác nhận
      if (customerRank) {
        Modal.confirm({
          title: 'Xác nhận áp dụng mã giảm giá',
          content: (
            <div>
              <p style={{ marginBottom: '12px' }}>
                Khách hàng hiện có ưu đãi hạng <strong>{customerRank}</strong>.
              </p>
              <p style={{ color: '#f59e0b', marginBottom: '12px' }}>
                ⚠️ Khi áp dụng mã <strong>{couponData.code}</strong>, 
                ưu đãi hạng sẽ <strong>không được áp dụng đồng thời</strong>.
              </p>
              <p>Bạn có chắc chắn muốn sử dụng mã giảm giá này không?</p>
            </div>
          ),
          okText: 'Xác nhận',
          cancelText: 'Hủy',
          onOk: () => {
            setAppliedCoupon(couponData);
            message.success(`Áp dụng mã giảm giá "${couponData.code}" thành công!`);
          },
        });
      } else {
        setAppliedCoupon(couponData);
        message.success(`Áp dụng mã giảm giá "${couponData.code}" thành công!`);
      }
    } catch (error: any) {
      setAppliedCoupon(null);
      const status = error?.response?.status;
      const rawMsg = error?.response?.data?.message;
      
      let errorMessage = 'Lỗi khi kiểm tra mã giảm giá!';
      
      if (status === 404) {
        errorMessage = 'Mã giảm giá không tồn tại hoặc không áp dụng cho chi nhánh này.';
      } else if (status === 400 && rawMsg) {
        // Xử lý message từ backend (có thể là array hoặc string)
        errorMessage = Array.isArray(rawMsg) ? rawMsg.join(', ') : rawMsg;
      } else if (rawMsg) {
        errorMessage = Array.isArray(rawMsg) ? rawMsg.join(', ') : rawMsg;
      }
      
      message.error(errorMessage);
    }
  };

  const handlePhoneSearch = async (value: string) => {
    setPhone(value);
    if (value.length >= 10) {
      setIsCustomerLoading(true);
      try {
        await checkMemberRank(value);
      } finally {
        setIsCustomerLoading(false);
      }
    } else {
      setName('');
      setCustomerRank('');
    }
  };

  const onFinish = async (values: any) => {
    try {
      await AdminApiRequest.post('/customer', values);
      message.success('Thêm khách hàng thành công!');
      setIsModalVisible(false);
      form.resetFields();
      setPhone(values.phone);
      handlePhoneSearch(values.phone);
    } catch (error) {
      message.error('Có lỗi xảy ra khi thêm khách hàng!');
    }
  };

  const handlePayment = async () => {
    if (Object.keys(order).length === 0) {
      message.warning('Vui lòng chọn món trước khi thanh toán!');
      return;
    }

    try {
      const orderPayload = {
        phoneCustomer: phone || '0000000000',
        serviceType: initialServiceType === 'Dine In' ? 'DINE IN' : 'TAKE AWAY',
        totalPrice: finalTotal,
        orderDate: new Date().toISOString(),
        status: 'Hoàn thành',
        tableID: tableId || null,
        branchId: currentBranchId, 
        paymentMethod: 'Tiền mặt',
        paymentStatus: 'Đã thanh toán',
        discount: totalDiscount
      };

      const res = await AdminApiRequest.post('/order', orderPayload);
      const orderId = res.data.id;

      // Tạo chi tiết đơn hàng
      const orderDetailsPromises = Object.entries(order).map(([key, item]) => {
        const [productId] = key.split('-');
        return AdminApiRequest.post(`/order/detail/${orderId}`, {
          productID: parseInt(productId),
          quantity: item.quantity,
          size: item.size,
          mood: item.mood || null,
          price: item.price // Gửi giá tại thời điểm mua
        });
      });

      await Promise.all(orderDetailsPromises);

      // Cập nhật trạng thái bàn nếu là Dine In
      if (tableId && initialServiceType === 'Dine In') {
        try {
          await AdminApiRequest.put(`/table/${tableId}`, { 
            status: 'Available' 
          });
        } catch (tableError) {
          console.error('Error updating table status:', tableError);
          // Không cần message.error ở đây vì đơn hàng đã thanh toán thành công
        }
      }

      message.success('Thanh toán thành công!');
      
      // In hóa đơn
      printInvoice({
        orderId: orderId,
        serviceType: initialServiceType === 'Dine In' ? 'Tại chỗ' : 'Mang đi',
        staffName: 'Staff',
        totalPrice: subtotal,
        discountAmount: totalDiscount,
        finalTotal: finalTotal,
        items: Object.entries(order).map(([key, item]) => {
            const product = menuList.find(p => p.id.toString() === key.split('-')[0]);
            return {
                productName: product?.name || 'Sản phẩm',
                quantity: item.quantity,
                price: item.price,
                size: item.size,
                mood: item.mood
            };
        }),
      });

      // Reset trạng thái sau khi thanh toán thành công
      setOrder({});
      setPhone('');
      setName('');
      setCustomerRank('');
      setCouponCode('');
      setAppliedCoupon(null);
      navigate(ROUTES.STAFF.ORDER_SELECT_TABLE);
      
    } catch (error) {
      console.error('Payment error:', error);
      message.error('Thanh toán thất bại. Vui lòng thử lại!');
    }
  };

  const filteredMenu = menuList.filter(
    (item) =>
      (selectedCategory === 'All' || item.category === selectedCategory) &&
      item.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedMenu = filteredMenu.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="admin-menu-container">
      {/* Cột Trái: Danh sách món */}
      <div className="menu-section">
        <div className="menu-header">
          <h2 className="title">GỌI MÓN</h2>
          <div className="categories">
            {categories.map((cat) => (
              <Button
                key={cat}
                type={selectedCategory === cat ? 'primary' : 'default'}
                className="category-btn"
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="product-grid">
          {paginatedMenu.map((product) => (
            <AdminProductCard
              key={product.id}
              product={product}
              selectedSize={selectedSizes[product.id.toString()]}
              selectedMood={selectedMoods[product.id.toString()]}
              onSelectSize={(size) => {
                console.log('onSelectSize called:', { productId: product.id.toString(), size });
                setSelectedSizes((prev) => {
                  const updated = { ...prev, [product.id.toString()]: size };
                  console.log('Updated selectedSizes:', updated);
                  return updated;
                });
              }}
              onSelectMood={(mood) => {
                console.log('onSelectMood called:', { productId: product.id.toString(), mood });
                setSelectedMoods((prev) => {
                  const updated = { ...prev, [product.id.toString()]: mood };
                  console.log('Updated selectedMoods:', updated);
                  return updated;
                });
              }}
              onAddToOrder={(size) => handleAddToOrder(product.id, size)}
              isCurrentProduct={currentProductId === product.id}
              cartQuantity={Object.entries(order)
                .filter(([key]) => key.startsWith(`${product.id}-`))
                .reduce((sum, [, item]) => sum + item.quantity, 0)}
            />
          ))}
        </div>

        <div className="pagination-container">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredMenu.length}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      </div>

      {/* Cột Phải: Hóa đơn & Thanh toán */}
      <div className="order-sidebar">
        <div className="sidebar-header">
          <ShoppingCartOutlined className="icon" />
          <h3>HÓA ĐƠN</h3>
        </div>

        <div className="order-info">
          <div className="info-row">
            <span>Mã HĐ: {orderId}</span>
            <span>Loại: {tableName || 'Mang đi'}</span>
          </div>

          <div className="customer-search">
            <div className="search-box">
              <AutoComplete
                value={phone}
                onChange={handlePhoneSearch}
                placeholder="Số điện thoại khách hàng"
                style={{ width: '100%' }}
              />
              <Button
                icon={<UserAddOutlined />}
                onClick={() => setIsModalVisible(true)}
              />
            </div>
            <Input
              value={name}
              placeholder="Tên khách hàng"
              readOnly
              className="customer-name-input"
            />
            {/* Hiển thị hạng thành viên nếu có */}
            {customerRank && (
              <div className="membership-badge">
                Thành viên hạng: <strong>{customerRank}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Danh sách món đã chọn */}
        <div className="order-items-list">
          <div className="list-header">
            <span>Món đã chọn</span>
          </div>
          <div className="items-scroll">
            {Object.entries(order).map(([key, item]) => {
              const [id] = key.split('-');
              const product = menuList.find((p) => p.id.toString() === id);
              
              if (!product) {
                console.warn('Product not found for id:', id);
                return null;
              }

              return (
                <div key={key} className="order-item">
                  <div className="item-image">
                    <img 
                      src={product.image || '/placeholder.svg'} 
                      alt={product.name || 'Sản phẩm'}
                    />
                  </div>
                  <div className="item-main">
                    <div className="item-name">{product.name || 'Chưa có tên'}</div>
                    <div className="item-details">
                      <span className="detail-badge">Size: {item.size}</span>
                      {item.mood && (
                        <span className="detail-badge mood">
                          {item.mood === 'hot' ? '🔥 Nóng' : '🧊 Lạnh'}
                        </span>
                      )}
                    </div>
                    <div className="item-price">
                      {(item.price * item.quantity).toLocaleString()}₫
                    </div>
                  </div>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <Button
                        size="small"
                        onClick={() => handleUpdateQuantity(key, -1)}
                        className="qty-btn"
                      >
                        -
                      </Button>
                      <span className="quantity">{item.quantity}</span>
                      <Button
                        size="small"
                        onClick={() => handleUpdateQuantity(key, 1)}
                        className="qty-btn"
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveItem(key)}
                      className="delete-btn"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phần nhập mã giảm giá */}
        <div className="discount-section">
          <div className="coupon-input-group">
            <Input
              placeholder="Nhập mã giảm giá"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={!!appliedCoupon} // Disable nếu đã áp dụng
            />
            {appliedCoupon ? (
              <Button danger onClick={() => {
                setAppliedCoupon(null);
                setCouponCode('');
                message.info('Đã hủy mã giảm giá');
              }}>
                Hủy
              </Button>
            ) : (
              <Button type="primary" onClick={handleApplyCoupon}>
                Áp dụng
              </Button>
            )}
          </div>
        </div>

        <div className="summary-details">
          <div className="summary-item">
            <span>Tổng số món:</span>
            <span>{Object.values(order).reduce((acc, i) => acc + i.quantity, 0)}</span>
          </div>
          <div className="summary-item">
            <span>Tổng tiền hàng:</span>
            <span>{subtotal.toLocaleString()}₫</span>
          </div>
          
          {couponDiscount > 0 && (
            <div className="summary-item discount-text">
              <span>Voucher ({appliedCoupon?.code}):</span>
              <span>-{couponDiscount.toLocaleString()}₫</span>
            </div>
          )}

          {(membershipDiscount > 0 || (isMembershipSkipped && customerRank)) && (
            <div className="summary-item discount-text" style={{ opacity: isMembershipSkipped ? 0.5 : 1 }}>
              <span style={{ textDecoration: isMembershipSkipped ? 'line-through' : 'none' }}>
                Thành viên ({customerRank}):
              </span>
              <span style={{ textDecoration: isMembershipSkipped ? 'line-through' : 'none' }}>
                -{isMembershipSkipped ? '0' : membershipDiscount.toLocaleString()}₫
              </span>
            </div>
          )}
          
          {isMembershipSkipped && (
            <div style={{ fontSize: '11px', color: '#faad14', textAlign: 'right', marginTop: '-4px' }}>
              (Ưu tiên áp dụng Voucher)
            </div>
          )}

          <div className="summary-item total">
            <span>Tổng hóa đơn:</span>
            <span>{finalTotal.toLocaleString()}₫</span>
          </div>
        </div>

        <Button
          type="primary"
          className="payment-btn"
          size="large"
          onClick={handlePayment}
        >
          Thanh toán
        </Button>
      </div>

      {/* Modal Thêm khách hàng mới */}
      <Modal
        title="Thêm khách hàng mới"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        className="add-customer-modal"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="form-grid">
            <FloatingLabelInput
              label="Họ và tên"
              name="name"
              component="input"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
            />
            <FloatingLabelInput
              label="Số điện thoại"
              name="phone"
              component="input"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                { pattern: /^[0-9]+$/, message: 'Số điện thoại không hợp lệ!' },
              ]}
            />
          </div>

          <div className="form-grid">
            <FloatingLabelInput
              label="Giới tính"
              name="gender"
              component="select"
              options={[
                { value: 'Nam', label: 'Nam' },
                { value: 'Nữ', label: 'Nữ' },
                { value: 'Khác', label: 'Khác' },
              ]}
              initialValue="Nam"
            />
            <FloatingLabelInput
              label="Ngày đăng ký"
              name="registrationDate"
              component="date"
              rules={[{ required: true, message: 'Vui lòng chọn ngày đăng ký!' }]}
            />
          </div>

          <div className="modal-footer">
            <Button
              onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<UserAddOutlined />}
              className="add-customer-btn"
            >
              Thêm khách hàng
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminMenu;