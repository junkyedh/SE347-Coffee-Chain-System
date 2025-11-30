import React from 'react';
import './PriceFilter.scss';

export type PriceOption = 'all' | 'under-30k' | '30k-50k' | 'over-50k';

interface PriceFilterProps {
  selected: PriceOption;
  onChange: (opt: PriceOption) => void;
}

const OPTIONS: { id: PriceOption; label: string; icon: string }[] = [
  { id: 'all', label: 'Tất cả', icon: '💎' },
  { id: 'under-30k', label: 'Dưới 30.000₫', icon: '🌸' },
  { id: '30k-50k', label: '30.000₫–50.000₫', icon: '🌺' },
  { id: 'over-50k', label: 'Trên 50.000₫', icon: '🌹' },
];

const PriceFilter: React.FC<PriceFilterProps> = ({ selected, onChange }) => (
  <div className="price-filter">
    <h4 className="price-filter__title">Khoảng giá</h4>
    <ul className="price-filter__list">
      {OPTIONS.map((opt) => (
        <li
          key={opt.id}
          className={['price-filter__item', selected === opt.id ? 'active' : ''].join(' ')}
          onClick={() => onChange(opt.id)}
        >
          <span className="icon">{opt.icon}</span>
          <span className="label">{opt.label}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default PriceFilter;
