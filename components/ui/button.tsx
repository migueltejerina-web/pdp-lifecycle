/**
 * Button Component - Wrapper around @vistral/design-system Button
 * 
 * This wrapper maintains backward compatibility with the existing API
 * while using the Vistral Design System Button internally.
 * 
 * Migration note: Gradually migrate to use @vistral/design-system Button directly
 * with the new API (variant: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'destructive-ghost')
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Button as VistralButton, type ButtonProps as VistralButtonProps } from "@vistral/design-system"
import { cn } from "@/lib/utils"

// Map old variant names to new design system variants
type LegacyVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
type LegacySize = "default" | "sm" | "lg" | "icon"

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "variant" | "size"> {
  variant?: LegacyVariant
  size?: LegacySize
  asChild?: boolean
}

const mapVariant = (variant?: LegacyVariant): VistralButtonProps["variant"] => {
  switch (variant) {
    case "default":
      return "primary"
    case "destructive":
      return "destructive"
    case "outline":
      // Outline maps to secondary with border styling via className
      return "secondary"
    case "secondary":
      return "secondary"
    case "ghost":
      return "ghost"
    case "link":
      // Link maps to ghost with underline styling via className
      return "ghost"
    default:
      return "primary"
  }
}

const mapSize = (size?: LegacySize): VistralButtonProps["size"] => {
  switch (size) {
    case "sm":
      return "sm"
    case "lg":
      return "lg"
    case "icon":
      // Icon size maps to md with iconOnly prop
      return "md"
    case "default":
    default:
      return "md"
  }
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    // Handle asChild prop (Slot pattern)
    if (asChild) {
      return (
        <Slot className={className} ref={ref} {...props}>
          {children}
        </Slot>
      )
    }

    // Map legacy props to design system props
    const vistralVariant = mapVariant(variant)
    const vistralSize = mapSize(size)
    const isIconOnly = size === "icon"
    const isLink = variant === "link"
    const isOutline = variant === "outline"

    // Additional className for outline and link variants
    const additionalClasses = cn(
      isOutline && "border border-input bg-background",
      isLink && "underline underline-offset-4",
      className
    )

    return (
      <VistralButton
        ref={ref}
        variant={vistralVariant}
        size={vistralSize}
        iconOnly={isIconOnly}
        className={additionalClasses}
        {...props}
      >
        {children}
      </VistralButton>
    )
  }
)
Button.displayName = "Button"

// Export buttonVariants for backward compatibility (used by alert-dialog.tsx)
export function buttonVariants(options?: { variant?: LegacyVariant; size?: LegacySize }) {
  const variant = options?.variant || "default"
  const size = options?.size || "default"
  
  const variantClasses: Record<string, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  }
  
  const sizeClasses: Record<string, string> = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }
  
  return `inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.default}`
}

export { Button }
