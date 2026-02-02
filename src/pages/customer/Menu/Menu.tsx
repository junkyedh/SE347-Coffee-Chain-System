import Breadcrumbs from '@/components/common/Breadcrumbs/Breadcrumbs';
import EmptyState from '@/components/common/EmtyState/EmptyState';
import LoadingIndicator from '@/components/common/LoadingIndicator/Loading';
import LoginPromptModal from '@/components/common/LoginPromptModal/LoginPromptModal';
import { Pagination } from '@/components/common/Pagination/Pagination';
import SEO from '@/components/common/SEO';
import BranchFilter from '@/components/customer/BranchFilter/BranchFilter';
import CardListView from '@/components/customer/CardListView/CardListView';
import CardProduct from '@/components/customer/CardProduct/CardProduct';
import CategoryFilter, { Category } from '@/components/customer/CategoryFilter/CategoryFilter';
import PriceFilter, { PriceOption } from '@/components/customer/PriceFilter/PriceFilter';
import SearchBar from '@/components/customer/Searchbar/Searchbar';
import SortDropdown from '@/components/customer/SortDropdown/SortDropdown';
import ViewToggle from '@/components/customer/ViewToggle/ViewToggle';
import { ROUTES } from '@/constants';
import { useCart } from '@/hooks/cartContext';
import { useAuth } from '@/hooks/useAuth';
import { UnifiedApiRequest } from '@/services/UnifiedApiRequest';
import { createProductUrl } from '@/utils/slugify';
import { message } from 'antd';
import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Menu.scss';

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
  totalRatings?: number;
  discount?: number;
}

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
  totalRatings?: number;
  discount?: number;
}

const Menu: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState<number | 'all'>('all');
  const [priceFilter, setPriceFilter] = useState<PriceOption>('all');
  const [sortBy, setSortBy] = useState<
    'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'rating' | 'popular'
  >('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [branchList, setBranchList] = useState<any[]>([]);

  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  const handleAddToCart = async (
    productId: number,
    size: string,
    quantity: number = 1,
    mood?: string
  ) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      await addToCart(productId, size, quantity, mood);
      message.success('Thêm vào giỏ hàng thành công!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      message.error('Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.');
    }
  };

  const fetchBranchList = async () => {
    try {
      const res = await UnifiedApiRequest.get('/branch/list');
      setBranchList(res.data);
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error('Error fetching branch list:', error);
    }
  };

  // Fetch all products for category counts
  const fetchAllProducts = async () => {
    try {
      const res = await UnifiedApiRequest.get<RawProduct[]>('/product/list');
      const mapped: Product[] = res.data.map((p) => ({
        ...p,
        sizes: p.sizes.map((s) => ({ sizeName: s.sizeName, price: s.price })),
      }));
      setAllProducts(mapped);
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error('Error fetching all products:', error);
    }
  };

  // Fetch filtered products from backend
  const fetchFilteredProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBranch !== 'all') {
        params.append('branchId', String(selectedBranch));
      }

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const res = await UnifiedApiRequest.get<RawProduct[]>(`/product/filter?${params.toString()}`);

      const mapped: Product[] = res.data.map((p) => ({
        ...p,
        sizes: p.sizes.map((s) => ({ sizeName: s.sizeName, price: s.price })),
      }));

      setProducts(mapped);
    } catch (error) {
      if (axios.isCancel(error)) {
        setLoading(false);
        return;
      }
      console.error('Error fetching filtered products:', error);
      message.error('Không thể tải sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, selectedCategory]);

  const handleProductClick = (productId: string, productName: string) => {
    navigate(createProductUrl(productName, productId));
  };

  const handleBranchChange = (branchId: number | 'all') => {
    setSelectedBranch(branchId);
    setCurrentPage(1);

    if (branchId === 'all') {
      searchParams.delete('branch');
    } else {
      searchParams.set('branch', String(branchId));
    }
    setSearchParams(searchParams);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);

    if (categoryId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryId);
    }
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const branchFromUrl = searchParams.get('branch');

    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }

    if (branchFromUrl) {
      setSelectedBranch(branchFromUrl === 'all' ? 'all' : Number(branchFromUrl));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchBranchList();
    fetchAllProducts();
  }, []);

  useEffect(() => {
    fetchFilteredProducts();
  }, [fetchFilteredProducts]);

  const categories: Category[] = useMemo(() => {
    const counts: Record<string, number> = {};
    allProducts.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return [
      { id: 'all', name: 'Tất cả', count: allProducts.length, icon: '✨' },
      ...Object.entries(counts).map(([cat, cnt]) => ({
        id: cat,
        name: cat,
        count: cnt,
        icon:
          cat === 'Cà phê'
            ? '☕'
            : cat === 'Trà trái cây'
            ? '🍃'
            : cat === 'Trà sữa'
            ? '🧋'
            : cat === 'Nước ép'
            ? '🥤'
            : cat === 'Sinh tố'
            ? '🥭'
            : cat === 'Bánh ngọt'
            ? '🧁'
            : undefined,
      })),
    ];
  }, [allProducts]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      const basePrice = p.sizes[0]?.price - (p.discount || 0);
      if (priceFilter === 'under-30k' && basePrice >= 30000) return false;
      if (priceFilter === '30k-50k' && (basePrice < 30000 || basePrice > 50000)) return false;
      if (priceFilter === 'over-50k' && basePrice <= 50000) return false;

      return true;
    });
  }, [products, searchQuery, priceFilter]);

  // Sort products
  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case 'name-asc':
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        arr.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        arr.sort(
          (a, b) => a.sizes[0].price - (a.discount || 0) - (b.sizes[0].price - (b.discount || 0))
        );
        break;
      case 'price-desc':
        arr.sort(
          (a, b) => b.sizes[0].price - (b.discount || 0) - (a.sizes[0].price - (a.discount || 0))
        );
        break;
      case 'rating':
        arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        arr.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
    }
    return arr;
  }, [filtered, sortBy]);

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sorted.slice(startIndex, endIndex);
  }, [sorted, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, priceFilter, sortBy]);

  return (
    <>
      <SEO
        title={selectedCategory !== 'all' ? `${selectedCategory} - Thực đơn` : 'Thực đơn'}
        description={`Xem thực đơn ${
          selectedCategory !== 'all' ? selectedCategory : 'đầy đủ'
        } tại SE347 Coffee Chain. Cà phê, trà sửa, bánh ngọt và nhiều thức uống hấp dẫn khác. Đặt hàng online giá tốt.`}
        keywords={`thực đơn, menu, ${
          selectedCategory !== 'all' ? selectedCategory : 'cà phê, trà sửa, bánh ngọt'
        }, đồ uống, giá cả, đặt hàng online`}
      />
      <LoginPromptModal isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
      <Breadcrumbs
        title={selectedCategory !== 'all' ? selectedCategory : 'Menu'}
        items={[
          { label: 'Trang chủ', to: ROUTES.HOME },
          { label: 'Thực đơn', to: ROUTES.MENU },
          ...(selectedCategory !== 'all'
            ? [{ label: selectedCategory, to: `${ROUTES.MENU}?category=${selectedCategory}` }]
            : []),
        ]}
      />
      <div className="menu-page">
        <header className="menu-page__header"></header>

        <div className="menu-page__body">
          <aside className="menu-page__sidebar">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onChange={handleCategoryChange}
            />
            <BranchFilter
              branches={branchList}
              selected={selectedBranch}
              onChange={handleBranchChange}
            />
            <PriceFilter selected={priceFilter} onChange={setPriceFilter} />
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
                Hiển thị {Math.min(itemsPerPage, sorted.length - (currentPage - 1) * itemsPerPage)}{' '}
                trong số {sorted.length}
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
                    <EmptyState
                      text="Không có sản phẩm nào phù hợp với tìm kiếm của bạn."
                      icon={
                        <span role="img" style={{ fontSize: '2.2rem' }}>
                          🔍
                        </span>
                      }
                    />
                  </div>
                ) : (
                  <>
                    <div className={viewMode === 'grid' ? 'menu-page__grid' : 'menu-page__list'}>
                      {viewMode === 'grid'
                        ? paginatedProducts.map((prod) => (
                            <CardProduct
                              key={prod.id}
                              product={prod}
                              onAddToCart={(size, quantity, mood) =>
                                handleAddToCart(Number(prod.id), size, quantity, mood)
                              }
                              onProductClick={() => handleProductClick(prod.id, prod.name)}
                            />
                          ))
                        : paginatedProducts.map((prod) => (
                            <div key={prod.id} className="menu-page__list-item">
                              <CardListView
                                product={prod}
                                onAddToCart={(productId, size, quantity, mood) =>
                                  handleAddToCart(productId, size, quantity, mood)
                                }
                                onProductClick={() => handleProductClick(prod.id, prod.name)}
                              />
                            </div>
                          ))}
                    </div>

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
