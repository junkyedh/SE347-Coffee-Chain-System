export interface Coupon {
  code: string;
  status?: string;
  promote: {
    promoteType: string; // 'Phần trăm' | 'Cố định'
    discount: number;
    name?: string;
  };
}

interface CalculationParams {
  subtotal: number;
  deliveryFee?: number;
  coupon?: Coupon | null;
  membershipRank?: string; // 'Kim cương', 'Vàng', 'Bạc', 'Đồng'
}

export const calculateOrderTotal = ({
  subtotal,
  deliveryFee = 0,
  coupon = null,
  membershipRank = '',
}: CalculationParams) => {
  // 1. Tổng tiền cơ sở (bao gồm ship nếu có)
  const totalBeforeDiscount = subtotal + deliveryFee;

  // 2. Tính giảm giá từ Coupon
  let couponDiscount = 0;
  if (coupon) {
    if (coupon.promote.promoteType === 'Phần trăm') {
      couponDiscount = Math.floor(totalBeforeDiscount * (coupon.promote.discount / 100));
    } else {
      couponDiscount = coupon.promote.discount;
    }
    // Coupon không được giảm quá tổng tiền (tối thiểu đơn hàng còn 1000đ)
    couponDiscount = Math.min(couponDiscount, Math.max(0, totalBeforeDiscount - 1000));
  }

  // 3. Tính tiền sau khi trừ Coupon
  const totalAfterCoupon = totalBeforeDiscount - couponDiscount;

  // 4. Tính giảm giá Membership
  // QUY TẮC BUSINESS: Chỉ tính nếu KHÔNG có Coupon
  let membershipDiscount = 0;
  let isMembershipSkipped = false;

  if (coupon) {
    // Nếu có coupon, bỏ qua membership discount (nhưng vẫn đánh dấu là skipped nếu user có rank)
    if (membershipRank) isMembershipSkipped = true;
  } else if (membershipRank) {
    switch (membershipRank) {
      case 'Kim cương':
        membershipDiscount = Math.floor(totalAfterCoupon * 0.1); // 10%
        break;
      case 'Vàng':
        membershipDiscount = Math.min(Math.floor(totalAfterCoupon * 0.07), 10000); // 7%, max 10k
        break;
      case 'Bạc':
        membershipDiscount = Math.min(Math.floor(totalAfterCoupon * 0.05), 10000); // 5%, max 10k
        break;
      case 'Đồng':
        membershipDiscount = Math.min(Math.floor(totalAfterCoupon * 0.03), 10000); // 3%, max 10k
        break;
      default:
        membershipDiscount = 0;
    }
  }

  const totalDiscount = couponDiscount + membershipDiscount;
  const finalTotal = Math.max(1000, totalBeforeDiscount - totalDiscount);

  return {
    subtotal,
    deliveryFee,
    totalBeforeDiscount,
    couponDiscount,
    membershipDiscount,
    totalDiscount,
    finalTotal,
    isMembershipSkipped, 
  };
};