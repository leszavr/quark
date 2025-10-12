'use client';

import { Box, HStack, VStack, Text, Button, IconButton, useColorMode, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { useState } from 'react';
import { Eye, Code, Edit3 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { MarkdownRenderer } from './MarkdownRenderer';

// Динамический импорт MD Editor для избежания SSR проблем
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface VisualEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export function VisualEditor({ value, onChange, placeholder, height = '400px' }: VisualEditorProps) {
  const { colorMode } = useColorMode();
  const [mode, setMode] = useState<'visual' | 'code' | 'preview'>('visual');

  // Стили для темной темы
  const editorProps = {
    'data-color-mode': colorMode,
    style: {
      backgroundColor: colorMode === 'dark' ? '#1A202C' : '#FFFFFF',
      border: `1px solid ${colorMode === 'dark' ? '#4A5568' : '#E2E8F0'}`,
      borderRadius: '12px',
    }
  };

  const toolbarButtons = [
    'bold', 'italic', 'strikethrough', '|',
    'title', 'quote', 'unordered-list', 'ordered-list', '|',
    'link', 'code', 'codeBlock', '|',
    'table', 'divider', '|',
    'preview'
  ];

  return (
    <Box>
      {/* Переключатель режимов */}
      <HStack spacing={1} mb={3}>
        <Button
          size="sm"
          variant={mode === 'visual' ? 'solid' : 'ghost'}
          colorScheme={mode === 'visual' ? 'blue' : 'gray'}
          leftIcon={<Edit3 size={14} />}
          onClick={() => setMode('visual')}
        >
          Визуальный
        </Button>
        <Button
          size="sm"
          variant={mode === 'code' ? 'solid' : 'ghost'}
          colorScheme={mode === 'code' ? 'blue' : 'gray'}
          leftIcon={<Code size={14} />}
          onClick={() => setMode('code')}
        >
          Код
        </Button>
        <Button
          size="sm"
          variant={mode === 'preview' ? 'solid' : 'ghost'}
          colorScheme={mode === 'preview' ? 'blue' : 'gray'}
          leftIcon={<Eye size={14} />}
          onClick={() => setMode('preview')}
        >
          Превью
        </Button>
      </HStack>

      {/* Редактор */}
      <Box
        borderRadius="12px"
        overflow="hidden"
        border="1px solid"
        borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.300'}
      >
        {mode === 'visual' && (
          <Box {...editorProps}>
            <MDEditor
              value={value}
              onChange={(val) => onChange(val || '')}
              preview="edit"
              hideToolbar={false}
              visibleDragbar={false}
              textareaProps={{
                placeholder: placeholder || 'Начните писать ваш пост...',
                style: {
                  fontSize: 14,
                  lineHeight: 1.6,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  minHeight: height,
                }
              }}
              height={parseInt(height.replace('px', ''))}
              toolbarBottom={false}
              commands={toolbarButtons as any}
            />
          </Box>
        )}

        {mode === 'code' && (
          <Box
            as="textarea"
            w="full"
            h={height}
            p={4}
            resize="vertical"
            border="none"
            outline="none"
            bg={colorMode === 'dark' ? 'gray.800' : 'white'}
            color={colorMode === 'dark' ? 'gray.100' : 'gray.800'}
            placeholder={placeholder || 'Напишите Markdown код...'}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
            fontFamily="'JetBrains Mono', Monaco, Menlo, 'Ubuntu Mono', monospace"
            fontSize="sm"
            lineHeight="1.6"
          />
        )}

        {mode === 'preview' && (
          <Box
            p={6}
            minH={height}
            bg={colorMode === 'dark' ? 'gray.800' : 'white'}
            overflowY="auto"
          >
            {value ? (
              <MarkdownRenderer>{value}</MarkdownRenderer>
            ) : (
              <Text color="gray.500" fontStyle="italic">
                Превью появится здесь...
              </Text>
            )}
          </Box>
        )}
      </Box>

      {/* Подсказки */}
      <Box mt={2}>
        {mode === 'visual' && (
          <Text fontSize="xs" color="gray.500">
            💡 Используйте панель инструментов для форматирования или переключитесь в режим "Код" для прямого редактирования Markdown
          </Text>
        )}
        {mode === 'code' && (
          <Text fontSize="xs" color="gray.500">
            💡 Поддерживается полный синтаксис Markdown: **жирный**, *курсив*, `код`, [ссылки](url), заголовки #, списки, и многое другое
          </Text>
        )}
        {mode === 'preview' && (
          <Text fontSize="xs" color="gray.500">
            👀 Так будет выглядеть ваш пост после публикации
          </Text>
        )}
      </Box>
    </Box>
  );
}