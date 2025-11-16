import { forwardRef } from "react"
import "./Button.scss"
import { cn } from "@/app/modules/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "ghost" | "link" | "destructive" | "outline"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        className={cn(
          "btn",
          `btn-${variant}`,
          `btn-${size}`,
          {
            "btn-loading": loading,
            "btn-full-width": fullWidth,
            "btn-icon-only": !children && icon,
          },
          className,
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && <div className="btn-spinner" />}
        {!loading && icon && iconPosition === "left" && <span className="btn-icon">{icon}</span>}
        {children && <span className="btn-text">{children}</span>}
        {!loading && icon && iconPosition === "right" && <span className="btn-icon">{icon}</span>}
      </button>
    )
  },
)

Button.displayName = "Button"

export { Button }
