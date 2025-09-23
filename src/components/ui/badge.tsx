import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

// THEME: 1. We use `cva` to define the variants in a more organized way.
// This is the standard in libraries like shadcn/ui and is very clean.
const badgeVariants = cva(
  // Base classes applied to all variants
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        // THEME: 2. Each hardcoded color set is replaced with its semantic equivalent.
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
}
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    // THEME: 3. The className now just calls `badgeVariants` to get the correct classes.
        return (
      <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
        );
    }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };