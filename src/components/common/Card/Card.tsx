import React from "react"
import { forwardRef } from "react"
import "./Card.scss"
import { cn } from "@/modules/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "flat" | "glass" | "primary" | "accent"
  padding?: "none" | "sm" | "md" | "lg"
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", hover = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "card",
          `card-${variant}`,
          `card-padding-${padding}`,
          {
            "card-hover": hover,
          },
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Card.displayName = "Card"

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("card-header", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h3 ref={ref} className={cn("card-title", className)} {...props} />,
)
CardTitle.displayName = "CardTitle"

const CardSubtitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn("card-subtitle", className)} {...props} />,
)
CardSubtitle.displayName = "CardSubtitle"

const CardBody = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("card-body", className)} {...props} />
))
CardBody.displayName = "CardBody"

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("card-footer", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4", className)} {...props} />
  )
)

export { Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter }
