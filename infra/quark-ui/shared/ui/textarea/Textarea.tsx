import * as React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }: TextareaProps, ref: React.Ref<HTMLTextAreaElement>) => (
    <textarea
      ref={ref}
      className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
