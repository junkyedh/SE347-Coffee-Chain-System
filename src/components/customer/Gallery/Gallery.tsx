import GalleryImg3 from '@/assets/bread9.jpg';
import cafeImg1 from '@/assets/coffee4.jpg';
import GalleryImg5 from '@/assets/cup15.jpg';
import GalleryImg6 from '@/assets/cup29.jpg';
import GalleryImg1 from '@/assets/cup32.jpg';
import cafeImg5 from '@/assets/img1.jpg';
import cafeImg4 from '@/assets/img11.jpg';
import cafeImg3 from '@/assets/juice7.jpg';
import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';

import { Card, Col, Row } from 'react-bootstrap';
import './Gallery.scss';

const Gallery = () => {
  const images = [
    {
      src: GalleryImg1,
      desc: 'Trà sữa trân châu thơm béo',
      sub: 'Trà Sữa Trân Châu',
    },
    {
      src: GalleryImg3,
      desc: 'Bánh socola mềm mịn',
      sub: 'Bánh Socola',
    },
    {
      src: GalleryImg5,
      desc: 'Sinh tố dâu tươi mát',
      sub: 'Sinh Tố Dâu',
    },
    {
      src: GalleryImg6,
      desc: 'Trà đào cam sả thanh mát',
      sub: 'Trà Đào Cam Sả',
    },
  ];

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Lightbox slides={images} open={isOpen} close={() => setIsOpen(false)} />

      <Row className="section-spacing pt-5">
        <Col md="4" className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Img src={cafeImg3} alt="Không gian 1" className="rounded img-fluid" />
          </Card>
        </Col>
        <Col md="4" className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Img src={cafeImg1} alt="Không gian 2" className="rounded img-fluid" />
          </Card>
        </Col>
        <Col md="4" className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Img src={cafeImg5} alt="Không gian 3" className="rounded img-fluid" />
          </Card>
        </Col>
        <Col md="12">
          <Card className="border-0">
            <Card.Img src={cafeImg4} alt="view" className="rounded" />
          </Card>
        </Col>
      </Row>
      <div className="gallery">
        {images.map((image, index) => (
          <div key={index} className="gallery-item">
            <img
              src={image.src}
              alt={image.desc || 'Gallery Image'}
              onClick={() => setIsOpen(true)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
