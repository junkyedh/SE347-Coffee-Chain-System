import React from "react";
import "./CategoryFilter.scss";

export interface Category {
  id: string;
  name: string;
  count: number;
  icon?: React.ReactNode;
}

interface CategoryFilterProps {
  categories: Category[];
  selected: string;
  onChange: (id: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selected,
  onChange,
}) => (
  <div className="category-filter">
    <h4 className="category-filter__title">
      Danh mục
      {/* <span className="category-filter__search-icon">
        <FaSearch />
        Danh mục
      </span> */}
    </h4>
    <ul className="category-filter__list">
      {categories.map((cat) => (
        <li
          key={cat.id}
          className={[
            "category-filter__item",
            selected === cat.id ? "active" : "",
          ].join(" ")}
          onClick={() => onChange(cat.id)}
        >
          <span className="icon">{cat.icon}</span>
          <span className="name">{cat.name}</span>
          <span className="count">{cat.count}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default CategoryFilter;
