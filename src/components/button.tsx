import * as React from 'react'

import { cn } from '../utils/cn'

type ButtonProps = React.ComponentProps<'button'>

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      data-slot="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md cursor-pointer text-sm font-medium transition-[color,box-shadow] outline-none',
        'disabled:pointer-events-none disabled:opacity-50',
        'focus-visible:ring-[3px] focus-visible:ring-green-300/50',
        className,
      )}
      {...props}
    />
  ),
)

Button.displayName = 'Button'

export default Button
