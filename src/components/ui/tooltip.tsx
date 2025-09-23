// components/ui/Tooltip.tsx

'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

// THEME: The concept of a 'variant' is no longer needed. The component will now have
// a single, theme-aware style. We've removed the custom props interface.
const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
      // THEME: Replaced the conditional variant styles with a single set of semantic classes.
      // - `bg-popover` and `text-popover-foreground` will automatically adapt to the theme.
      // - `border` uses the theme's `--border` variable.
      'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className
        )}
        {...props}
    />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// --- REUSABLE TOOLTIP COMPONENT WRAPPER ---

// THEME: Removed the `variant` prop as it's no longer used.
interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

export function Tooltip({
                            content,
                            children,
                            position = 'top',
                            className,
                        }: TooltipProps) {
    return (
        <TooltipProvider delayDuration={200}>
            <TooltipRoot>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={position}
                        className={className}>
          {/* Casting to string for cases where content is a simple value like a number */}
          <p>{String(content)}</p>
                </TooltipContent>
            </TooltipRoot>
        </TooltipProvider>
    );
}

// Exporting all the primitives allows for more advanced, custom tooltip compositions if needed.
export { TooltipProvider, TooltipRoot, TooltipTrigger };
