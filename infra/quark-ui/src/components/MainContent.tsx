'use client';

import { Box, Text, VStack, useColorMode } from '@chakra-ui/react';

export function MainContent() {
  const { colorMode } = useColorMode();

  return (
    <Box flex={1} p={6}>
      <VStack spacing={6} align="stretch" h="full">
        <Box>
          <Text
            fontSize="3xl"
            fontWeight="bold"
            mb={2}
            color={colorMode === 'dark' ? '#00f0ff' : '#1a202c'}
            fontFamily="Space Grotesk"
          >
            Добро пожаловать в Quark
          </Text>
          <Text color="gray.500" fontSize="lg">
            Ваша цифровая вселенная для самовыражения
          </Text>
        </Box>

        <Box
          p={6}
          borderRadius="xl"
          bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}
          boxShadow="lg"
        >
          <Text fontSize="lg" fontWeight="semibold" mb={3}>
            🚀 Быстрый старт
          </Text>
          <VStack align="stretch" spacing={2}>
            <Text color="gray.600">• Создайте свой первый пост в блоге</Text>
            <Text color="gray.600">• Начните общение в мессенджере</Text>
            <Text color="gray.600">• Настройте ИИ-помощника</Text>
            <Text color="gray.600">• Исследуйте доступные плагины</Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
