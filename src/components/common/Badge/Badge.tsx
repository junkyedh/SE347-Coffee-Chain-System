import React from "react"
import "./Badge.scss"
import { cn } from "@/modules/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "secondary" | "accent" | "success" | "warning" | "error" | "outline"
  size?: "sm" | "md" | "lg"
  dot?: boolean
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", size = "md", dot, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "badge",
          `badge--${variant}`,
          `badge--${size}`,
          {
            "badge--dot": dot,
          },
          className,
        )}
        {...props}
      >
        {dot && <span className="badge__dot" />}
        {children}
      </div>
    )
  },
)

Badge.displayName = "Badge"

export { Badge }
