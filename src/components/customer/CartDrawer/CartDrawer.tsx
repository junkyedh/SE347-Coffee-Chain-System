import emptyCart from '@/assets/empty-cart.png';
import { useCart, type CartItem } from '@/hooks/cartContext';
import React, { useState } from 'react';
import { Col, Form, Image, Offcanvas, Row } from 'react-bootstrap';
import {
  BiArrowToRight,
  BiChevronDown,
  BiMinus,
  BiPlus,
  BiShoppingBag,
  BiTrash,
  BiTrashAlt,
  BiX,
} from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import './CartDrawer.scss';
import { Button } from '@/components/common/Button/Button';
import { Badge } from '@/components/common/Badge/Badge';

const CartDrawer: React.FC = () => {
  const { cart, totalItems, totalPrice, updateItem, removeItem, clearCart } = useCart();
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const open = () => setShow(true);
  const close = () => setShow(false);

  const handleCheckout = () => {
    close();
    navigate('/checkout', {
      state: {
        initialItems: cart.map((i) => ({
          productId: i.productId,
          size: i.size,
          mood: i.mood,
          quantity: i.quantity,
        })),
      },
    });
  };

  const isCake = (item: CartItem) => item.category === 'Bánh ngọt';
  const isDrink = (item: CartItem) => ['Cà phê'].includes(item.category);

  const deliveryFee = 10000;
  const finalTotal = totalPrice + deliveryFee;

  return (
    <>
      <Button
        variant="ghost"
        size="lg"
        onClick={open}
        className="cart-trigger position-relative"
        aria-label={`Giỏ hàng (${totalItems} sản phẩm)`}
      >
        <BiShoppingBag className="cart-icon" />
        {totalItems > 0 && (
          <Badge size="sm" className="cart-badge position-absolute">
            {totalItems > 99 ? '99+' : totalItems}
          </Badge>
        )}
      </Button>

      {/* Cart Drawer */}
      <Offcanvas show={show} onHide={close} placement="end" className="cart-drawer">
        {/* Header */}
        <Offcanvas.Header className="cart-header border-0">
          <div className="header-content w-100 d-flex align-items-center justify-content-between">
            <div className="header-left d-flex align-items-center gap-3">
              <div className="cart-icon-wrapper">
                <BiShoppingBag className="header-cart-icon" />
              </div>
              <div>
                <Offcanvas.Title className="cart-title mb-0">Giỏ hàng của bạn</Offcanvas.Title>
                <small className="cart-subtitle text-muted">{totalItems} sản phẩm</small>
              </div>
            </div>

            <div className="header-actions d-flex align-items-center gap-2">
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="clear-all-btn"
                  onClick={clearCart}
                  title="Xóa tất cả"
                >
                  <BiTrash />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="close-btn"
                onClick={close}
                aria-label="Đóng giỏ hàng"
              >
                <BiX />
              </Button>
            </div>
          </div>
        </Offcanvas.Header>

        <Offcanvas.Body className="cart-body p-0">
          {cart.length === 0 ? (
            /* Empty State */
            <div className="empty-state h-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
              <div className="empty-icon-wrapper mb-4">
                <Image src={emptyCart} width={120} height={100} className="empty-image" />
              </div>
              <h5 className="empty-title mb-2">Giỏ hàng trống</h5>
              <p className="empty-subtitle text-muted mb-4">
                Hãy thêm những sản phẩm yêu thích vào giỏ hàng nhé!
              </p>
              <Button variant="primary" className="continue-shopping-btn" onClick={close}>
                <BiArrowToRight className="me-2" />
                Tiếp tục mua sắm
              </Button>
            </div>
          ) : (
            <div className="cart-content h-100 d-flex flex-column">
              {/* Items List */}
              <div className="items-section flex-grow-1 overflow-auto px-3">
                <div className="items-list">
                  {cart.map((item: CartItem, index) => (
                    <div
                      key={`${item.id}-${item.size}-${item.mood}`}
                      className={`cart-item ${index === cart.length - 1 ? 'last-item' : ''}`}
                    >
                      <Row className="g-3 align-items-center">
                        {/* Product Image */}
                        <Col xs={3}>
                          <div className="product-image-wrapper">
                            <Image
                              src={item.image || '/placeholder.svg'}
                              alt={item.name}
                              className="product-image"
                              onClick={() => {
                                close();
                                navigate(`/product/${item.productId}`);
                              }}
                            />
                            <div className="image-overlay">
                              <Button
                                variant="link"
                                className="image-overlay-btn"
                                onClick={() => {
                                  close();
                                  navigate(`/product/${item.productId}`);
                                }}
                              >
                                <BiArrowToRight />
                              </Button>
                            </div>
                          </div>
                        </Col>

                        {/* Product Info */}
                        <Col xs={9}>
                          <div className="product-info">
                            {/* Product Header */}
                            <div className="product-header d-flex justify-content-between align-items-start mb-2">
                              <h6
                                className="product-name mb-0"
                                onClick={() => {
                                  close();
                                  navigate(`/product/${item.productId}`);
                                }}
                              >
                                {item.name}
                              </h6>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="remove-btn"
                                onClick={() => removeItem(item.id)}
                                title="Xóa sản phẩm"
                              >
                                <BiTrashAlt />
                              </Button>
                            </div>

                            {/* Product Options */}
                            <div className="product-options d-flex flex-wrap gap-2 mb-3 position-relative">
                              {/* Size Selector */}
                              <div className="option-group position-relative">
                                <label className="option-label">Size:</label>
                                <div className="select-wrapper position-relative">
                                  <Form.Select
                                    size="sm"
                                    value={item.size}
                                    onChange={(e) => updateItem(item.id, { size: e.target.value })}
                                    className="option-select pe-4"
                                    style={{
                                      appearance: 'none',
                                      WebkitAppearance: 'none',
                                      MozAppearance: 'none',
                                    }}
                                  >
                                    {isCake(item)
                                      ? [
                                          { name: 'piece', label: '1 miếng' },
                                          { name: 'whole', label: 'Cả bánh' },
                                        ].map((s) => (
                                          <option key={s.name} value={s.name}>
                                            {s.label}
                                          </option>
                                        ))
                                      : item.availableSizes?.map((s) => (
                                          <option key={s.name} value={s.name}>
                                            {s.name === 'whole'
                                              ? 'Cả bánh'
                                              : s.name === 'piece'
                                              ? '1 miếng'
                                              : s.name}
                                          </option>
                                        ))}
                                  </Form.Select>
                                  <span
                                    className="dropdown-icon position-absolute"
                                    style={{
                                      right: '10px',
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      pointerEvents: 'none',
                                      color: '#888',
                                      fontSize: '1rem',
                                    }}
                                  >
                                    <BiChevronDown />
                                  </span>
                                </div>
                              </div>

                              {/* Temperature Selector */}
                              {isDrink(item) && (
                                <div className="option-group position-relative">
                                  <label className="option-label">Nhiệt độ:</label>
                                  <div className="select-wrapper position-relative">
                                    <Form.Select
                                      size="sm"
                                      value={item.mood}
                                      onChange={(e) =>
                                        updateItem(item.id, { mood: e.target.value })
                                      }
                                      className="option-select pe-4"
                                      style={{
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none',
                                      }}
                                    >
                                      <option value="hot">🔥 Nóng</option>
                                      <option value="cold">🧊 Đá</option>
                                    </Form.Select>
                                    <span
                                      className="dropdown-icon position-absolute"
                                      style={{
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                        color: '#888',
                                        fontSize: '1rem',
                                      }}
                                    >
                                      <BiChevronDown />
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Price and Quantity */}
                            <div className="product-footer d-flex justify-content-between align-items-center">
                              <div className="price-info">
                                <span className="unit-price text-muted">
                                  {item.price.toLocaleString('vi-VN')}₫ × {item.quantity}
                                </span>
                                <div className="total-price">
                                  {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                </div>
                              </div>

                              <div className="quantity-controls d-flex align-items-center">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="qty-btn"
                                  onClick={() =>
                                    updateItem(item.id, {
                                      quantity: Math.max(1, item.quantity - 1),
                                    })
                                  }
                                  disabled={item.quantity <= 1}
                                >
                                  <BiMinus />
                                </Button>
                                <span className="qty-display">{item.quantity}</span>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="qty-btn"
                                  onClick={() =>
                                    updateItem(item.id, { quantity: item.quantity + 1 })
                                  }
                                >
                                  <BiPlus />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Summary */}
              <div className="summary-section border-top bg-light">
                <div className="summary-content p-3">
                  {/* Price Breakdown */}
                  <div className="price-breakdown mb-3">
                    <div className="price-row d-flex justify-content-between">
                      <span className="price-label">Tạm tính ({totalItems} món)</span>
                      <span className="price-value">{totalPrice.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div className="price-row d-flex justify-content-between">
                      <span className="price-label">Phí giao hàng</span>
                      <span className="price-value">{deliveryFee.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <hr className="my-2" />
                    <div className="price-row total-row d-flex justify-content-between">
                      <span className="price-label total-label">Tổng cộng</span>
                      <span className="price-value total-value">
                        {finalTotal.toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="action-buttons d-flex gap-2">
                    <Button variant="secondary" className="continue-btn flex-fill" onClick={close}>
                      Tiếp tục mua
                    </Button>
                    <Button
                      variant="primary"
                      className="checkout-btn flex-fill"
                      onClick={handleCheckout}
                    >
                      <BiArrowToRight className="me-2" />
                      Thanh toán
                    </Button>
                  </div>

                  {/* Additional Info */}
                  <div className="additional-info text-center mt-3">
                    <small className="text-muted">🚚 Miễn phí giao hàng cho đơn từ 200.000₫</small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default CartDrawer;
