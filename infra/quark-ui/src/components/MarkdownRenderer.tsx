'use client';

import { Box, Code, Heading, Text, List, ListItem, Link, useColorMode } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  children: string;
}

export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  const { colorMode } = useColorMode();

  return (
    <Box className="markdown-content">
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Заголовки
          h1: ({ children }) => (
            <Heading 
              as="h1" 
              size="xl" 
              mb={6} 
              mt={8}
              fontFamily="Space Grotesk"
              color={colorMode === 'dark' ? '#00f0ff' : '#1a202c'}
              _first={{ mt: 0 }}
            >
              {children}
            </Heading>
          ),
          h2: ({ children }) => (
            <Heading 
              as="h2" 
              size="lg" 
              mb={4} 
              mt={8}
              fontFamily="Space Grotesk"
              color={colorMode === 'dark' ? 'gray.100' : 'gray.800'}
              _first={{ mt: 0 }}
            >
              {children}
            </Heading>
          ),
          h3: ({ children }) => (
            <Heading 
              as="h3" 
              size="md" 
              mb={3} 
              mt={6}
              fontFamily="Space Grotesk"
              color={colorMode === 'dark' ? 'gray.200' : 'gray.700'}
              _first={{ mt: 0 }}
            >
              {children}
            </Heading>
          ),
          h4: ({ children }) => (
            <Heading 
              as="h4" 
              size="sm" 
              mb={3} 
              mt={4}
              fontFamily="Space Grotesk"
              color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
              _first={{ mt: 0 }}
            >
              {children}
            </Heading>
          ),
          
          // Параграфы
          p: ({ children }) => (
            <Text 
              mb={4} 
              lineHeight="1.8"
              color={colorMode === 'dark' ? 'gray.300' : 'gray.700'}
            >
              {children}
            </Text>
          ),
          
          // Блоки кода
          pre: ({ children }) => (
            <Box
              as="pre"
              bg={colorMode === 'dark' ? 'gray.900' : 'gray.50'}
              p={4}
              borderRadius="12px"
              mb={4}
              overflow="auto"
              border="1px solid"
              borderColor={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
              sx={{
                '& code': {
                  fontFamily: "'JetBrains Mono', 'Fira Code', Monaco, Menlo, 'Ubuntu Mono', monospace",
                  fontSize: 'sm',
                }
              }}
            >
              {children}
            </Box>
          ),
          
          // Инлайн код
          code: ({ children, className }) => {
            // Если это блок кода в pre, возвращаем как есть
            if (className) {
              return <code className={className}>{children}</code>;
            }
            // Иначе это инлайн код
            return (
              <Code
                px={2}
                py={1}
                bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
                color={colorMode === 'dark' ? 'gray.100' : 'gray.800'}
                borderRadius="md"
                fontSize="sm"
                fontFamily="'JetBrains Mono', Monaco, Menlo, 'Ubuntu Mono', monospace"
              >
                {children}
              </Code>
            );
          },
          
          // Ссылки
          a: ({ href, children }) => (
            <Link
              href={href}
              color="primary.400"
              _hover={{ 
                color: 'primary.300',
                textDecoration: 'underline'
              }}
              isExternal
            >
              {children}
            </Link>
          ),
          
          // Списки
          ul: ({ children }) => (
            <List spacing={2} mb={4} pl={4}>
              {children}
            </List>
          ),
          ol: ({ children }) => (
            <List as="ol" spacing={2} mb={4} pl={4}>
              {children}
            </List>
          ),
          li: ({ children }) => (
            <ListItem 
              color={colorMode === 'dark' ? 'gray.300' : 'gray.700'}
              lineHeight="1.6"
              sx={{
                '&::marker': {
                  color: 'primary.400'
                }
              }}
            >
              {children}
            </ListItem>
          ),
          
          // Цитаты
          blockquote: ({ children }) => (
            <Box
              as="blockquote"
              pl={4}
              py={2}
              mb={4}
              borderLeft="4px solid"
              borderColor="primary.400"
              bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}
              borderRadius="0 8px 8px 0"
              fontStyle="italic"
            >
              {children}
            </Box>
          ),
          
          // Жирный текст
          strong: ({ children }) => (
            <Text as="strong" fontWeight="bold" color={colorMode === 'dark' ? 'gray.100' : 'gray.900'}>
              {children}
            </Text>
          ),
          
          // Курсив
          em: ({ children }) => (
            <Text as="em" fontStyle="italic" color={colorMode === 'dark' ? 'gray.200' : 'gray.700'}>
              {children}
            </Text>
          ),
          
          // Горизонтальная линия
          hr: () => (
            <Box
              as="hr"
              border="none"
              height="1px"
              bg={colorMode === 'dark' ? 'gray.600' : 'gray.300'}
              my={8}
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
      
      <style jsx global>{`
        .markdown-content .hljs {
          background: ${colorMode === 'dark' ? '#1a202c !important' : '#f7fafc !important'};
          color: ${colorMode === 'dark' ? '#e2e8f0' : '#2d3748'};
        }
      `}</style>
    </Box>
  );
}