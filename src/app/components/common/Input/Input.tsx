import React from "react"
import { forwardRef } from "react"
import "./Input.scss"
import { cn } from "@/modules/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = "text", label, error, helperText, leftIcon, rightIcon, fullWidth = false, required, ...props },
    ref,
  ) => {
    return (
      <div className={cn("input-group", { "input-full-width": fullWidth })}>
        {label && <label className={cn("input-label", { "input-label-required": required })}>{label}</label>}
        <div className="input-wrapper">
          {leftIcon && <div className="input-icon input-icon-left">{leftIcon}</div>}
          <input
            type={type}
            className={cn(
              "input",
              {
                "input-error": error,
                "input-with-left-icon": leftIcon,
                "input-with-right-icon": rightIcon,
              },
              className,
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && <div className="input-icon input-icon-right">{rightIcon}</div>}
        </div>
        {error && <div className="input-error-text">{error}</div>}
        {helperText && !error && <div className="input-helper-text">{helperText}</div>}
      </div>
    )
  },
)

Input.displayName = "Input"

export { Input }
