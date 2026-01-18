import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { MainApiRequest } from '@/services/MainApiRequest';
import { useSystemContext } from './useSystemContext';
import { getProductDisplayInfo } from '@/utils/productSize';

interface RawCartItem {
  id: string;
  productId: string;
  size: string;
  mood?: string;
  quantity: number;
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
  availableSizes: { name: string; price: number }[];
}

interface CartContextValue {
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, size: string, quantity?: number, mood?: string) => Promise<void>;
  updateItem: (
    id: string,
    updates: { quantity?: number; size?: string; mood?: string }
  ) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  removeCartItemsAfterOrder: (
    items: { productId: number | string; size: string; mood?: string }[]
  ) => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { userInfo, isLoggedIn, isInitialized } = useSystemContext();

  const fetchCart = useCallback(async () => {
    try {
      if (!isInitialized || !isLoggedIn || !userInfo?.phone) {
        setCart([]);
        return;
      }

      const phoneCustomer = userInfo.phone;
      const res = await MainApiRequest.get<RawCartItem[]>(
        `/cart?phoneCustomer=${encodeURIComponent(phoneCustomer)}`
      );
      const raw = res.data;

      const enriched: CartItem[] = await Promise.all(
        raw.map(async (ci) => {
          const { data: p } = await MainApiRequest.get<Product>(`/product/${ci.productId}`);
          
          const { price } = getProductDisplayInfo(p as any, ci.size);

          const isCake = p.category === 'Bánh ngọt';

          const availableSizes = isCake
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

          return {
            id: ci.id,
            productId: Number(ci.productId),
            name: p.name,
            image: p.image,
            category: p.category,
            size: ci.size,
            mood: ci.mood,
            quantity: ci.quantity,
            price,
            availableSizes,
          };
        })
      );

      setCart(enriched);
    } catch (err) {
      console.error('Fetch cart failed', err);
    }
  }, [isInitialized, isLoggedIn, userInfo?.phone]);

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  const addToCart = async (
    productId: number,
    size: string,
    quantity: number = 1,
    mood?: string
  ) => {
    if (!isLoggedIn || !userInfo?.phone) {
      throw new Error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
    }

    const productIdNumber = Number(productId);
    const existingItem = cart.find(
      (item) =>
        Number(item.productId) === productIdNumber && item.size === size && item.mood === mood
    );
    if (existingItem) {
      await updateItem(existingItem.id, { quantity: existingItem.quantity + quantity });
      return;
    }

    try {
      const payload = {
        productId: productIdNumber,
        size,
        quantity,
        mood,
        phoneCustomer: userInfo.phone,
      };
      await MainApiRequest.post('/cart', payload);
      await fetchCart();
    } catch (err) {
      console.error('Add to cart failed', err);
      throw err;
      }
  };

  const updateItem = async (
    id: string,
    updates: { quantity?: number; size?: string; mood?: string }
  ) => {
    try {
      if (!isLoggedIn || !userInfo?.phone) {
        throw new Error('Vui lòng đăng nhập');
      }

      const phoneCustomer = userInfo.phone;

      const payload: any = { ...updates, phoneCustomer };
      await MainApiRequest.put(`/cart/${id}`, payload);
      await fetchCart();
    } catch (err) {
      console.error('Update cart item failed', err);
      throw err;
    }
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

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

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