import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        outline: "border-2 border-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  readonly className?: string;
  readonly variant?: "default" | "outline" | null;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", ...props }: CardProps, ref: React.Ref<HTMLDivElement>) => (
    <div ref={ref} className={cardVariants({ variant, className })} {...props} />
  )
);
Card.displayName = "Card";
