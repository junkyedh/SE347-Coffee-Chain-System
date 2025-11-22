import React from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import CardProduct, { Product as ProductType } from '../CardProduct/CardProduct';
import './FeaturedProduct.scss';

interface FeaturedListProps {
  title?: string;
  products: ProductType[];
  onAddToCart?: (productId: number, size: string, quantity: number, mood?: string) => void;
  onProductClick?: (productId: string) => void;
}

const FeaturedList: React.FC<FeaturedListProps> = ({
  title = 'Sản phẩm nổi bật',
  products,
  onAddToCart,
  onProductClick,
}) => {
  const sliderSettings = {
    dots: false,
    infinite: true,
    autoplay: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 1, arrows: false } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false } },
    ],
  };

  const popularProducts = products.filter((p) => p.isPopular);
  const navigate = useNavigate();

  const handleShowMore = () => {
    navigate('/menu');
  };
  console.log('Popular products:', popularProducts);
  return (
    <section className="featured-list">
      <h2 className="featured-title text-center mb-4">{title}</h2>
      <Slider {...sliderSettings}>
        {popularProducts.map((product) => (
          <div key={product.id} className="featured-item">
            <CardProduct
              product={product}
              onAddToCart={(size, quantity, mood) =>
                onAddToCart?.(Number(product.id), size, quantity, mood)
              }
              onProductClick={onProductClick}
            />
          </div>
        ))}
      </Slider>

      <div className="see-more-wrapper text-center">
        <button className="see-more-btn" onClick={handleShowMore}>
          Xem thêm
        </button>
      </div>
    </section>
  );
};

export default FeaturedList;
