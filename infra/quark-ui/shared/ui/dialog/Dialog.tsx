import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";

export interface DialogProps extends RadixDialog.DialogProps {
  children: React.ReactNode;
}

export const Dialog = ({ children, ...props }: DialogProps) => (
  <RadixDialog.Root {...props}>
    {children}
  </RadixDialog.Root>
);
Dialog.displayName = "Dialog";
