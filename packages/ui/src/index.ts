/**
 * @vistral/ui — thin design-system primitives used by apps spawned under app/(apps)/<slug>.
 *
 * This package intentionally stays small. Do NOT port the entire current supply component library
 * in here. The goal is: a new PM spawning an app gets a consistent look for buttons, inputs, cards
 * and text. Anything richer goes in the app itself or lands here once it has proven reusable.
 */

export * from './tokens'
export * from './utils/cn'
export * from './components/button'
export * from './components/card'
export * from './components/input'
export * from './components/empty-state'
