"use client";

import React from "react";
import { Header } from "./Header";
import { WindowLayout } from "@/components/WindowLayout";

interface MainLayoutProps {
  showHeader?: boolean;
  showHomeButton?: boolean;
  children?: React.ReactNode;
}

export function MainLayout({ 
  showHeader = true, 
  showHomeButton = false, 
  children 
}: MainLayoutProps) {
  // Tailwind: bg-gray-50 (light), bg-gray-900 (dark)
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {showHeader && <Header showHomeButton={showHomeButton} />}
      <div className="flex-1 flex flex-col">
        {children ? (
          children
        ) : (
          // Используем готовый WindowLayout с режимом "both"
          <div className={showHeader ? "h-[calc(100vh-70px)]" : "h-screen"}>
            <WindowLayout />
          </div>
        )}
      </div>
    </div>
  );
}