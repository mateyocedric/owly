import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { cn } from "../lib/utils.js";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 flex gap-3",
  {
    variants: {
      variant: {
        default: "border-zinc-700 bg-zinc-900/50 text-zinc-300",
        info: "border-blue-500/30 bg-blue-600/10 text-blue-300",
        warning: "border-amber-500/30 bg-amber-600/10 text-amber-300",
        success: "border-emerald-500/30 bg-emerald-600/10 text-emerald-300",
        destructive: "border-red-500/30 bg-red-600/10 text-red-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const iconMap = {
  default: Info,
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  destructive: XCircle,
} as const;

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: boolean;
}

function Alert({ className, variant = "default", icon = true, children, ...props }: AlertProps) {
  const Icon = iconMap[variant ?? "default"];
  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert" {...props}>
      {icon && <Icon className="h-5 w-5 shrink-0 mt-0.5" />}
      <div className="flex-1">{children}</div>
    </div>
  );
}

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("font-semibold leading-tight tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm mt-1 opacity-90", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
