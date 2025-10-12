'use client';

import { Box, useColorModeValue } from '@chakra-ui/react';
import { Header } from './Header';
import { WindowLayout } from '@/components/WindowLayout';

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
  const bgColor = useColorModeValue("gray.50", "gray.900");
  
  return (
    <Box minH="100vh" bg={bgColor}>
      {showHeader && <Header showHomeButton={showHomeButton} />}
      
      <Box flex={1}>
        {children ? (
          children
        ) : (
          // Используем готовый WindowLayout с режимом "both"
          <Box h={showHeader ? "calc(100vh - 70px)" : "100vh"}>
            <WindowLayout />
          </Box>
        )}
      </Box>
    </Box>
  );
}