import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils.js";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-violet-600/20 text-violet-300 border border-violet-500/30",
        secondary: "bg-zinc-800 text-zinc-300 border border-zinc-700",
        destructive: "bg-red-600/20 text-red-300 border border-red-500/30",
        success: "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30",
        warning: "bg-amber-600/20 text-amber-300 border border-amber-500/30",
        outline: "border border-zinc-600 text-zinc-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
