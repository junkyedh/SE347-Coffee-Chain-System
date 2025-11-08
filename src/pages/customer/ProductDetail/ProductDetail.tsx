import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { FaHeart, FaMinus, FaPlus, FaStar } from "react-icons/fa";
import "./ProductDetail.scss";
import { MainApiRequest } from "@/services/MainApiRequest";
import Breadcrumbs from "@/components/littleComponent/Breadcrumbs/Breadcrumbs";
import { yellow } from "@mui/material/colors";
import ProductRating from "@/components/customer/RatingStar/ProductRating";
import { useCart } from "@/hooks/cartContext";
import { message } from "antd";
import LoadingIndicator from "@/components/littleComponent/LoadingIndicator/Loading";

interface ProductSize {
  sizeName: string;
  price: number;
}

interface ProductMaterial {
  materialId: number;
  materialQuantity: number;
  name: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  available: boolean;
  isPopular: boolean;
  isNew: boolean;
  hot?: boolean;
  cold?: boolean;
  sizes: ProductSize[];
  materials: ProductMaterial[];
}

interface RatingEntry {
  id: number;
  description: string;
  star: number;
  createdAt: string;
  customer: {
    phone: string;
    name: string;
    rank: string;
  };
}

interface RatingData {
  averageStar: number;
  totalRatings: number;
  starCounts: Record<"1"|"2"|"3"|"4"|"5", number>;
  ratings: RatingEntry[];
}

const DetailProduct: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [selectedTemp, setSelectedTemp] = useState<"hot" | "cold">("cold");
    const [ratingData, setRatingData] = useState<RatingData | null>(null);
    const [filterStar, setFilterStar] = useState<"5" | "4" | "3" | "2" | "1" | "all">("all");
    const [sortOption, setSortOption] = useState<"newest" | "oldest">("newest");
    const {addToCart} = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!id) return;
        MainApiRequest.get(`/product/${id}`)
        .then((res) => {
            const p: Product = res.data;
            setProduct(p);
            setSelectedSize(p.sizes[0]?.sizeName || "");
            if (p.hot) setSelectedTemp("hot");
            else if (p.cold) setSelectedTemp("cold");
        })
        .catch(console.error);

        // Fetch ratings
        MainApiRequest.get<RatingData>(`/ratings/product/${id}`)
            .then((res) => setRatingData(res.data))
            .catch((err) => {
                console.error("Failed to fetch ratings:", err);
                setRatingData(null);
            })
        }, [id]);

    // Always call hooks at the top level
    const displayedRatings = useMemo(() => {
        if (!ratingData) return [];
        let list = ratingData.ratings;

        // 1) Filter by star rating
        if (filterStar !== "all") {
            list = list.filter((r) => r.star.toString() === filterStar);
        }
        // 2) Sort by date
        if (sortOption === "newest") {
            list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else {
            list = [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
        return list;
    }, [ratingData, filterStar, sortOption]);

    if (!product) return (
        <div className="detailProduct__empty">
            <LoadingIndicator text="Đang tải sản phẩm..." />
        </div>
    )
    const isCake = product.category === "Bánh ngọt";
    // const needsTemp = ["Cà phê", "Trà trái cây"].includes(product.category);

    const drinkCategories = [
        "Cà phê",
        "Trà trái cây",
        "Trà sữa",
        "Nước ép",
        "Sinh tố"
    ];
  // nếu là cà phê hoặc trà, mood mặc định hot/cold từ product.hot/product.cold
  const needsTemp = drinkCategories.includes(product.category)
    ? (product.hot ? "hot" : (product.cold ? "cold" : undefined))
    : undefined;

    const currentPrice = (() => {
        if (isCake) {
            const base = product.sizes[0].price;
            return selectedSize === "whole" ? base * 8 : base;
        }
        const sz = product.sizes.find((s) => s.sizeName === selectedSize);
        return sz?.price || 0;
    })();

    const handleAddToCart = async () => {
        try {
            //addToCart tự động xử lý sessionId và phoneCustomer
            await addToCart(Number(product.id), selectedSize, quantity, needsTemp ? selectedTemp : undefined);
            message.success("Đã thêm vào giỏ hàng!");
        } catch (error) {
            console.error("Thêm vào giỏ hàng thất bại:", error);
            message.error("Thêm vào giỏ hàng thất bại. Vui lòng thử lại sau.");
        }
    }
    // const handleSizeChange = (size: string) => {
    //     setSelectedSize(size);
    //     if (isCake && size === "whole") {
    //         setSelectedTemp("hot");
    //     } else if (needsTemp) {
    //         setSelectedTemp("hot");
    //     }
    // };

    const handlePlaceOrder = () => {
        if (!product.available) return message.error("Sản phẩm đang hết hàng.");
        navigate(`/checkout`, {
            state: {
                initialItems: [{
                    productId: product.id,
                    size: selectedSize,
                    mood: needsTemp ? selectedTemp : undefined,
                    quantity,
                }],
            }
        });
    };


    return (
        <>
        <Breadcrumbs
            title={product.name}
            items={[
                { label: "Trang chủ", to: "/" },
                { label: product.category, to: `/category/${product.category}` },
                { label: product.name}]}
        />

        <div className="detailProduct">
            {/* LEFT: ảnh + reviews */}
            <div className="detailProduct__left">
                <div className="image-wrapper">
                    <img src={product.image} alt={product.name} />
                    {product.isPopular && <span className="badge popular">Bán chạy</span>}
                    {product.isNew && <span className="badge new">Mới</span>}
                </div>


            <div className="reviews">

                {/* 1. Tổng quan đánh giá */}
                <div className="rating-summary">
                <h3>Đánh giá từ khách hàng</h3>
                {ratingData ? (
                    <>
                    <div className="big-number">
                        {ratingData.averageStar.toFixed(1)}
                    </div>
                    <ProductRating
                        averageStar={ratingData.averageStar}
                        totalRatings={ratingData.totalRatings}
                    />
                    <ul className="star-breakdown">
                        {(["5","4","3","2","1"] as Array<"5"|"4"|"3"|"2"|"1">).map(star => (
                        <li key={star}>
                            <span className="star-label">
                                {star}
                                <span style={{ marginLeft: 4, fontSize: 16, justifyContent: "flex-start", top: -2 }}>
                                    <FaStar style={{ color: yellow[700] }} />
                                </span>
                            </span>
                            <div className="bar">
                            <div
                                className="fill"
                                style={{
                                width: `${(ratingData.starCounts[star] / ratingData.totalRatings) * 100}%`
                                }}
                            />
                            </div>
                            <span className="count">
                            {ratingData.starCounts[star]}
                            </span>
                        </li>
                        ))}
                    </ul>
                    </>
                ) : (
                    <div>Đang tải đánh giá…</div>
                )}
                </div>


                {/* 3. Danh sách các reivew */}
                <div className="review-list">
                    {/* 2. Filter & sort */}
                    <div className="review-filters">
                    <div className="filter-group">
                        <label>Lọc:</label>
                        <select
                            value={filterStar}
                            onChange={(e) => setFilterStar(e.target.value as "5" | "4" | "3" | "2" | "1" | "all")
                            }
                            >
                            <option value="all">Tất cả</option>
                            <option value="5">5 sao</option>
                            <option value="4">4 sao</option>
                            <option value="3">3 sao</option>
                            <option value="2">2 sao</option>
                            <option value="1">1 sao</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Sắp xếp:</label>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as "newest" | "oldest")}
  
                        >
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        </select>
                    </div>
                    </div>
                    {displayedRatings.map(r => (
                        <div key={r.id} className="review-item">
                        <div className="avatar">
                            {r.customer.name.charAt(0)}
                        </div>
                        <div className="review-content">
                            <div className="name-line">
                            <span className="name">{r.customer.name}</span>
                            <span className="purchased">Đã mua hàng</span>
                            <span className="date">
                                {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                            </span>
                            </div>
                            <ProductRating
                            averageStar={r.star}
                            showText={false}
                            />
                            <div className="title">
                            {r.star >= 5 ? "Tuyệt vời" : r.star >= 4 ? "Tốt" : ""}
                            </div>
                            <p className="comment">{r.description}</p>
                            <div className="helpful">
                            👍 Hữu ích (0)
                            </div>
                        </div>
                        </div>
                    ))}
                </div>

                {/* <NavLink to={`/product/${product.id}/reviews`} className="view-all">
                Xem tất cả đánh giá
                </NavLink> */}
            </div>
        </div>

            {/* RIGHT: thông tin chi tiết */}
            <div className="detailProduct__right">
            <div className="header">
                <div className="header-info">
                    <span className="category">{product.category}</span>
                    <span className={`status ${product.available ? "in" : "out"}`}>
                    {product.available ? "Có sẵn" : "Hết hàng"}
                    </span>
                </div>
                <h1>{product.name}</h1>
                {ratingData && (
                    <ProductRating
                        averageStar={ratingData.averageStar}
                        totalRatings={ratingData.totalRatings}
                        />
                    )
                }
                <p className="desc">{product.description}</p>
            </div>

            <div className="materials">
                <h4>Nguyên liệu</h4>
                <div className="material-list">
                {product.materials.map((m) => (
                    <span key={m.materialId} className="material-badge">
                    {m.name}
                    </span>
                ))}
                </div>
            </div>

            <hr className="divider" />

            {/* Size */}
            <div className="options size-options">
                <p className="option-title">{isCake ? "Phần ăn:" : "Kích thước:"}</p>
                <div className="option-cards">
                {isCake ? (
                    ["piece", "whole"].map((val) => (
                    <label
                        key={val}
                        className={`option-card ${selectedSize === val ? "active" : ""}`}
                    >
                        <input
                        type="radio"
                        name="size"
                        value={val}
                        checked={selectedSize === val}
                        onChange={() => setSelectedSize(val)}
                        />
                        <span className="label-text">
                        {val === "piece" ? "🍰 1 miếng" : "🎂 Cả bánh"}
                        </span>
                        <span className="label-price">
                        {(
                            (val === "piece"
                            ? product.sizes[0].price
                            : product.sizes[0].price * 8) || 0
                        ).toLocaleString("vi-VN")}
                        ₫
                        </span>
                    </label>
                    ))
                ) : (
                    product.sizes.map((s) => (
                    <label
                        key={s.sizeName}
                        className={`option-card ${selectedSize === s.sizeName ? "active" : ""}`}
                    >
                        <input
                        type="radio"
                        name="size"
                        value={s.sizeName}
                        checked={selectedSize === s.sizeName}
                        onChange={() => setSelectedSize(s.sizeName)}
                        />
                        <span className="label-text">{s.sizeName}</span>
                        <span className="label-price">
                        {s.price.toLocaleString("vi-VN")}₫
                        </span>
                    </label>
                    ))
                )}
                </div>
            </div>

            {/* Nhiệt độ */}
            {needsTemp && (
                <div className="options temp-options">
                <p className="option-title">Nhiệt độ:</p>
                <div className="option-cards">
                    <button
                        className={`option-card ${selectedTemp === "hot" ? "active" : ""}`}
                        onClick={() => setSelectedTemp("hot")}
                    >
                        <input
                        type="radio"
                        name="temp"
                        value="hot"
                        checked={selectedTemp === "hot"}
                        onChange={() => setSelectedTemp("hot")}
                        />
                        <span className="label-text">🔥 Nóng</span>
                    </button>
                    <button
                        className={`option-card ${selectedTemp === "cold" ? "active" : ""}`}
                        onClick={() => setSelectedTemp("cold")}
                    >
                        <input
                        type="radio"
                        name="temp"
                        value="cold"
                        checked={selectedTemp === "cold"}
                        onChange={() => setSelectedTemp("cold")}
                        />
                        <span className="label-text">🧊 Lạnh</span>
                    </button>
                </div>
                </div>
            )}

            {/* <div className="quantity">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                <FaMinus />
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)}>
                <FaPlus />
                </button>
            </div> */}
            <div className="quantity">
                <h4>Số lượng</h4>
                <div className="quantity-controls">
                <button
                    className="quantity-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                    <FaMinus />
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                    className="quantity-btn"
                    onClick={() => setQuantity((q) => q + 1)}
                >
                    <FaPlus />
                </button>
                </div>
            </div>

            <hr className="divider" />

            <div className="summary">
                <div className="summary-price">
                Tổng cộng: 
                <span>{(currentPrice * quantity).toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="summary-actions">
                <button className="btn add-cart" onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
                <button className="btn buy-now" onClick={handlePlaceOrder}>Mua ngay</button>
                </div>
            </div>

            <hr className="divider" />

            <div className="info">
                <p>⏰ Thời gian chuẩn bị: {isCake ? "10-15 phút" : "5-10 phút"}</p>
                <p>🚚 Giao hàng: 15-30 phút</p>
                <p>📍 Có sẵn tại: Tất cả cửa hàng</p>
            </div>
            </div>
        </div>
        </>
    );
};

export default DetailProduct;
