import Breadcrumbs from '@/components/common/Breadcrumbs/Breadcrumbs';
import EmptyState from '@/components/common/EmtyState/EmptyState';
import LoadingIndicator from '@/components/common/LoadingIndicator/Loading';
import LoginPromptModal from '@/components/common/LoginPromptModal/LoginPromptModal';
import { Pagination } from '@/components/common/Pagination/Pagination';
import CardListView from '@/components/customer/CardListView/CardListView';
import CardProduct from '@/components/customer/CardProduct/CardProduct';
import CategoryFilter, { Category } from '@/components/customer/CategoryFilter/CategoryFilter';
import PriceFilter, { PriceOption } from '@/components/customer/PriceFilter/PriceFilter';
import SearchBar from '@/components/customer/Searchbar/Searchbar';
import SortDropdown from '@/components/customer/SortDropdown/SortDropdown';
import ViewToggle from '@/components/customer/ViewToggle/ViewToggle';
import { useCart } from '@/hooks/cartContext';
import { useAuth } from '@/hooks/useAuth';
import { MainApiRequest } from '@/services/MainApiRequest';
import { message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createProductUrl } from '@/utils/slugify';
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
  discount?: number;
}

const Menu: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState<PriceOption>('all');
  const [sortBy, setSortBy] = useState<
    'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'rating' | 'popular'
  >('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  // Handler cho add to cart với login check
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

  // Handler cho product click
  const handleProductClick = (productId: string, productName: string) => {
    navigate(createProductUrl(productName, productId));
  };

  // Đọc category từ URL params khi component mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // Handler để update cả state và URL khi thay đổi category
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset về trang 1 khi đổi category
    
    // Update URL
    if (categoryId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryId);
    }
    setSearchParams(searchParams);
  };

  useEffect(() => {
    MainApiRequest.get<RawProduct[]>('/product/list')
      .then((res) => {
        const mapped: Product[] = res.data.map((p) => ({
          ...p,
          sizes: p.sizes.map((s) => ({ sizeName: s.sizeName, price: s.price })),
        }));
        setProducts(mapped);
      })
      .catch(console.error);
  }, []);

  const categories: Category[] = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return [
      { id: 'all', name: 'Tất cả', count: products.length, icon: '✨' },
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
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

      const basePrice = p.sizes[0]?.price - (p.discount || 0);
      if (priceFilter === 'under-30k' && basePrice >= 30000) return false;
      if (priceFilter === '30k-50k' && (basePrice < 30000 || basePrice > 50000)) return false;
      if (priceFilter === 'over-50k' && basePrice <= 50000) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, priceFilter]);

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

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sorted.slice(startIndex, endIndex);
  }, [sorted, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceFilter, sortBy]);

  useEffect(() => {
    setLoading(true);
    MainApiRequest.get<RawProduct[]>('/product/list')
      .then((res) => {
        const mapped: Product[] = res.data.map((p) => ({
          ...p,
          sizes: p.sizes.map((s) => ({ sizeName: s.sizeName, price: s.price })),
        }));
        setProducts(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <LoginPromptModal 
        isOpen={showLoginPrompt} 
        onClose={() => setShowLoginPrompt(false)} 
      />
      <Breadcrumbs
        title={selectedCategory !== 'all' ? selectedCategory : 'Menu'}
        items={[
          { label: 'Trang chủ', to: '/' },
          { label: 'Thực đơn', to: '/thuc-don' },
          ...(selectedCategory !== 'all' ? [{ label: selectedCategory, to: `/thuc-don?category=${selectedCategory}` }] : [])
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
