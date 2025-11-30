import React from 'react';
import './SortDropdown.scss';

export type SortOption =
  | 'default'
  | 'name-asc'
  | 'name-desc'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'popular';

interface SortDropdownProps {
  value: SortOption;
  onChange: (opt: SortOption) => void;
}

const options: { id: SortOption; label: string }[] = [
  { id: 'default', label: 'Mặc định' },
  { id: 'name-asc', label: 'Tên A–Z' },
  { id: 'name-desc', label: 'Tên Z–A' },
  { id: 'price-asc', label: 'Giá thấp→cao' },
  { id: 'price-desc', label: 'Giá cao→thấp' },
  { id: 'rating', label: 'Đánh giá cao' },
  { id: 'popular', label: 'Phổ biến nhất' },
];

const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => (
  <div className="sort-dropdown">
    <select
      className="sort-dropdown__select"
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
    >
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default SortDropdown;
