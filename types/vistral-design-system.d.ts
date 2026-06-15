/**
 * Type declarations for @vistral/design-system
 * This file provides type definitions for the vistral-design-system package
 */

declare module '@vistral/design-system' {
  import { 
    ComponentType, 
    ReactNode, 
    HTMLAttributes, 
    InputHTMLAttributes, 
    ButtonHTMLAttributes, 
    TextareaHTMLAttributes,
    Ref,
    ChangeEvent,
    FocusEvent,
    KeyboardEvent,
    ForwardRefExoticComponent,
    RefAttributes,
  } from 'react';

  // ─── SearchInput ───────────────────────────────────────
  export interface SearchInputProps {
    placeholder?: string;
    value?: string;
    onChange?: ((value: string) => void) | ((e: ChangeEvent<HTMLInputElement>) => void);
    className?: string;
    fullWidth?: boolean;
    size?: 'sm' | 'md' | 'lg' | string | number;
    rounded?: boolean;
    clearable?: boolean;
    disabled?: boolean;
    id?: string;
    name?: string;
    autoFocus?: boolean;
    onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
    [key: string]: any;
  }

  // ─── Button ────────────────────────────────────────────
  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'destructive-ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    iconOnly?: boolean;
    children?: ReactNode;
    className?: string;
    ref?: Ref<HTMLButtonElement>;
  }

  // ─── Select ────────────────────────────────────────────
  export interface SelectProps {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    onOpenChange?: (open: boolean) => void;
    open?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    name?: string;
    required?: boolean;
    dir?: 'ltr' | 'rtl';
    children?: ReactNode;
    className?: string;
  }

  export interface SelectGroupProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
  }

  export interface SelectValueProps extends HTMLAttributes<HTMLSpanElement> {
    placeholder?: string;
  }

  export interface SelectTriggerProps extends HTMLAttributes<HTMLButtonElement> {
    children?: ReactNode;
    className?: string;
    disabled?: boolean;
    asChild?: boolean;
    ref?: Ref<HTMLButtonElement>;
  }

  export interface SelectContentProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
    className?: string;
    position?: 'item-aligned' | 'popper';
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
    align?: 'start' | 'center' | 'end';
    alignOffset?: number;
    collisionPadding?: number | { top?: number; right?: number; bottom?: number; left?: number };
    sticky?: 'always' | 'partial' | 'never';
    ref?: Ref<HTMLDivElement>;
  }

  export interface SelectLabelProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
  }

  export interface SelectItemProps extends HTMLAttributes<HTMLDivElement> {
    value: string;
    children?: ReactNode;
    disabled?: boolean;
    textValue?: string;
    ref?: Ref<HTMLDivElement>;
  }

  export interface SelectSeparatorProps extends HTMLAttributes<HTMLDivElement> {}
  export interface SelectScrollUpButtonProps extends HTMLAttributes<HTMLDivElement> {}
  export interface SelectScrollDownButtonProps extends HTMLAttributes<HTMLDivElement> {}

  // ─── Dialog ────────────────────────────────────────────
  export interface DialogProps {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    modal?: boolean;
    children?: ReactNode;
  }

  export interface DialogPortalProps {
    children?: ReactNode;
    container?: HTMLElement;
    forceMount?: boolean;
  }

  export interface DialogOverlayProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
    forceMount?: boolean;
    ref?: Ref<HTMLDivElement>;
  }

  export interface DialogCloseProps extends HTMLAttributes<HTMLButtonElement> {
    children?: ReactNode;
    asChild?: boolean;
    ref?: Ref<HTMLButtonElement>;
  }

  export interface DialogTriggerProps extends HTMLAttributes<HTMLButtonElement> {
    children?: ReactNode;
    asChild?: boolean;
    ref?: Ref<HTMLButtonElement>;
  }

  export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
    forceMount?: boolean;
    onOpenAutoFocus?: (event: Event) => void;
    onCloseAutoFocus?: (event: Event) => void;
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    onPointerDownOutside?: (event: Event) => void;
    onInteractOutside?: (event: Event) => void;
    ref?: Ref<HTMLDivElement>;
  }

  export interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
  }

  export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    children?: ReactNode;
    ref?: Ref<HTMLHeadingElement>;
  }

  export interface DialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
    children?: ReactNode;
    ref?: Ref<HTMLParagraphElement>;
  }

  export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
  }

  // ─── Badge ─────────────────────────────────────────────
  export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'error' | 'warning' | 'success' | 'info';
    children?: ReactNode;
    ref?: Ref<HTMLSpanElement>;
  }

  // ─── Input ─────────────────────────────────────────────
  export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    className?: string;
    error?: boolean;
    errorMessage?: string;
    label?: string;
    helperText?: string;
    leftIcon?: ReactNode | ComponentType<any>;
    rightIcon?: ReactNode | ComponentType<any>;
    fullWidth?: boolean;
    size?: 'sm' | 'md' | 'lg';
    ref?: Ref<HTMLInputElement>;
  }

  // ─── Textarea ──────────────────────────────────────────
  export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
    error?: boolean;
    errorMessage?: string;
    label?: string;
    helperText?: string;
    fullWidth?: boolean;
    autoResize?: boolean;
    ref?: Ref<HTMLTextAreaElement>;
  }

  // ─── Component Exports ─────────────────────────────────
  export const SearchInput: ComponentType<SearchInputProps>;
  export const Button: ComponentType<ButtonProps>;
  
  export const Select: ComponentType<SelectProps>;
  export const SelectGroup: ComponentType<SelectGroupProps>;
  export const SelectValue: ComponentType<SelectValueProps>;
  export const SelectTrigger: ComponentType<SelectTriggerProps>;
  export const SelectContent: ComponentType<SelectContentProps>;
  export const SelectLabel: ComponentType<SelectLabelProps>;
  export const SelectItem: ComponentType<SelectItemProps>;
  export const SelectSeparator: ComponentType<SelectSeparatorProps>;
  export const SelectScrollUpButton: ComponentType<SelectScrollUpButtonProps>;
  export const SelectScrollDownButton: ComponentType<SelectScrollDownButtonProps>;
  
  export const Dialog: ComponentType<DialogProps>;
  export const DialogPortal: ComponentType<DialogPortalProps>;
  export const DialogOverlay: ComponentType<DialogOverlayProps>;
  export const DialogClose: ComponentType<DialogCloseProps>;
  export const DialogTrigger: ComponentType<DialogTriggerProps>;
  export const DialogContent: ComponentType<DialogContentProps>;
  export const DialogHeader: ComponentType<DialogHeaderProps>;
  export const DialogTitle: ComponentType<DialogTitleProps>;
  export const DialogDescription: ComponentType<DialogDescriptionProps>;
  export const DialogFooter: ComponentType<DialogFooterProps>;
  
  export const Badge: ComponentType<BadgeProps>;
  export const Input: ComponentType<InputProps>;
  export const Textarea: ComponentType<TextareaProps>;

  // ─── Toast ────────────────────────────────────────────
  export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

  export interface ToastOptions {
    variant?: ToastVariant;
    title: string;
    description?: string;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }

  export interface ToastInstance extends ToastOptions {
    id: string;
  }

  export interface ToastProviderProps {
    children: ReactNode;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    max?: number;
  }

  export const ToastProvider: ComponentType<ToastProviderProps>;

  export function useToast(): {
    toast: (options: ToastOptions) => string;
    dismiss: (id: string) => void;
    toasts: ToastInstance[];
  };
}
