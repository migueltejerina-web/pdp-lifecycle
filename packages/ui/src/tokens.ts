/**
 * Vistral design tokens — single source of truth for colors, spacing, radii, and type.
 *
 * These values are mirrored in `globals.css` as CSS variables so the design system stays
 * framework-agnostic (Tailwind classes, inline styles, or raw CSS can all consume them).
 */

export const tokens = {
  color: {
    bg: '#0a0a0a',
    surface: '#111113',
    surfaceRaised: '#1a1a1d',
    border: '#27272a',
    textPrimary: '#fafafa',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    accent: '#3b82f6',
    accentForeground: '#ffffff',
    danger: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
  },
  radius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
  },
  font: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    mono: '"SF Mono", Menlo, Monaco, Consolas, monospace',
  },
} as const

export type VistralTokens = typeof tokens
