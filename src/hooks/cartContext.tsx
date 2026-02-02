import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { MainApiRequest } from '@/services/MainApiRequest';
import { useSystemContext } from './useSystemContext';
import { getProductDisplayInfo } from '@/utils/productSize';

interface RawCartItem {
  id: string;
  productId: string;
  size: string;
  mood?: string;
  quantity: number;
  branchId?: number;
}
interface ProductMaterial {
  name: string;
}

interface ProductSize {
  sizeName: string;
  price: number;
}
interface Product {
  id: string;
  name: string;
  category: string;
  description?: ProductMaterial[];
  image: string;
  available: boolean;
  hot: boolean;
  cold: boolean;
  isPopular: boolean;
  isNew: boolean;
  sizes: ProductSize[];
  material: { name: string }[];
}

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  image: string;
  category: string;
  price: number;
  quantity: number;
  size: string;
  mood?: string;
  branchId?: number;
  availableSizes: { name: string; price: number }[];
}

interface CartContextValue {
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, size: string, quantity?: number, mood?: string, branchId?: number) => Promise<void>;
  updateItem: (
    id: string,
    updates: { quantity?: number; size?: string; mood?: string }
  ) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  removeCartItemsAfterOrder: (
    items: { productId: number | string; size: string; mood?: string }[]
  ) => Promise<void>;
  getCartBranchId: () => number | null;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { userInfo, isLoggedIn, isInitialized } = useSystemContext();
  
  // Debounce timer cho update operations
  const updateTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  // Prevent concurrent fetch requests
  const isFetchingRef = useRef(false);

  const fetchCart = useCallback(async () => {
    // Skip if not initialized or not logged in
    if (!isInitialized || !isLoggedIn || !userInfo?.phone) {
      setCart([]);
      isFetchingRef.current = false;
      return;
    }

    // Prevent duplicate concurrent calls
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    try {
      const phoneCustomer = userInfo.phone;
      
      const abortController = new AbortController();
      
      const res = await MainApiRequest.get<RawCartItem[]>(
        `/cart?phoneCustomer=${encodeURIComponent(phoneCustomer)}`,
        {
          signal: abortController.signal
        }
      );

      const rawItems: RawCartItem[] = res.data || [];
      
      if (rawItems.length === 0) {
        setCart([]);
        return;
      }
      
      const isCake = (cat: string) => cat?.toLowerCase() === 'cake';

      // Fetch product details with proper error handling
      const enrichedItems: CartItem[] = [];
      
      for (const ci of rawItems) {
        try {
          const productAbortController = new AbortController();
          
          const { data: p } = await MainApiRequest.get<Product>(
            `/product/${ci.productId}`,
            {
              signal: productAbortController.signal
            }
          );
          
          if (!p) {
            console.warn(`Product ${ci.productId} not found, skipping cart item`);
            continue;
          }
          
          const { price } = getProductDisplayInfo(p as any, ci.size);

          const availableSizes = isCake(p.category)
            ? [
                {
                  name: 'piece',
                  price: getProductDisplayInfo(p as any, 'piece').price,
                },
                {
                  name: 'whole',
                  price: getProductDisplayInfo(p as any, 'whole').price,
                },
              ]
            : p.sizes
                .filter((s) => s.sizeName !== 'whole')
                .map((s) => ({ name: s.sizeName, price: s.price }));

          enrichedItems.push({
            id: ci.id,
            productId: Number(ci.productId),
            name: p.name,
            image: p.image,
            category: p.category,
            size: ci.size,
            mood: ci.mood,
            quantity: ci.quantity,
            price,
            branchId: ci.branchId,
            availableSizes,
          });
        } catch (productErr) {
          // Handle individual product fetch errors
          if (axios.isCancel(productErr)) {
            console.debug(`Product fetch canceled for ${ci.productId}`);
            continue;
          }
          
          console.warn(`Failed to fetch product ${ci.productId}:`, productErr);
        }
      }

      setCart(enrichedItems);
    } catch (err: any) {
      if (axios.isCancel(err)) {
        console.debug('Cart fetch was canceled');
        return;
      }
      
      if (err.response?.status === 401) {
        console.warn('Authentication error while fetching cart');
        setCart([]); // Clear cart on auth error
      } else if (err.response?.status >= 500) {
        console.error('Server error while fetching cart:', err);
        // Keep existing cart for server errors
      } else {
        console.error('Fetch cart failed:', err);
        // Keep existing cart for unknown errors
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [isInitialized, isLoggedIn, userInfo?.phone]);

  // Single useEffect to trigger fetchCart on mount and when dependencies change
  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  const addToCart = async (
    productId: number,
    size: string,
    quantity: number = 1,
    mood?: string,
    branchId?: number
  ) => {
    try {
      if (!isLoggedIn || !userInfo?.phone) {
        throw new Error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      }

      // Nếu giỏ hàng đã có sản phẩm từ chi nhánh khác → không cho thêm
      const existingBranchId = getCartBranchId();
      if (existingBranchId !== null && branchId !== undefined && existingBranchId !== branchId) {
        throw new Error(
          `Giỏ hàng đã có sản phẩm từ chi nhánh khác. Vui lòng xóa giỏ hàng hoặc chọn sản phẩm cùng chi nhánh.`
        );
      }

      const phoneCustomer = userInfo.phone;
      
      // Create abort controller for this specific request
      const abortController = new AbortController();
      
      const payload = {
        phoneCustomer,
        productId,
        size,
        mood: mood || null,
        quantity,
        branchId: branchId || null,
      };
      
      await MainApiRequest.post('/cart', payload, {
        signal: abortController.signal
      });
      
      // Refresh cart data after successful add
      await fetchCart();
    } catch (err: any) {
      // Handle specific error types
      if (err.code === 'ERR_CANCELED' || err.name === 'CanceledError') {
        throw new Error('Yêu cầu đã bị hủy, vui lòng thử lại');
      }
      
      if (err.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      }
      
      if (err.response?.status === 400) {
        throw new Error(err.response.data?.message || 'Thông tin sản phẩm không hợp lệ');
      }
      
      if (err.response?.status === 500) {
        const serverMsg = err.response.data?.message;
        throw new Error(serverMsg || 'Lỗi máy chủ, vui lòng thử lại sau');
      }
      
      if (!err.response && err.request) {
        throw new Error('Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối');
      }

      console.error('Add to cart failed:', err);
      throw new Error(err.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

  const updateItem = async (
    id: string,
    updates: { quantity?: number; size?: string; mood?: string }
  ) => {
    if (!isLoggedIn || !userInfo?.phone) {
      throw new Error('Vui lòng đăng nhập');
    }

    // Optimistic update: cập nhật UI ngay lập tức
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              // Nếu update size, cần tính lại price
              price: updates.size
                ? (() => {
                    const product = {
                      sizes: item.availableSizes.map(s => ({ sizeName: s.name, price: s.price })),
                      category: item.category
                    };
                    return getProductDisplayInfo(product as any, updates.size).price;
                  })()
                : item.price,
            }
          : item
      )
    );

    // Debounce API call để tránh spam requests
    const existingTimer = updateTimersRef.current.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(async () => {
      try {
        const phoneCustomer = userInfo.phone;
        const payload: any = { ...updates, phoneCustomer };
        await MainApiRequest.put(`/cart/${id}`, payload);
        
        // Chỉ fetch lại cart sau khi update thành công để sync data
        await fetchCart();
      } catch (err) {
        console.error('Update cart item failed', err);
        // Rollback optimistic update nếu API fail
        await fetchCart();
        throw err;
      } finally {
        updateTimersRef.current.delete(id);
      }
    }, 500); // Đợi 500ms sau lần thay đổi cuối cùng mới gọi API

    updateTimersRef.current.set(id, timer);
  };

  const removeItem = async (id: string) => {
    try {
      if (!isLoggedIn || !userInfo?.phone) {
        throw new Error('Vui lòng đăng nhập');
      }

      const phoneCustomer = userInfo.phone;

      const url = `/cart/${id}?phoneCustomer=${encodeURIComponent(phoneCustomer || '')}`;
      await MainApiRequest.delete(url);
      await fetchCart();
    } catch (err) {
      console.error('Remove cart item failed', err);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      if (!isLoggedIn || !userInfo?.phone) {
        setCart([]);
        return;
      }

      const phoneCustomer = userInfo.phone;
      const url = `/cart?phoneCustomer=${encodeURIComponent(phoneCustomer || '')}`;
      await MainApiRequest.delete(url);
      setCart([]);
      await fetchCart();
    } catch (err) {
      console.error('Clear cart failed', err);
      throw err;
    }
  };

  const removeCartItemsAfterOrder = async (
    items: { productId: number | string; size: string; mood?: string }[]
  ) => {
    for (const it of items) {
      const cartItem = cart.find(
        (c) =>
          String(c.productId) === String(it.productId) &&
          c.size === it.size &&
          (c.mood ?? '') === (it.mood ?? '')
      );
      if (cartItem) {
        await removeItem(cartItem.id);
      }
    }
    await fetchCart();
  };

  const getCartBranchId = (): number | null => {
    if (cart.length === 0) return null;
    return cart[0].branchId || null;
  };

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = updateTimersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItems,
        totalPrice,
        fetchCart,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
        removeCartItemsAfterOrder,
        getCartBranchId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};