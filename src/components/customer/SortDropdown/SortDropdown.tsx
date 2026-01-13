import React, { useEffect, useRef, useState } from 'react';
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
  { id: 'price-asc', label: 'Giá thấp → cao' },
  { id: 'price-desc', label: 'Giá cao → thấp' },
  { id: 'rating', label: 'Đánh giá cao' },
  { id: 'popular', label: 'Phổ biến nhất' },
];

const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = options.find((o) => o.id === value);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="sort-dropdown" ref={ref}>
      <button
        type="button"
        className={`sort-dropdown__trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{current?.label}</span>
        <i className="sort-dropdown__arrow" />
      </button>

      {open && (
        <ul className="sort-dropdown__menu">
          {options.map((opt) => (
            <li
              key={opt.id}
              className={`sort-dropdown__item ${
                opt.id === value ? 'is-active' : ''
              }`}
              onClick={() => {
                onChange(opt.id);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SortDropdown;
