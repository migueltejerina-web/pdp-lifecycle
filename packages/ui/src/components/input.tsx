import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...rest }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-[var(--vistral-radius-md)] border border-[var(--vistral-color-border)] bg-[var(--vistral-color-surface)] px-3 py-2 text-sm text-[var(--vistral-color-text-primary)] placeholder:text-[var(--vistral-color-text-muted)] focus:border-[var(--vistral-color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--vistral-color-accent)]/30',
      className,
    )}
    {...rest}
  />
))
Input.displayName = 'Input'
