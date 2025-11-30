import React from 'react';
import { forwardRef, useState } from 'react';
import './Search.scss';
import { SearchIcon, X } from 'lucide-react';
import { Button } from '../Button/Button';
import { cn } from '@/modules/utils';

export interface SearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onSearch?: (value: string) => void;
  onChange?: (value: string) => void;
  onClear?: () => void;
  showClearButton?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const Search = forwardRef<HTMLInputElement, SearchProps>(
  (
    {
      className,
      onSearch,
      onChange,
      onClear,
      showClearButton = true,
      loading = false,
      fullWidth = false,
      placeholder = 'Tìm kiếm...',
      value: controlledValue,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState('');
    const value = controlledValue !== undefined ? controlledValue : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSearch?.(value as string);
      }
    };

    const handleClear = () => {
      if (controlledValue === undefined) {
        setInternalValue('');
      }
      onChange?.('');
      onClear?.();
    };

    const handleSearchClick = () => {
      onSearch?.(value as string);
    };

    return (
      <div className={cn('search-wrapper', { 'search-full-width': fullWidth })}>
        <div className="search-input-wrapper">
          <SearchIcon className="search-icon" />
          <input
            ref={ref}
            type="text"
            className={cn('search-input', className)}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            {...props}
          />
          {showClearButton && value && (
            <Button
              variant="ghost"
              size="sm"
              icon={<X />}
              onClick={handleClear}
              className="search-clear"
              aria-label="Clear search"
            />
          )}
        </div>
        {onSearch && (
          <Button
            variant="primary"
            size="md"
            onClick={handleSearchClick}
            loading={loading}
            className="search-button"
          >
            Tìm kiếm
          </Button>
        )}
      </div>
    );
  }
);

Search.displayName = 'Search';

export { Search };
