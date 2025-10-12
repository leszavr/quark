'use client';

import { Box, Flex, useColorMode } from '@chakra-ui/react';
import { ReactNode, useRef, useState, useCallback, useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';

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
  const { colorMode } = useColorMode();
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
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [leftWidth, minLeftWidth, maxLeftWidth, setSplitRatio]);

  // Предотвращаем выделение текста во время перетаскивания
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
    
    return () => {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  return (
    <Flex 
      ref={containerRef}
      h="full" 
      w="full"
      overflow="hidden"
    >
      {/* Левая панель */}
      <Box 
        width={`${leftWidth}%`}
        overflow="hidden"
        transition={isDragging ? "none" : "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"}
      >
        {leftChild}
      </Box>
      
      {/* Разделитель */}
      <Box
        width="6px"
        flexShrink={0}
        cursor="col-resize"
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        bg={
          isDragging 
            ? 'blue.400' 
            : isHovered 
              ? 'blue.300'
              : (colorMode === 'dark' ? 'gray.600' : 'gray.300')
        }
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-3px',
          right: '-3px',
          bottom: 0,
          // Увеличенная невидимая область для более удобного захвата
        }}
        _hover={{
          transform: 'scaleX(1.2)',
          shadow: 'md'
        }}
        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        transform={isDragging ? 'scaleX(1.3)' : 'scaleX(1)'}
      >
        {/* Визуальный индикатор в центре */}
        <Flex
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          flexDirection="column"
          align="center"
          gap="1px"
          opacity={isHovered || isDragging ? 1 : 0.6}
          transition="opacity 0.2s ease"
        >
          <Box
            w="2px"
            h="4px"
            bg={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
            borderRadius="1px"
          />
          <Box
            w="2px"
            h="4px"
            bg={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
            borderRadius="1px"
          />
          <Box
            w="2px"
            h="4px"
            bg={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
            borderRadius="1px"
          />
        </Flex>
      </Box>
      
      {/* Правая панель */}
      <Box 
        width={`${rightWidth}%`}
        overflow="hidden"
        transition={isDragging ? "none" : "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"}
      >
        {rightChild}
      </Box>
    </Flex>
  );
}