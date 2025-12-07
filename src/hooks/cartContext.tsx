import React, { createContext, useContext, useEffect, useState } from 'react'
import { MainApiRequest } from '@/services/MainApiRequest'

interface RawCartItem {
  id: string
  productId: string
  size: string
  mood?: string
  quantity: number
}
interface ProductMaterial {
  name: string
}

interface ProductSize {
  sizeName: string
  price: number
}
interface Product {
  id: string
  name: string
  category: string
  description?: ProductMaterial[]
  image: string
  available: boolean
  hot: boolean
  cold: boolean
  isPopular: boolean
  isNew: boolean
  sizes: ProductSize[]
  material: {name:string}[];
}

export interface CartItem {
  id: string
  productId: number
  name: string
  image: string
  category: string
  price: number
  quantity: number
  size: string
  mood?: string
  availableSizes: { name: string; price: number }[]
}

interface CartContextValue {
  cart: CartItem[]
  totalItems: number
  totalPrice: number
  fetchCart: () => Promise<void>
  addToCart: (
    productId: number ,
    size: string,
    quantity?: number,
    mood?: string,
  ) => Promise<void>
  updateItem: (
    id: string,
    updates: { quantity?: number; size?: string; mood?: string }
  ) => Promise<void>
  removeItem: (id: string) => Promise<void>
  clearCart: () => Promise<void>
  removeCartItemsAfterOrder: (items: { productId: number|string; size: string; mood?: string }[]) => Promise<void>
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([])

  const fetchCart = async () => {
    try {
      // Chỉ lấy giỏ hàng khi người dùng đã đăng nhập
      let query = '';
      try {
        const auth = await MainApiRequest.get<{ data: { phoneCustomer?: string; phone?: string}}>('/auth/callback')
        const phoneCustomer = auth.data.data.phoneCustomer || auth.data.data.phone
        if (phoneCustomer) {
          query = `?phoneCustomer=${encodeURIComponent(phoneCustomer)}`
        } else {
          // Nếu không có phone thì không fetch giỏ hàng
          console.log('[CartContext] No phone found, clearing cart')
          setCart([]);
          return;
        }
      } catch {
        // Nếu chưa đăng nhập thì không fetch giỏ hàng
        console.log('[CartContext] Not logged in, clearing cart')
        setCart([]);
        return;
      }
      
      console.log('[CartContext] Fetching cart with query:', query)
      const res = await MainApiRequest.get<RawCartItem[]>(`/cart${query}`)
      const raw = res.data
      console.log('[CartContext] Raw cart data:', raw)

      const enriched: CartItem[] = await Promise.all(
        raw.map(async (ci) => {
          const {data: p} = await MainApiRequest.get<Product>(`/product/${ci.productId}`)
          const isCake = p.category === 'Bánh ngọt'
          
          // Tìm size tương ứng trong danh sách sizes
          let price: number
          
          if (isCake) {
            // Với bánh ngọt:
            // - piece: giá gốc từ backend (1 miếng)
            // - whole: giá gốc × 8 (cả bánh = 8 miếng)
            if (ci.size === 'whole') {
              const piecePrice = p.sizes.find((s) => s.sizeName === 'piece')?.price || p.sizes[0]?.price || 0
              price = piecePrice * 8
            } else if (ci.size === 'piece') {
              price = p.sizes.find((s) => s.sizeName === 'piece')?.price || p.sizes[0]?.price || 0
            } else {
              // Fallback cho các size khác
              const sz = p.sizes.find((s) => s.sizeName === ci.size)
              price = sz?.price || p.sizes[0]?.price || 0
            }
          } else {
            // Với đồ uống và sản phẩm khác: lấy giá theo size
            const sz = p.sizes.find((s) => s.sizeName === ci.size)
            price = sz?.price || p.sizes[0]?.price || 0
          }

          // Tạo danh sách available sizes phù hợp
          const availableSizes = isCake
            ? [
                { name: 'piece', price: p.sizes.find((s) => s.sizeName === 'piece')?.price || p.sizes[0]?.price || 0 },
                { name: 'whole', price: (p.sizes.find((s) => s.sizeName === 'piece')?.price || p.sizes[0]?.price || 0) * 8 }
              ]
            : p.sizes.filter((s) => s.sizeName !== 'whole').map((s) => ({ name: s.sizeName, price: s.price }))

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
          }
        })
      )

      setCart(enriched)
      console.log('[CartContext] Cart updated, total items:', enriched.length)
    } catch (err) {
      console.error('Fetch cart failed', err)
    }
  }
  const addToCart = async (
    productId: number,
    size: string,
    quantity: number = 1,
    mood?: string
  ) => {
    // Kiểm tra đăng nhập trước
    let phoneCustomer: string | undefined;
    try {
      const auth = await MainApiRequest.get<{ data: {phone: string}}>('/auth/callback')
      phoneCustomer = auth.data.data.phone
      if (!phoneCustomer) {
        throw new Error('Chưa đăng nhập');
      }
    } catch {
      throw new Error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
    }

    console.log('[CartContext] Current cart before adding:', cart.length, 'items')
    
    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const productIdNumber = Number(productId)
    const existingItem = cart.find(
      (item) => Number(item.productId) === productIdNumber && item.size === size && item.mood === mood
    )
    if (existingItem) {
      console.log('[CartContext] Item exists, updating quantity...')
      // Nếu đã có, chỉ cần cập nhật số lượng
      await updateItem(existingItem.id, { quantity: existingItem.quantity + quantity })
      return
    }
    // Nếu chưa có, thêm mới
    const payload: any = { 
      productId: productIdNumber, 
      size,
      mood,
      quantity,
      phoneCustomer,
    }
    
    console.log('[CartContext] Adding to cart:', payload)
    const response = await MainApiRequest.post('/cart', payload)
      .catch((err) => {
        console.error('Add to cart failed', err.response?.data || err)
        throw err
      })
    console.log('[CartContext] Add to cart response:', response.data)
    console.log('[CartContext] Item added, fetching cart...')
    await fetchCart()
    console.log('[CartContext] Cart fetched after adding, new count:', cart.length)
  }

  // Cập nhật sản phẩm trong giỏ hàng
  const updateItem = async (
    id: string,
    updates: { quantity?: number; size?: string; mood?: string }
  ) => {
    try {
      let phoneCustomer: string | undefined;
      try {
        const auth = await MainApiRequest.get<{ data: {phoneCustomer?: string; phone?: string}}>('/auth/callback')
        phoneCustomer = auth.data.data.phoneCustomer || auth.data.data.phone
      } catch {
        throw new Error('Vui lòng đăng nhập');
      }
      
      console.log('[CartContext] Updating item:', id, 'with updates:', updates)
      const payload: any = { ...updates, phoneCustomer }
      await MainApiRequest.put(`/cart/${id}`, payload)
      console.log('[CartContext] Item updated, fetching cart...')
      await fetchCart()
      console.log('[CartContext] Cart refreshed after update')
    } catch (err) {
      console.error('Update cart item failed', err)
      throw err
    }
  }

  // Xóa sản phẩm khỏi giỏ hàng
  const removeItem = async (id: string) => {
    try {
      let phoneCustomer: string | undefined;
      try {
        const auth = await MainApiRequest.get<{ data: {phoneCustomer?: string; phone?: string}}>('/auth/callback')
        phoneCustomer = auth.data.data.phoneCustomer || auth.data.data.phone
      } catch {
        throw new Error('Vui lòng đăng nhập');
      }
      
      const url = `/cart/${id}?phoneCustomer=${encodeURIComponent(phoneCustomer || '')}`
      await MainApiRequest.delete(url)
      await fetchCart()
    } catch (err) {
      console.error('Remove cart item failed', err)
      throw err
    }
  }

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    try {
      let phoneCustomer: string | undefined;
      try {
        const auth = await MainApiRequest.get<{ data: {phoneCustomer?: string; phone?: string}}>('/auth/callback')
        phoneCustomer = auth.data.data.phoneCustomer || auth.data.data.phone
      } catch {
        setCart([]);
        return;
      }
      
      const url = `/cart?phoneCustomer=${encodeURIComponent(phoneCustomer || '')}`;
      await MainApiRequest.delete(url)
      setCart([])
      await fetchCart()
    } catch (err) {
      console.error('Clear cart failed', err)
      throw err
    }
  }

  const removeCartItemsAfterOrder = async (items: { productId: number|string; size: string; mood?: string }[]) => {
    for (const it of items) {
      const cartItem = cart.find(
        c =>
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
    fetchCart()
  }, []) 

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ cart, totalItems, totalPrice, fetchCart, addToCart, updateItem, removeItem, clearCart, removeCartItemsAfterOrder }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
