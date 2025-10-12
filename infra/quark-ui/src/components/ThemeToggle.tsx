'use client';

import { IconButton, useColorMode } from '@chakra-ui/react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <IconButton
      aria-label="Переключить тему"
      icon={colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      onClick={toggleColorMode}
      variant="ghost"
      size="sm"
      _hover={{
        bg: colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.100',
        transform: 'scale(1.05)',
      }}
      transition="all 0.2s"
    />
  );
}
