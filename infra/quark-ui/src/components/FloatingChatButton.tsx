'use client';

import { IconButton, Box, useColorMode } from '@chakra-ui/react';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';

const MotionIconButton = motion.create(IconButton);

export function FloatingChatButton() {
  const { colorMode } = useColorMode();
  const { setViewMode, setChatWindow, viewMode } = useAppStore();
  
  const handleChatToggle = () => {
    // Всегда показываем чат в режиме both (блог + чат)
    setChatWindow({ isOpen: true });
    setViewMode('both');
  };

  return (
    <Box
      position="fixed"
      bottom={6}
      right={6}
      zIndex={1000}
    >
      <MotionIconButton
        aria-label="Открыть чат"
        icon={<MessageSquare size={24} />}
        size="lg"
        borderRadius="full"
        bg={colorMode === 'light' ? '#4a5568' : '#68d391'}
        color={colorMode === 'light' ? 'white' : 'black'}
        boxShadow={colorMode === 'light' ? '0 8px 24px rgba(74, 85, 104, 0.4)' : '0 8px 24px rgba(104, 211, 145, 0.4)'}
        _hover={{
          transform: 'scale(1.1)',
          boxShadow: colorMode === 'light' ? '0 12px 32px rgba(74, 85, 104, 0.6)' : '0 12px 32px rgba(104, 211, 145, 0.6)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        onClick={handleChatToggle}
      />
    </Box>
  );
}
