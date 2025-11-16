import React from 'react';
import './SpecialFilter.scss';

export type SpecialOption = 'all' | 'popular' | 'new' | 'discount';

interface SpecialFilterProps {
  selected: SpecialOption;
  onChange: (opt: SpecialOption) => void;
}

const options: { id: SpecialOption; label: string; icon: string }[] = [
  { id: 'popular', label: 'Sản phẩm hot', icon: '🔥' },
  { id: 'new', label: 'Sản phẩm mới', icon: '✨' },
  { id: 'discount', label: 'Đang giảm giá', icon: '💰' },
];

const SpecialFilter: React.FC<SpecialFilterProps> = ({ selected, onChange }) => (
  <div className="special-filter">
    <h4 className="special-filter__title">Đặc biệt</h4>
    <ul className="special-filter__list">
      {options.map((opt) => (
        <li
          key={opt.id}
          className={`special-filter__item ${selected === opt.id ? 'active' : ''}`}
          onClick={() => onChange(opt.id)}
        >
          <span className="icon">{opt.icon}</span>
          <span className="label">{opt.label}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default SpecialFilter;
