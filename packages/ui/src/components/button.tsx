import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-[var(--vistral-color-accent)] text-[var(--vistral-color-accent-foreground)] hover:opacity-90',
  secondary:
    'bg-[var(--vistral-color-surface-raised)] text-[var(--vistral-color-text-primary)] border border-[var(--vistral-color-border)] hover:bg-[var(--vistral-color-surface)]',
  ghost:
    'bg-transparent text-[var(--vistral-color-text-primary)] hover:bg-[var(--vistral-color-surface-raised)]',
  danger: 'bg-[var(--vistral-color-danger)] text-white hover:opacity-90',
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--vistral-radius-md)] font-medium transition disabled:opacity-50 disabled:pointer-events-none',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    />
  ),
)
Button.displayName = 'Button'
