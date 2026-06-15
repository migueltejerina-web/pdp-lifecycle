import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Standard className merger — clsx + tailwind-merge, reused from the current supply app. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
