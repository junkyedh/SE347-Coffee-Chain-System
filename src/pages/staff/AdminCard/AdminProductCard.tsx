import AdminButton from "@/pages/admin/button/AdminButton";
import { Button, Tag } from "antd";
import React from "react";
import "./AdminProductCard.scss";
const drinkCategories = [
  "Cà phê",
  "Trà trái cây",
  "Trà sữa",
  "Nước ép",
  "Sinh tố",
];

interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  available: boolean;
  hot: boolean;
  cold: boolean;
  sizes: {
    sizeName: string;
    price: number;
  }[];
}

interface AdminProductCardProps {
  product: Product;
  selectedSize?: string;
  selectedMood?: string;
  onSelectSize: (size: string) => void;
  onSelectMood: (mood: string) => void;
  onAddToOrder: (size: string) => void;
  isCurrentProduct: boolean;
  cartQuantity?: number;
}

const AdminProductCard: React.FC<AdminProductCardProps> = ({
  product,
  selectedSize,
  selectedMood,
  onSelectSize,
  onSelectMood,
  onAddToOrder,
  isCurrentProduct,
  cartQuantity,
}) => {
  const isDrink = drinkCategories.includes(product.category);
  const isCake = product.category === "Bánh ngọt";
  const isCoffee = product.category === "Cà phê";

  const cakeSizes = [
    { label: "1 miếng", value: "piece", price: product.sizes[0]?.price },
    {
      label: "Cả bánh",
      value: "whole",
      price: (product.sizes[0]?.price || 0) * 8,
    },
  ];
  return (
    <div className={`product-card ${!product.available ? "disabled" : ""}`}>
      <div className="product-image">
        <img
          src={product.image || "/placeholder.svg?height=120&width=180"}
          alt={product.name}
        />
        {!product.available && (
          <div className="sold-out-overlay">
            <span>Hết hàng</span>
          </div>
        )}
      </div>

      <div className="product-content">
        <div className="product-header">
          <Tag color="blue" className="category-tag">
            {product.category}
          </Tag>
          <h3 className="product-name">{product.name}</h3>
        </div>

        {product.available ? (
          <>
            {/* Size Selection */}
            <div className="selection-section">
              <span className="selection-label">Size:</span>
              <div className="size-options">
                {isCake
                  ? cakeSizes.map((opt) => (
                      <Button
                        key={opt.value}
                        size="small"
                        className={selectedSize === opt.value ? "selected" : ""}
                        onClick={() => onSelectSize(opt.value)}
                      >
                        {opt.label} - {opt.price?.toLocaleString("vi-VN")}₫
                      </Button>
                    ))
                  : product.sizes.map((s) => (
                      <Button
                        key={s.sizeName}
                        size="small"
                        className={
                          selectedSize === s.sizeName ? "selected" : ""
                        }
                        onClick={() => onSelectSize(s.sizeName)}
                      >
                        {s.sizeName}
                      </Button>
                    ))}
              </div>
            </div>

            {isCoffee && (
              <div className="selection-section">
                <span className="selection-label">Nhiệt độ:</span>
                <div className="mood-options">
                  {product.hot && (
                    <Button
                      size="small"
                      className={selectedMood === "hot" ? "selected" : ""}
                      onClick={() => onSelectMood("hot")}
                    >
                      Nóng
                    </Button>
                  )}
                  {product.cold && (
                    <Button
                      size="small"
                      className={selectedMood === "cold" ? "selected" : ""}
                      onClick={() => onSelectMood("cold")}
                    >
                      Đá
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="product-footer">
              <div className="price-section">
                <span className="price-value">
                  {(() => {
                    let p = 0;
                    if (isCake) {
                      const opt = cakeSizes.find(
                        (o) => o.value === selectedSize
                      );
                      p = opt?.price ?? cakeSizes[0].price;
                    } else {
                      const sz = product.sizes.find(
                        (s) => s.sizeName === selectedSize
                      );
                      p = sz?.price ?? product.sizes[0].price;
                    }
                    return p.toLocaleString("vi-VN");
                  })()}
                  ₫
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AdminButton
                  variant="primary"
                  size="sm"
                  icon={<i className="fas fa-plus"></i>}
                  disabled={!selectedSize || (isCoffee && !selectedMood)}
                  onClick={() => onAddToOrder(selectedSize!)}
                />
                {cartQuantity && cartQuantity > 0 && (
                  <span className="cart-quantity-label">
                    Trong giỏ: {cartQuantity}
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="unavailable-notice">Sản phẩm tạm hết</div>
        )}
      </div>
    </div>
  );
};

export default AdminProductCard;
