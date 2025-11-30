import { cn } from '@/modules/utils';
import React, { forwardRef } from 'react';
import './Textarea.scss';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      fullWidth = false,
      resize = 'vertical',
      required,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('textarea-group', { 'textarea-full-width': fullWidth })}>
        {label && (
          <label className={cn('textarea-label', { 'textarea-label-required': required })}>
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'textarea',
            `textarea-resize-${resize}`,
            {
              'textarea-error': error,
            },
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <div className="textarea-error-text">{error}</div>}
        {helperText && !error && <div className="textarea-helper-text">{helperText}</div>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
