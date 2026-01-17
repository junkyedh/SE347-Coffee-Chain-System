interface ProductSize {
  sizeName: string;
  price: number;
}

export interface ProductLike {
  category: string;
  sizes: ProductSize[];
}

/**
 * Hàm helper tính giá và tên hiển thị cho sản phẩm
 * Xử lý logic đặc biệt cho Bánh ngọt (whole/piece)
 */
export const getProductDisplayInfo = (product: ProductLike | undefined, sizeName: string) => {
  // Giá trị mặc định nếu không tìm thấy sản phẩm
  if (!product) {
    return { 
      price: 0, 
      displaySize: sizeName,
      isValid: false 
    };
  }

  const isCake = product.category === 'Bánh ngọt';
  let price = 0;
  let displaySize = sizeName;

  // Logic tính giá
  if (isCake) {
    // Tìm giá của 1 miếng (piece) để làm cơ sở
    const pieceSize = product.sizes.find(s => s.sizeName === 'piece') || product.sizes[0];
    const basePrice = pieceSize ? pieceSize.price : 0;

    if (sizeName === 'whole') {
      price = basePrice * 8; // Quy ước: Nguyên ổ = 8 miếng
      displaySize = 'Nguyên ổ';
    } else if (sizeName === 'piece') {
      price = basePrice;
      displaySize = '1 Miếng';
    } else {
      // Fallback
      const size = product.sizes.find(s => s.sizeName === sizeName);
      price = size ? size.price : basePrice;
    }
  } else {
    // Logic cho đồ uống (S, M, L)
    const size = product.sizes.find(s => s.sizeName === sizeName);
    price = size ? size.price : 0;
    
    displaySize = sizeName; 
  }

  return {
    price,
    displaySize,
    isValid: true
  };
};