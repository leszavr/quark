"use client";

import * as RadixTabs from "@radix-ui/react-tabs";
import type { ReactNode } from "react";

export interface TabsProps {
  readonly defaultValue?: string;
  readonly value?: string;
  readonly onValueChange?: (value: string) => void;
  readonly children: ReactNode;
  readonly className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  return (
    <RadixTabs.Root
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={className}
    >
      {children}
    </RadixTabs.Root>
  );
}

export interface TabsListProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <RadixTabs.List className={`inline-flex gap-1 border-b ${className || ""}`}>
      {children}
    </RadixTabs.List>
  );
}

export interface TabsTriggerProps {
  readonly value: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  return (
    <RadixTabs.Trigger
      value={value}
      className={`px-4 py-2 text-sm font-medium transition-colors hover:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 ${className || ""}`}
    >
      {children}
    </RadixTabs.Trigger>
  );
}

export interface TabsContentProps {
  readonly value: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  return (
    <RadixTabs.Content value={value} className={className}>
      {children}
    </RadixTabs.Content>
  );
}
