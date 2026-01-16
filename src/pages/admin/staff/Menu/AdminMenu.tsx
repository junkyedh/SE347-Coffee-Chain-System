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

const categories = ['All', 'Cà phê', 'Trà trái cây', 'Trà sữa', 'Nước ép', 'Bánh ngọt'];

interface Coupon {
  id: number;
  code: string;
  status: string;
  promote: {
    id: number;
    name: string;
    description: string;
    discount: number;
    promoteType: string;
    startAt: string;
    endAt: string;
  };
}

const AdminMenu = () => {
  const [menuList, setMenuList] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search] = useState<string>('');
  const [, setLoading] = useState<boolean>(false);
  const [order, setOrder] = useState<{
    [key: string]: { size: string; mood: string; quantity: number; price: number };
  }>({});
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});
  const [selectedMoods, setSelectedMoods] = useState<{ [key: string]: string }>({});
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [orderInfo, setOrderInfo] = useState<any | null>(null);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [suggestions, setSuggestions] = useState<{ phone: string; name: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const location = useLocation();
  const { state } = location;
  const [currentOrderInfo, setCurrenOrderInfo] = useState<any>(state || null);

  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [totalPrice] = useState(0);

  const [memberDiscountValue, setMemberDiscountValue] = useState(0);
  const [couponDiscountVal, setCouponDiscountVal] = useState(0);

  const fetchMenuList = async () => {
    try {
      setLoading(true);
      const res = await AdminApiRequest.get('/product-branch/list');
      setMenuList(res.data);
    } catch (error) {
      message.error('Lấy danh sách sản phẩm thất bại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuList();
  }, []);

  useEffect(() => {
    const fetchNewOrder = async () => {
      try {
        const response = await AdminApiRequest.get('/branch-order/new');
        const order = response.data;
        setOrderInfo(order);
      } catch (error) {
        console.error('Không lấy được đơn hàng mới:', error);
      }
    };
    fetchNewOrder();
  }, []);

  useEffect(() => {
    const initOrder = async () => {
      if (!state) return;

      if (state.isNewOrder) {
        setCurrenOrderInfo({
          id: null,
          serviceType: state.serviceType,
          tableID: state.tableId,
          tableName: state.tableName,
          phoneCustomer: state.phoneCustomer,
          customerName: state.customerName,
          status: 'Nháp',
          tableSeats: state.tableSeats,
        });
        // Reset giỏ hàng/Order list về rỗng
        setOrder({});
        if (state.phoneCustomer) {
          setPhone(state.phoneCustomer);
        }
      } else if (state.orderId) {
        try {
          const res = await AdminApiRequest.get(`/branch-order/${state.orderId}`);
          const data = res.data;
          data.tableSeats = state.tableSeats || data.tableSeats || 0;
          
          setCurrenOrderInfo(res.data);
        } catch (err) {
          console.error(err);
        }
      }
    };
    initOrder();
  }, [state]);

  useEffect(() => {
    let finalDiscount = 0;

    // QUY TẮC: Ưu tiên mã giảm giá.
    // Nếu có mã giảm giá (couponDiscountVal > 0) -> Dùng Coupon, bỏ qua Membership.
    if (couponDiscountVal > 0) {
      finalDiscount = couponDiscountVal;
    } else {
      // Nếu không dùng mã giảm giá -> Mới xét đến Membership
      finalDiscount = memberDiscountValue;
    }

    // Đảm bảo tiền giảm không vượt quá tổng tiền đơn hàng
    setDiscountAmount(Math.min(finalDiscount, totalPrice));
  }, [totalPrice, memberDiscountValue, couponDiscountVal]);

  const filteredProducts = menuList
    .filter((product) => selectedCategory === 'All' || product.category === selectedCategory)
    .filter((product) => product.name.toLowerCase().includes(search.toLowerCase()));

  const fetchCustomerSuggestions = async (value: string) => {
    if (value.length > 0) {
      try {
        const response = await AdminApiRequest.get(`/customer/search?phone=${value}`);
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching customer suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSize = (id: string, size: string) => {
    if (currentProductId !== id) {
      setSelectedSizes({});
      setSelectedMoods({});
    }
    setCurrentProductId(id);
    setSelectedSizes((prev) => ({ ...prev, [id]: size }));
  };

  const handleSelectMood = (id: string, mood: string) => {
    if (currentProductId !== id) {
      setSelectedSizes({});
      setSelectedMoods({});
    }
    setCurrentProductId(id);
    setSelectedMoods((prev) => ({ ...prev, [id]: mood }));
  };

  const handleAddToOrder = (id: number, size: string) => {
    const product = menuList.find((p) => p.id === id);
    if (product && size) {
      const mood = product.hot || product.cold ? selectedMoods[id] : '';
      let price = 0;

      if (product.category === 'Bánh ngọt') {
        if (size === 'piece') {
          price = product.sizes[0]?.price || 0;
        } else if (size === 'whole') {
          price = (product.sizes[0]?.price || 0) * 8;
        }
      } else {
        const sizeData = product.sizes.find(
          (s: { sizeName: string }) => s.sizeName === selectedSizes[product.id]
        );
        price = sizeData?.price || 0;
      }

      const key = `${id}-${size}-${mood}`;
      setOrder((prevOrder) => ({
        ...prevOrder,
        [key]: {
          size,
          mood,
          quantity: (prevOrder[key]?.quantity || 0) + 1,
          price,
        },
      }));

      setSelectedSizes({});
      setSelectedMoods({});
      setCurrentProductId(null);
    }
  };

  const handleRemoveItem = (productKey: string) => {
    setOrder((prevOrder) => {
      const newOrder = { ...prevOrder };
      delete newOrder[productKey];
      return newOrder;
    });
  };

  const checkMemberRank = async (phone: string) => {
    if (!phone) {
      setMemberDiscountValue(0);
      return;
    }
    try {
      const customerRes = await AdminApiRequest.get(`/customer/${phone}`);
      const customer = customerRes.data;

      if (customer?.rank) {
        const membershipRes = await AdminApiRequest.get(`/membership/${customer.rank}`);
        const discountValue = membershipRes.data.discount || 0;

        setMemberDiscountValue(discountValue);

        // Kiểm tra ưu tiên áp dụng mã giảm giá nếu có
        if (couponDiscountVal > 0) {
          message.info(
            `Khách hàng hạng ${customer.rank}, không áp dụng chiết khấu thành viên do đã sử dụng mã giảm giá.`
          );
        } else {
          message.success(
            `Khách hàng hạng ${customer.rank}, được giảm ${discountValue.toLocaleString()}đ`
          );
        }
      } else {
        setMemberDiscountValue(0);
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra hạng thành viên:', error);
      setMemberDiscountValue(0);
    }
  };

  const handleApplyCoupon = async () => {
    try {
      if (!couponCode) {
        setCouponDiscountVal(0);
        return;
      }

      const response = await AdminApiRequest.get('/promote/coupon/list');
      const coupon = response.data.find(
        (c: Coupon) => c.code === couponCode && c.status === 'Có hiệu lực'
      );

      if (coupon) {
        let val = 0;
        const discount = coupon.promote.discount;

        if (coupon.promote.promoteType === 'Phần trăm') {
          val = (totalPrice * discount) / 100;
        } else if (coupon.promote.promoteType === 'Cố định') {
          val = discount;
        }

        setCouponDiscountVal(val);

        // Thông báo áp dụng mã thành công
        if (memberDiscountValue > 0) {
          message.success('Áp dụng mã thành công!');
        } else {
          message.success('Áp dụng mã giảm giá thành công!');
        }
      } else {
        setCouponDiscountVal(0);
        message.error('Mã giảm giá không hợp lệ hoặc đã hết hạn!');
      }
    } catch (error) {
      console.error('Lỗi khi áp dụng mã giảm giá:', error);
      message.error('Có lỗi xảy ra khi áp dụng mã giảm giá!');
      setCouponDiscountVal(0);
    }
  };

  const handlePayment = async () => {
    try {
      let finalTotal = totalPrice - discountAmount;
      let orderId = currentOrderInfo?.id;

      if (finalTotal < 0) finalTotal = 0;

      if (Object.keys(order).length === 0 || totalPrice === 0) {
        message.warning('Đơn hàng không có sản phẩm hoặc tổng tiền không hợp lệ.');
        return;
      }

      if (!orderId) {
        const payload = {
          phoneCustomer: phone || null,
          serviceType: orderInfo?.serviceType || 'DINE IN',
          totalPrice: finalTotal,
          tableID: orderInfo?.tableID || null,
          orderDate: new Date().toISOString(),
          status: 'Chờ xác nhận',
          staffName: orderInfo?.staffName || null,
        };

        const res = await AdminApiRequest.post('/branch-order', payload);
        orderId = res.data.id;
        
        if (currentOrderInfo?.tableID) {
          await AdminApiRequest.put(`/table/${currentOrderInfo.tableID}`, { status: 'Occupied' });
        }
      } else {}

      const orderItems = Object.keys(order).map((productKey) => {
        const item = order[productKey];
        const [id] = productKey.split('-');
        const product = menuList.find((p) => String(p.id) === id);
        return {
          productName: product?.name || '',
          size: item.size,
          mood: item.mood,
          quantity: item.quantity,
          price: item.price,
        };
      });

      for (const item of orderItems) {
        await AdminApiRequest.post(`/branch-order/detail/${orderId}`, item);
      }

      // Gọi hàm in hóa đơn
      printInvoice({
        orderId,
        serviceType: orderInfo?.serviceType || 'DINE IN',
        staffName: orderInfo?.staffName || 'Nhân viên',
        totalPrice: totalPrice,
        discountAmount: discountAmount,
        finalTotal: finalTotal,
        items: orderItems,
      });

      message.success(currentOrderInfo?.id ? 'Cập nhật đơn hàng thành công!' : 'Tạo đơn hàng thành công!');
      // Reset toàn bộ state
      setOrder({});
      setCouponCode('');
      setDiscountAmount(0);
      setMemberDiscountValue(0);
      setCouponDiscountVal(0);
      setName('');
      setPhone('');

      navigate(ROUTES.STAFF.ORDER_LIST);
    } catch (error) {
      console.error('Error during payment:', error);
      message.error('Có lỗi xảy ra khi thanh toán!');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSubmit = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        registrationDate: values.registrationDate ? values.registrationDate.toISOString() : null,
      };

      await AdminApiRequest.post('/customer', formattedValues);
      message.success('Thêm khách hàng thành công!');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error adding customer:', error);
      message.error('Thêm khách hàng thất bại!');
    }
  };

  const updateQuantity = (productKey: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productKey);
    } else {
      setOrder((prevOrder) => ({
        ...prevOrder,
        [productKey]: {
          ...prevOrder[productKey],
          quantity: newQuantity,
        },
      }));
    }
  };

  const handleSelect = (value: string, option: any) => {
    setPhone(value);
    const selected = suggestions.find((s) => s.phone === value);
    setName(selected ? selected.name : '');
    checkMemberRank(value);
  };

  return (
    <div className="admin-menu-container">
      <div className="admin-menu-layout">
        {/* Main Content */}
        <div className="admin-menu-main">
          {/* Header */}
          <div className="menu-header">
            <h2 className="menu-title">GỌI MÓN</h2>

            {/* Categories and Search */}
            <div className="menu-controls">
              <div className="category-section">
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="products-section">
            <div className="products-grid">
              {currentProducts.map((product) => (
                <AdminProductCard
                  key={product.id}
                  product={product}
                  selectedSize={selectedSizes[product.id]}
                  selectedMood={selectedMoods[product.id]}
                  onSelectSize={(size) => handleSelectSize(product.id, size)}
                  onSelectMood={(mood) => handleSelectMood(product.id, mood)}
                  onAddToOrder={(size) => handleAddToOrder(product.id, size)}
                  isCurrentProduct={currentProductId === product.id}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination-wrapper">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredProducts.length}
                onChange={handlePageChange}
                showSizeChanger={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`}
              />
            </div>
          </div>
        </div>

        {/* Invoice Sidebar */}
        <div className="invoice-sidebar">
          <div className="invoice-header">
            <div className="invoice-title">
              <ShoppingCartOutlined />
              <span>HÓA ĐƠN</span>
            </div>
            <div className="invoice-info">
              <div className="info-item">
                <span className="label">Mã HĐ:</span>
                <span className="value">{orderInfo?.id || '88'}</span>
              </div>
              <div className="info-item">
                <span className="label">Loại:</span>
                <span className="value">
                  { currentOrderInfo?.tableName || (currentOrderInfo?.serviceType === 'Take Away')
                    ? 'Mang đi'
                    : `Bàn ${currentOrderInfo?.tableID || '2'}` }
                </span>
              </div>
              {currentOrderInfo?.serviceType === 'Dine In' && currentOrderInfo?.tableSeats >0 && (
                <div className="info-item">
                  <span className="label">Số chỗ:</span>
                  <span className="value">{currentOrderInfo.tableSeats}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="customer-section">
            <div className="section-header">
              <span>Thông tin khách hàng</span>
              <Button
                size="small"
                icon={<UserAddOutlined />}
                onClick={() => setIsModalVisible(true)}
              />
            </div>

            <div className="customer-inputs">
              <AutoComplete
                value={phone}
                onChange={(value) => {
                  setPhone(value);
                  fetchCustomerSuggestions(value);

                  if (!value) {
                    setName('');
                    setMemberDiscountValue(0);
                  }
                }}
                onSelect={handleSelect}
                options={suggestions.map((suggestion) => ({
                  value: suggestion.phone,
                  label: `${suggestion.phone} - ${suggestion.name}`,
                }))}
                placeholder="Số điện thoại khách hàng"
                className="customer-input"
              />
              <Input
                placeholder="Tên khách hàng"
                value={name}
                className="customer-input"
                readOnly
              />
            </div>
          </div>

          {/* Order Items */}
          <div className="order-items">
            <h4>Món đã chọn</h4>
            <div className="order-list">
              {Object.keys(order).length === 0 ? (
                <div className="empty-order">
                  <span>Chưa có món nào được chọn</span>
                </div>
              ) : (
                Object.keys(order).map((productKey) => {
                  const orderItem = order[productKey];
                  const { size, mood, quantity, price } = orderItem;
                  const [id] = productKey.split('-');
                  const product = menuList.find((p) => String(p.id) === id);
                  return (
                    product && (
                      <div key={productKey} className="order-item">
                        <div className="item-info">
                          <div className="item-name">{product.name}</div>
                          <div className="item-details">
                            Size: {size} {mood && `, ${mood}`}
                          </div>
                          <div className="item-price">{price.toLocaleString()}₫</div>
                        </div>
                        <div className="item-controls">
                          <div className="quantity-controls">
                            <Button
                              size="small"
                              onClick={() => updateQuantity(productKey, quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="quantity">{quantity}</span>
                            <Button
                              size="small"
                              onClick={() => updateQuantity(productKey, quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveItem(productKey)}
                          />
                        </div>
                      </div>
                    )
                  );
                })
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <div className="discount-section">
              <Input
                placeholder="Nhập mã giảm giá"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="coupon-input"
              />
              <Button onClick={handleApplyCoupon} size="small">
                Áp dụng
              </Button>
            </div>

            <div className="summary-details">
              <div className="summary-item">
                <span>Tổng số món:</span>
                <span>
                  {Object.values(order).reduce((total, item) => total + item.quantity, 0)}
                </span>
              </div>
              <div className="summary-item">
                <span>Tổng tiền:</span>
                <span>{totalPrice.toLocaleString()}₫</span>
              </div>
              <div className="summary-item discount">
                <span>Chiết khấu:</span>
                <span>-{discountAmount.toLocaleString()}₫</span>
              </div>
              <div className="summary-item total">
                <span>Tổng hóa đơn:</span>
                <span>{Math.max(0, totalPrice - discountAmount).toLocaleString()}₫</span>
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              onClick={handlePayment}
              disabled={Object.keys(order).length === 0}
              className="payment-btn"
              block
            >
              Thanh toán
            </Button>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      <Modal
        title="Thêm khách hàng mới"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="form-grid">
            <FloatingLabelInput
              label="Tên khách hàng"
              name="name"
              component="input"
              rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
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
