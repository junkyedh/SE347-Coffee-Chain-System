import FloatingLabelInput from '@/components/common/FloatingInput/FloatingLabelInput';
import { AdminApiRequest } from '@/services/AdminApiRequest';
import { ROUTES } from '@/constants';
import { DeleteOutlined, ShoppingCartOutlined, UserAddOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Form, Input, message, Modal, Pagination } from 'antd';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminProductCard from '../AdminCard/AdminProductCard';
import './AdminMenu.scss';
import { printInvoice } from '@/utils/invoicePrinter';
import { getProductDisplayInfo } from '@/utils/productSize';
import { calculateOrderTotal, Coupon } from '@/utils/priceCalculator';

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
  
  const [selectedSizes, setSelectedSizes] = useState<{ [key: number]: string }>({});
  const [selectedMoods, setSelectedMoods] = useState<{ [key: number]: string }>({});
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);

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
      console.error('Error fetching menu list:', error);
      message.error('Failed to fetch menu list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuList();
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
      const mood = product.hot || product.cold ? selectedMoods[id] : '';
      
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

      // Reset selection
      setSelectedSizes((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setSelectedMoods((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setCurrentProductId(null);
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
        if (newQuantity > 0) {
          newOrder[key] = { ...item, quantity: newQuantity };
        } else {
          delete newOrder[key];
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
      const response = await AdminApiRequest.get('/promote/coupon/list');
      // Tìm coupon khớp mã và đang có hiệu lực
      const coupon = response.data.find(
        (c: Coupon) => 
          c.code.toLowerCase() === couponCode.toLowerCase() && 
          (c as any).status === 'Có hiệu lực' 
      );

      if (coupon) {
        setAppliedCoupon(coupon);
        if(customerRank) {
            message.success('Áp dụng mã thành công!');
            message.info(`Ưu đãi hạng ${customerRank} sẽ không được áp dụng cùng voucher.`);
        } else {
            message.success('Áp dụng mã giảm giá thành công!');
        }
      } else {
        setAppliedCoupon(null);
        message.error('Mã giảm giá không hợp lệ hoặc đã hết hạn!');
      }
    } catch (error) {
      console.error(error);
      setAppliedCoupon(null);
      message.error('Lỗi khi kiểm tra mã giảm giá!');
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
        branchId: 1, 
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
              selectedSize={selectedSizes[product.id]}
              selectedMood={selectedMoods[product.id]}
              onSelectSize={(size) =>
                setSelectedSizes((prev) => ({ ...prev, [product.id]: size }))
              }
              onSelectMood={(mood) =>
                setSelectedMoods((prev) => ({ ...prev, [product.id]: mood }))
              }
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
            <span>Mã HĐ: {Math.floor(Math.random() * 1000)}</span>
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
              const product = menuList.find((p) => p.id === parseInt(id));
              return (
                <div key={key} className="order-item">
                  <div className="item-main">
                    <div className="item-name">{product?.name}</div>
                    <div className="item-details">
                      Size: {item.size}
                      {item.mood && ` | ${item.mood === 'hot' ? 'Nóng' : 'Lạnh'}`}
                    </div>
                    <div className="item-price">
                      {(item.price * item.quantity).toLocaleString()}₫
                    </div>
                  </div>
                  <div className="item-actions">
                    <Button
                      size="small"
                      onClick={() => handleUpdateQuantity(key, -1)}
                    >
                      -
                    </Button>
                    <span className="quantity">{item.quantity}</span>
                    <Button
                      size="small"
                      onClick={() => handleUpdateQuantity(key, 1)}
                    >
                      +
                    </Button>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveItem(key)}
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