import img6 from '@/assets/bread5.jpg';
import img1 from '@/assets/coffee4.jpg';
import img3 from '@/assets/cup32.jpg';
import img4 from '@/assets/juice13.jpg';
import img5 from '@/assets/tea1.jpg';
import img2 from '@/assets/tea2.jpg';
import { MainApiRequest } from '@/services/MainApiRequest';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoryShowcase.scss';

interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  keyWords: string[];
}

interface Product {
  category: string;
}

const CATEGORY_CONFIG: Category[] = [
  {
    id: 'coffee',
    name: 'Cà phê',
    description: 'Hương vị đậm đà truyền thống',
    image: img1,
    keyWords: ['Cà phê'],
  },
  {
    id: 'tea',
    name: 'Trà trái cây',
    description: 'Thanh mát và thơm ngon',
    image: img2,
    keyWords: ['Trà trái cây'],
  },
  {
    id: 'milk-tea',
    name: 'Trà sữa',
    description: 'Ngọt ngào, béo ngậy',
    image: img3,
    keyWords: ['Trà sữa', 'Trà sữa trân châu'],
  },
  {
    id: 'juice',
    name: 'Nước ép',
    description: 'Giải khát, tươi mát',
    image: img4,
    keyWords: ['Nước ép'],
  },
  {
    id: 'Smoothie',
    name: 'Sinh tố',
    description: 'Thơm ngon, bổ dưỡng',
    image: img5,
    keyWords: ['Sinh tố'],
  },
  {
    id: 'cake',
    name: 'Bánh ngọt',
    description: 'Ngọt ngào mọi lúc',
    image: img6,
    keyWords: ['Bánh ngọt'],
  },
];

const CategoryShowcase: React.FC = () => {
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await MainApiRequest.get('/product/list');
        const data: Product[] = res.data;

        const counts: Record<string, number> = {};
        for (const cat of CATEGORY_CONFIG) {
          counts[cat.id] = data.filter((p) => cat.keyWords.includes(p.category.trim())).length;
        }
        setProductCounts(counts);
      } catch (error) {
        console.error('Failed to fetch product list', error);
      }
    };

    fetchCounts();
  }, []);

  return (
    <section className="category-section">
      <div className="category-header">
        <h2>Danh mục sản phẩm</h2>
      </div>

      <div className="category-grid">
        {CATEGORY_CONFIG.map((category) => (
          <div
            key={category.id}
            className="category-card"
            onClick={() => navigate(`/thuc-don?category=${encodeURIComponent(category.keyWords[0])}`)}
          >
            <div className="category-image-wrapper">
              <img src={category.image} alt={category.name} />
              <div className="overlay" />
              <div className="category-text">
                <h3>{category.name}</h3>
                <p>{productCounts[category.id] || 0} món</p>
              </div>
            </div>
            <div className="category-description">
              <p>{category.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryShowcase;
