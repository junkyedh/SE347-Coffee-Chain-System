import React from 'react';
import { FaStar } from 'react-icons/fa';
import './ProductRating.scss';

interface ProductRatingProps {
  averageStar: number;
  totalRatings?: number;
  showText?: boolean;
}

const ProductRating: React.FC<ProductRatingProps> = ({
  averageStar,
  totalRatings,
  showText = true,
}) => {
  const fullStars = Math.floor(averageStar);
  return (
    <div className="productRating">
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar key={star} className={`star ${star <= fullStars ? 'filled' : ''}`} />
        ))}
      </div>
      {showText && totalRatings != null && (
        <span className="reviewCount">
          ({averageStar.toFixed(1)} • {totalRatings} đánh giá)
        </span>
      )}
    </div>
  );
};

export default ProductRating;
