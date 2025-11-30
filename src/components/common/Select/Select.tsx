import React from 'react';
import { forwardRef } from 'react';
import './Select.scss';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/modules/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      fullWidth = false,
      required,
      placeholder,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('select-group', { 'select-full-width': fullWidth })}>
        {label && (
          <label className={cn('select-label', { 'select-label-required': required })}>
            {label}
          </label>
        )}
        <div className="select-wrapper">
          <select
            className={cn(
              'select',
              {
                'select-error': error,
              },
              className
            )}
            ref={ref}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          <ChevronDown className="select-icon" />
        </div>
        {error && <div className="select-error-text">{error}</div>}
        {helperText && !error && <div className="select-helper-text">{helperText}</div>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
