import * as React from 'react'

import { cn } from '../utils/cn'

type InputProps = React.ComponentProps<'input'> & {
  error?: boolean | string | null
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      data-invalid={Boolean(error)}
      aria-invalid={props['aria-invalid'] ?? Boolean(error)}
      className={cn(
        'flex w-full min-w-0 rounded-md border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none',
        'file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'data-[invalid=true]:border-red-400 data-[invalid=true]:focus-visible:ring-red-200/50',
        className,
      )}
      {...props}
    />
  ),
)

Input.displayName = 'Input'

export default Input
