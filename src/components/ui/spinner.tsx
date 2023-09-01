import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      default: 'h-10 w-10',
      sm: 'h-6 w-6',
      lg: 'h-14 w-14',
    },
    color: {
      default: 'text-blue-500',
      primary: 'text-primary',
      secondary: 'text-secondary',
      destructive: 'text-destructive',
      accent: 'text-accent',
    },
  },
  defaultVariants: {
    size: 'default',
    color: 'default',
  },
})

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  asChild?: boolean
  className?: string
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, color, asChild = false, ...props }, ref) => {
    const Component: React.ElementType = asChild ? 'g' : 'svg'

    return (
      <Component
        className={cn(spinnerVariants({ size, color, className }))}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        ref={ref as any}
        {...props}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l1-2.647z"
        ></path>
      </Component>
    )
  },
)
Spinner.displayName = 'Spinner'

export { Spinner, spinnerVariants }
