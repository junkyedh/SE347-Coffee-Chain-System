/**
 * Chuyển đổi tên sản phẩm thành slug thân thiện với SEO
 * Ví dụ: "Cà Phê Sữa Đá" -> "ca-phe-sua-da"
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD') // Chuẩn hóa Unicode
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
    .replace(/đ/g, 'd') // Chuyển đ thành d
    .replace(/Đ/g, 'D') // Chuyển Đ thành D
    .replace(/[^a-z0-9\s-]/g, '') // Xóa ký tự đặc biệt
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng -
    .replace(/-+/g, '-') // Xóa dấu - trùng lặp
    .replace(/^-+|-+$/g, ''); // Xóa dấu - ở đầu/cuối
};

/**
 * Format: /san-pham/p{id}-{slug}
 * ID ở đầu giúp routing nhanh hơn, slug sau giúp SEO tốt hơn
 */
export const createProductUrl = (name: string, id: string | number): string => {
  const slug = slugify(name);
  return `/san-pham/p${id}-${slug}`;
};

/**
 * Format: /thuc-don/{category-slug}
 */
export const createCategoryUrl = (categoryName: string): string => {
  const slug = slugify(categoryName);
  return `/thuc-don/${slug}`;
};

export const extractIdFromSlug = (slug: string): string => {
  const match = slug.match(/^p(\d+)-/);
  return match ? match[1] : slug.split('-')[0].replace('p', '');
};

/**
 * Format: /theo-doi-don-hang/dh{id}-tracking
 */
export const createOrderTrackingUrl = (id: string | number): string => {
  return `/theo-doi-don-hang/dh${id}-tracking`;
};

/**
 * Format: /danh-gia/dh{orderId}-review
 */
export const createFeedbackUrl = (orderId: string | number): string => {
  return `/danh-gia/dh${orderId}-review`;
};

/**
 */
export const extractOrderIdFromSlug = (slug: string): string => {
  const match = slug.match(/^dh(\d+)-/);
  return match ? match[1] : slug.split('-')[0].replace('dh', '');
};
