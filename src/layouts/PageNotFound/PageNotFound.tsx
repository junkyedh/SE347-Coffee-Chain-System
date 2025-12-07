import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';
import './PageNotFound.scss';

const PageNotFound: React.FC = () => {
  return (
    <section className="page_404">
      <div className="container">
        <div className="content-wrapper">
          <div className="four_zero_four_bg">
            <h1>404</h1>
          </div>
          <div className="contant_box_404">
            <h3 className="h2">Có vẻ bạn đã lạc đường</h3>
            <p>Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển!</p>
            <Link to={ROUTES.HOME} className="link_404">Về trang chủ</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageNotFound;
