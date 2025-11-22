import React from 'react';
import { forwardRef } from 'react';
import './RadioGroup.scss';
import { cn } from '@/modules/utils';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  options: RadioOption[];
  onChange?: (value: string) => void;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  error?: string;
  label?: string;
  required?: boolean;
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      value,
      defaultValue,
      options,
      onChange,
      orientation = 'vertical',
      className,
      error,
      label,
      required,
      ...props
    },
    ref
  ) => {
    const handleChange = (optionValue: string) => {
      onChange?.(optionValue);
    };

    return (
      <div ref={ref} className={cn('radio-group', className)} {...props}>
        {label && (
          <label className={cn('radio-group-label', { 'radio-group-label-required': required })}>
            {label}
          </label>
        )}
        <div className={cn('radio-options', `radio-options-${orientation}`)}>
          {options.map((option) => (
            <div
              key={option.value}
              className={cn('radio-option', {
                'radio-option-selected': value === option.value,
                'radio-option-disabled': option.disabled,
                'radio-option-error': error,
              })}
              onClick={() => !option.disabled && handleChange(option.value)}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                defaultChecked={defaultValue === option.value}
                onChange={() => handleChange(option.value)}
                disabled={option.disabled}
                className="radio-input"
              />
              {option.icon && <div className="radio-icon">{option.icon}</div>}
              <div className="radio-content">
                <div className="radio-label">{option.label}</div>
                {option.description && (
                  <div className="radio-description">{option.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        {error && <div className="radio-group-error">{error}</div>}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export { RadioGroup };
