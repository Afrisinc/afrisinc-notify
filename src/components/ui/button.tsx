import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/90 dark:hover:bg-primary/80 active:bg-primary/80 shadow-primary/30 hover:shadow-primary/50 dark:shadow-primary/40",
        "primary-solid": "bg-primary-500 text-white hover:bg-primary-400 active:bg-primary-500",
        "primary-light": "bg-primary/15 text-primary hover:bg-primary/30 active:bg-primary/40 dark:bg-primary/20 dark:hover:bg-primary/35",
        "secondary-outline": "border border-border bg-transparent text-foreground hover:bg-primary-200 active:bg-primary-200",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border/40 dark:border-border/50 bg-background dark:bg-card text-foreground dark:text-foreground hover:bg-primary/5 dark:hover:bg-primary/10 hover:border-primary/40 dark:hover:border-primary/50 transition-all",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-foreground dark:text-foreground hover:bg-accent dark:hover:bg-primary/20 hover:text-accent-foreground dark:hover:text-white",
        link: "text-primary-500 underline-offset-4 hover:underline",
        "premium-action": "bg-primary text-white dark:text-slate-900 hover:bg-primary/90 dark:hover:bg-primary/80 shadow-primary/30 dark:shadow-primary/40 hover:shadow-primary/50 dark:hover:shadow-primary/50 transition-all font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        md: "h-10 px-6 py-3",
        lg: "h-11 px-8 py-4",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
