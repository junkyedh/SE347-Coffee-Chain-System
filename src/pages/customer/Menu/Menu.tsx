import React, { useState, useEffect, useMemo } from "react";
import "./Menu.scss";
import { MainApiRequest } from "@/services/MainApiRequest";
import CategoryFilter, { Category } from "@/components/customer/CategoryFilter/CategoryFilter";
import SearchBar from "@/components/customer/Searchbar/Searchbar";
import CardProduct from "@/components/customer/CardProduct/CardProduct";
import SortDropdown from "@/components/customer/SortDropdown/SortDropdown";
import ViewToggle from "@/components/customer/ViewToggle/ViewToggle";
import CardListView from "@/components/customer/CardProduct/CardListView";
import Breadcrumbs from "@/components/littleComponent/Breadcrumbs/Breadcrumbs";
import PriceFilter, { PriceOption } from "@/components/customer/PriceFilter/PriceFilter";
import { Pagination } from "@/components/littleComponent/Pagination/Pagination";
import LoadingIndicator from "@/components/littleComponent/LoadingIndicator/Loading";
import EmptyState from "@/components/littleComponent/EmtyState/EmptyState";

interface RawProduct {
  id: string;
  name: string;
  category: string;
  description?: string;
  image: string;
  available: boolean;
  hot: boolean;
  cold: boolean;
  isPopular: boolean;
  isNew: boolean;
  sizes: { sizeName: string; price: number }[];
  materials: { name: string }[];
  rating?: number;
  discount?: number;
}
//Kiểu UI dùng trong component (CardProduct, CardListView)
export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  image: string;
  available: boolean;
  hot?: boolean;
  cold?: boolean;
  isPopular: boolean;
  isNew?: boolean;
  sizes: { sizeName: string; price: number }[];
  materials: { name: string }[];
  rating?: number;
  discount?: number;
}

const Menu: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceFilter, setPriceFilter] = useState<PriceOption>("all");
  const [sortBy, setSortBy] = useState<
    | "default"
    | "name-asc"
    | "name-desc"
    | "price-asc"
    | "price-desc"
    | "rating"
    | "popular"
  >("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // 12 products per page
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MainApiRequest.get<RawProduct[]>("/product/list")
      .then((res) => {
        //mapping dữ liệu từ RawProduct sang Product, chuyển sizeName -> name
        const mapped: Product[] = res.data.map((p) => ({
          ...p,
          sizes: p.sizes.map((s) => ({sizeName: s.sizeName, price: s.price})),
        }));
        setProducts(mapped);
      })
      .catch(console.error);
  }, []);

  // Build categories list dynamically
  const categories: Category[] = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return [
      { id: "all", name: "Tất cả", count: products.length, icon: "✨" },
      ...Object.entries(counts).map(([cat, cnt]) => ({
        id: cat,
        name: cat,
        count: cnt,
        icon:
          cat === "Cà phê"
            ? "☕"
            : cat === "Trà trái cây"
            ? "🍃"
            : cat === "Trà sữa"
            ? "🧋"
            : cat === "Nước ép"
            ? "🥤"
            : cat === "Sinh tố"
            ? "🥭"
            : cat === "Bánh ngọt"
            ? "🧁"
            : undefined,
      })),
    ];
  }, [products]);

  // Filtering
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (
        searchQuery &&
        !p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (selectedCategory !== "all" && p.category !== selectedCategory)
        return false;

      // Price filter based on first size price minus discount
      const basePrice = p.sizes[0]?.price - (p.discount || 0);
      if (priceFilter === "under-30k" && basePrice >= 30000) return false;
      if (
        priceFilter === "30k-50k" &&
        (basePrice < 30000 || basePrice > 50000)
      )
        return false;
      if (priceFilter === "over-50k" && basePrice <= 50000) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, priceFilter]);

    // Sorting
    const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "name-asc":
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        arr.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        arr.sort(
          (a, b) => a.sizes[0].price - (a.discount || 0) - (b.sizes[0].price - (b.discount || 0))
        );
        break;
      case "price-desc":
        arr.sort(
          (a, b) => b.sizes[0].price - (b.discount || 0) - (a.sizes[0].price - (a.discount || 0))
        );
        break;
      case "rating":
        arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "popular":
        arr.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
    }
    return arr;
  }, [filtered, sortBy]);

  // Add pagination logic
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sorted.slice(startIndex, endIndex);
  }, [sorted, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceFilter, sortBy]);

  useEffect(() => {
  setLoading(true);
  MainApiRequest.get<RawProduct[]>("/product/list")
    .then((res) => {
      const mapped: Product[] = res.data.map((p) => ({
        ...p,
        sizes: p.sizes.map((s) => ({sizeName: s.sizeName, price: s.price})),
      }));
      setProducts(mapped);
    })
    .catch(console.error)
    .finally(() => setLoading(false)); // Kết thúc loading dù thành công hay lỗi
}, []);

  return (
    <>
    <Breadcrumbs
        title="Menu"
        items={[
          { label: "Trang chủ", to: "/" },
          { label: "Thực đơn", to: "/menu" },
        ]}
    />
    <div className="menu-page">
      <header className="menu-page__header">
        {/* <h1 className="menu-page__title">Thực đơn tinh tế</h1> */}
        {/* <p className="menu-page__subtitle">
          {sorted.length} sản phẩm được lựa chọn
        </p> */}
      </header>

      <div className="menu-page__body">
        <aside className="menu-page__sidebar">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
          <PriceFilter
            selected={priceFilter}
            onChange={setPriceFilter}
          />
        </aside>

        <main className="menu-page__content">
          <div className="menu-page__toolbar">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm kiếm sản phẩm..."
          />
            <SortDropdown value={sortBy} onChange={setSortBy} />
            <ViewToggle mode={viewMode} onChange={setViewMode} />
            <span className="menu-page__count">
              Hiển thị {Math.min(itemsPerPage, sorted.length - (currentPage - 1) * itemsPerPage)} trong số {sorted.length}
              {totalPages > 1 && ` (Trang ${currentPage}/${totalPages})`}
            </span>
          </div>
          {loading ? (
            <div className="menu-page__loading">
              <LoadingIndicator text="Đang tải sản phẩm..." />
            </div>
          ) : (
            <>
            {sorted.length === 0 ? (
              <div className="menu-page__empty">
                <EmptyState text="Không có sản phẩm nào phù hợp với tìm kiếm của bạn." 
                icon={<span role="img" style={{fontSize: '2.2rem'}}>🔍</span>} />
              </div>
            ) : (
              <>
                <div className={ viewMode === "grid" ? "menu-page__grid" : "menu-page__list"}>
                  {viewMode === "grid"
                    ? paginatedProducts.map((prod) => (
                        <CardProduct key={prod.id} product={prod} />
                      ))
                    : paginatedProducts.map((prod) => (
                        <div key={prod.id} className="menu-page__list-item">
                          <CardListView product={prod} />
                        </div>
                      ))}
                </div>
              
                {/* Add Pagination */}
                {totalPages > 1 && (
                  <div className="menu-page__pagination">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="pagination-elegant"
                    />
                  </div>
                )}
              </>
            )}
          </>
          )}
        </main>
      </div>
    </div>
    </>
  );
};

export default Menu;