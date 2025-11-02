import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }: InputProps, ref: React.Ref<HTMLInputElement>) => (
    <input
      ref={ref}
      className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";
