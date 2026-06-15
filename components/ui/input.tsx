/**
 * Native `<input>` with Vistral-aligned visuals.
 *
 * We intentionally do NOT use @vistral/design-system Input here: that component
 * spread `...props` after internal `onBlur`/`onFocus`, so consumer `onBlur`
 * replaced the internal handler and `isFocused` never cleared — the blue focus
 * halo (box-shadow) stayed visible after blur.
 */

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const sizeStyles = {
  sm: { box: "h-8 text-[13px]", icon: 16, padL: "pl-9", padR: "pr-9" },
  md: { box: "h-10 text-sm", icon: 18, padL: "pl-10", padR: "pr-10" },
  lg: { box: "h-12 text-base", icon: 20, padL: "pl-11", padR: "pr-11" },
} as const

export type InputSize = keyof typeof sizeStyles

export interface InputProps extends Omit<React.ComponentProps<"input">, "size"> {
  size?: InputSize
  error?: boolean
  errorMessage?: string
  label?: string
  helperText?: string
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  fullWidth?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      size = "md",
      error,
      errorMessage,
      label,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      fullWidth,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const descriptionId =
      helperText || errorMessage ? `${inputId}-description` : undefined
    const tokens = sizeStyles[size]

    const inputClassName = cn(
      "w-full rounded-lg border bg-white text-[#18181b] outline-none ring-0 transition-[border-color,box-shadow] duration-150",
      "focus:outline-none focus-visible:outline-none",
      "placeholder:text-[#a1a1aa]",
      "disabled:cursor-not-allowed disabled:bg-[#f4f4f5] disabled:text-[#a1a1aa] disabled:border-[#e4e4e7]",
      "dark:bg-[#1a1a1a] dark:text-white dark:placeholder:text-[#a1a1aa]",
      "px-3",
      tokens.box,
      LeftIcon && tokens.padL,
      RightIcon && tokens.padR,
      error
        ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-[3px] focus-visible:ring-red-500/15"
        : "border-[#D4D4D8] hover:border-[#a1a1aa] dark:border-[#525252] dark:hover:border-[#71717a] focus-visible:border-[#2050F6] focus-visible:ring-[3px] focus-visible:ring-[rgba(32,80,246,0.15)]",
      className
    )

    const field = (
      <div className={cn("relative flex w-full items-center", fullWidth && "w-full")}>
        {LeftIcon && (
          <span
            className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-[#71717a] dark:text-[#a1a1aa]"
            aria-hidden
          >
            <LeftIcon size={tokens.icon} />
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={inputClassName}
          aria-invalid={error || undefined}
          aria-describedby={descriptionId}
          {...props}
        />
        {RightIcon && (
          <span
            className="pointer-events-none absolute right-3 top-1/2 z-[1] -translate-y-1/2 text-[#71717a] dark:text-[#a1a1aa]"
            aria-hidden
          >
            <RightIcon size={tokens.icon} />
          </span>
        )}
      </div>
    )

    if (!label && !helperText && !errorMessage) {
      return field
    }

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#18181b] dark:text-[#fafafa]"
          >
            {label}
          </label>
        )}
        {field}
        {(helperText || errorMessage) && (
          <p
            id={descriptionId}
            className={cn(
              "text-[13px] leading-snug",
              error && errorMessage
                ? "text-red-500"
                : "text-[#71717a] dark:text-[#a1a1aa]"
            )}
          >
            {error && errorMessage ? errorMessage : helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
