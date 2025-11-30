import React from 'react';
import './Searchbar.scss';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder }) => (
  <div className="search-bar">
    <input
      type="text"
      className="search-bar__input"
      value={value}
      placeholder={placeholder || 'Tìm kiếm...'}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default SearchBar;
