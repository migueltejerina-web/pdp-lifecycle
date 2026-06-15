import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[var(--vistral-radius-lg)] border border-[var(--vistral-color-border)] bg-[var(--vistral-color-surface)] p-6',
        className,
      )}
      {...rest}
    />
  )
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex items-start justify-between gap-4">{children}</div>
}

export function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-base font-semibold text-[var(--vistral-color-text-primary)]">{children}</h3>
  )
}

export function CardDescription({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1 text-sm text-[var(--vistral-color-text-secondary)]">{children}</p>
  )
}
