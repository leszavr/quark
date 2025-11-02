"use client";

import { ReactNode, useRef, useState, useCallback, useEffect } from "react";
import { useAppStore } from "@/stores/appStore";

interface ResizableSplitterProps {
  leftChild: ReactNode;
  rightChild: ReactNode;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  onRightWidthChange?: (rightWidth: number) => void;
}

export function ResizableSplitter({ 
  leftChild, 
  rightChild, 
  minLeftWidth = 30, 
  maxLeftWidth = 70,
  onRightWidthChange
}: ResizableSplitterProps) {
  const { splitRatio, setSplitRatio } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Ограничиваем значения в допустимых пределах
  const leftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, splitRatio));
  const rightWidth = 100 - leftWidth;

  // Уведомляем о изменении ширины правой панели
  useEffect(() => {
    onRightWidthChange?.(rightWidth);
  }, [rightWidth, onRightWidthChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const container = containerRef.current;
    if (!container) return;
    
    const startX = e.clientX;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const startLeftWidth = leftWidth;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newLeftWidth = Math.max(
        minLeftWidth, 
        Math.min(maxLeftWidth, startLeftWidth + deltaPercent)
      );
      
      setSplitRatio(newLeftWidth);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [leftWidth, minLeftWidth, maxLeftWidth, setSplitRatio]);

  // Предотвращаем выделение текста во время перетаскивания
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    } else {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
    
    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging]);

  return (
    <div ref={containerRef} className="flex w-full h-full overflow-hidden">
      {/* Левая панель */}
      <div
        style={{ width: `${leftWidth}%`, transition: isDragging ? "none" : "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
        className="overflow-hidden"
      >
        {leftChild}
      </div>
      {/* Разделитель */}
      <div
        style={{ width: "6px" }}
        className={`flex-shrink-0 cursor-col-resize relative transition-all duration-200 ${isDragging ? "bg-blue-400 scale-x-130" : isHovered ? "bg-blue-300 scale-x-120" : "bg-gray-300 dark:bg-gray-600 scale-x-100"}`}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Визуальный индикатор в центре */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-60 transition-opacity duration-200" style={{ opacity: isHovered || isDragging ? 1 : 0.6 }}>
          <div className="w-0.5 h-1 bg-gray-600 dark:bg-gray-300 rounded" />
          <div className="w-0.5 h-1 bg-gray-600 dark:bg-gray-300 rounded" />
          <div className="w-0.5 h-1 bg-gray-600 dark:bg-gray-300 rounded" />
        </div>
      </div>
      {/* Правая панель */}
      <div
        style={{ width: `${rightWidth}%`, transition: isDragging ? "none" : "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
        className="overflow-hidden"
      >
        {rightChild}
      </div>
    </div>
  );
}