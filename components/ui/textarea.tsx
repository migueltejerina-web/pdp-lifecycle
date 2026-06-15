/**
 * Native `<textarea>` with Vistral-aligned visuals.
 *
 * Same rationale as `input.tsx`: avoid design-system Textarea whose `...props`
 * after internal `onBlur`/`onFocus` broke focus state and left the blue halo stuck.
 */

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  error?: boolean
  errorMessage?: string
  label?: string
  helperText?: string
  fullWidth?: boolean
  autoResize?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error,
      errorMessage,
      label,
      helperText,
      fullWidth,
      autoResize,
      disabled,
      id,
      value,
      defaultValue,
      onChange,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const textareaId = id ?? generatedId
    const descriptionId =
      helperText || errorMessage ? `${textareaId}-description` : undefined
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null)

    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        innerRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
      },
      [ref]
    )

    const adjustHeight = React.useCallback(() => {
      const el = innerRef.current
      if (!el || !autoResize) return
      el.style.height = "auto"
      el.style.height = `${el.scrollHeight}px`
    }, [autoResize])

    React.useLayoutEffect(() => {
      adjustHeight()
    }, [adjustHeight, value, defaultValue])

    const baseClassName = cn(
      "w-full min-h-[80px] resize-y rounded-lg border bg-white p-3 text-sm leading-normal text-[#18181b] outline-none transition-[border-color,box-shadow] duration-150",
      "placeholder:text-[#a1a1aa]",
      "disabled:cursor-not-allowed disabled:bg-[#f4f4f5] disabled:text-[#a1a1aa] disabled:border-[#e4e4e7]",
      "dark:bg-[#1a1a1a] dark:text-white dark:placeholder:text-[#a1a1aa]",
      autoResize && "resize-none overflow-hidden",
      error
        ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-[3px] focus-visible:ring-red-500/15"
        : "border-[#D4D4D8] hover:border-[#a1a1aa] dark:border-[#525252] dark:hover:border-[#71717a] focus-visible:border-[#2050F6] focus-visible:ring-[3px] focus-visible:ring-[rgba(32,80,246,0.15)]",
      className
    )

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e)
      if (autoResize) requestAnimationFrame(adjustHeight)
    }

    const field = (
      <textarea
        ref={setRefs}
        id={textareaId}
        disabled={disabled}
        rows={rows}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={baseClassName}
        aria-invalid={error || undefined}
        aria-describedby={descriptionId}
        {...props}
      />
    )

    if (!label && !helperText && !errorMessage) {
      return field
    }

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={textareaId}
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
Textarea.displayName = "Textarea"

export { Textarea }
