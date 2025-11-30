import Banner from '@/components/customer/Banner/Banner';
import CategoryShowcase from '@/components/customer/Category/CategoryShowcase';
import FeaturedList from '@/components/customer/FeaturedProduct/FeaturedProduct';
import Features from '@/components/customer/Features/Features';
import Gallery from '@/components/customer/Gallery/Gallery';
import { useCart } from '@/hooks/cartContext';
import useProducts from '@/hooks/useProducts';
import { message } from 'antd';
import { Col, Container, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import './HomePage.scss';

const Home = () => {
  const navigate = useNavigate();
  const { products: productList } = useProducts();
  const { addToCart } = useCart();

  const handleAddToCart = async (
    productId: number,
    size: string,
    quantity: number = 1,
    mood?: string
  ) => {
    try {
      await addToCart(productId, size, quantity, mood);
      message.success('Thêm vào giỏ hàng thành công!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      message.error('Không thể thêm vào giỏ hàng. Vui lòng thử lại sau.');
    }
  };

  const handleProductClick = (productId: string) => {
    console.log(`Navigate to product detail: ${productId}`);
    navigate(`/product/${productId}`);
  };

  return (
    <>
      <Banner />
      <Features />
      <CategoryShowcase />

      <section className="popular section-spacing">
        <Container>
          <Row>
            <Col md={12} className="product-slider">
              <FeaturedList
                products={productList}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
              />
            </Col>
          </Row>
        </Container>

        <Gallery />
        <section className="call_us section-spacing">
          <Container>
            <Row className="align-items-center">
              <Col sx={12} md={4} className="text-center mt-3 mt-md-0">
                <Link to="/contact-us" className="secondary_btn bounce">
                  Liên hệ với chúng tôi!
                </Link>
              </Col>
              <Col sx={12} md="8">
                <h2 className="heading">
                  SẴN SÀNG VỚI TRẢI NGHIỆM TUYỆT VỜI TẠI CỬA HÀNG CHÚNG TÔI?
                </h2>
                <p className="text">
                  Thưởng thức các loại thức uống thơm ngon và bánh ngọt hấp dẫn trong không gian ấm
                  cúng tại cửa hàng của chúng tôi. Đội ngũ thân thiện và thực đơn đa dạng luôn sẵn
                  sàng phục vụ bạn mỗi ngày!
                </p>
              </Col>
            </Row>
          </Container>
          <div className="overlay px-5"></div>
        </section>
      </section>
    </>
  );
};

export default Home;
