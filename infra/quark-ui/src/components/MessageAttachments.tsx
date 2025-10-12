'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Button,
  Badge,
  useColorMode,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { Download, FileText, Image as ImageIcon, Video, Music, Play } from 'lucide-react';
import { MessageAttachment } from '../hooks/useChatStorage';

interface MessageAttachmentsProps {
  attachments: MessageAttachment[];
  isOwn: boolean;
}

const getFileIcon = (type: MessageAttachment['type']) => {
  switch (type) {
    case 'image': return ImageIcon;
    case 'video': return Video;
    case 'audio': return Music;
    default: return FileText;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Б';
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getTypeColor = (type: MessageAttachment['type']): string => {
  switch (type) {
    case 'image': return 'green';
    case 'video': return 'purple';
    case 'audio': return 'blue';
    default: return 'gray';
  }
};

export function MessageAttachments({ attachments, isOwn }: MessageAttachmentsProps) {
  const { colorMode } = useColorMode();

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleDownload = (attachment: MessageAttachment) => {
    if (attachment.url) {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <VStack spacing={2} align="stretch" mt={2}>
      {attachments.map((attachment) => {
        const Icon = getFileIcon(attachment.type);
        const typeColor = getTypeColor(attachment.type);

        return (
          <Box key={attachment.id}>
            {attachment.type === 'image' && attachment.preview ? (
              // Превью изображения
              <Box
                position="relative"
                borderRadius="md"
                overflow="hidden"
                maxW="300px"
                cursor="pointer"
                _hover={{ transform: 'scale(1.02)' }}
                transition="transform 0.2s"
              >
                <Image
                  src={attachment.preview}
                  alt={attachment.name}
                  maxW="100%"
                  maxH="200px"
                  objectFit="cover"
                />
                <Box
                  position="absolute"
                  top={2}
                  right={2}
                  bg="blackAlpha.700"
                  borderRadius="md"
                  p={1}
                >
                  <IconButton
                    aria-label="Скачать изображение"
                    icon={<Download size={16} />}
                    size="xs"
                    variant="ghost"
                    colorScheme="whiteAlpha"
                    onClick={() => handleDownload(attachment)}
                  />
                </Box>
                <Box
                  position="absolute"
                  bottom={0}
                  left={0}
                  right={0}
                  bg="blackAlpha.700"
                  p={2}
                >
                  <Text fontSize="xs" color="white" isTruncated>
                    {attachment.name}
                  </Text>
                </Box>
              </Box>
            ) : attachment.type === 'video' && attachment.preview ? (
              // Превью видео
              <Box
                position="relative"
                borderRadius="md"
                overflow="hidden"
                maxW="300px"
                cursor="pointer"
                bg="black"
              >
                <Image
                  src={attachment.preview}
                  alt={attachment.name}
                  maxW="100%"
                  maxH="200px"
                  objectFit="cover"
                />
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  bg="blackAlpha.700"
                  borderRadius="full"
                  p={3}
                >
                  <Play size={24} color="white" />
                </Box>
                <Box
                  position="absolute"
                  bottom={0}
                  left={0}
                  right={0}
                  bg="blackAlpha.700"
                  p={2}
                >
                  <Text fontSize="xs" color="white" isTruncated>
                    {attachment.name}
                  </Text>
                </Box>
              </Box>
            ) : (
              // Обычный файл
              <Box
                p={3}
                bg={isOwn 
                  ? (colorMode === 'dark' ? 'whiteAlpha.200' : 'whiteAlpha.300')
                  : (colorMode === 'dark' ? 'gray.600' : 'gray.200')
                }
                borderRadius="md"
                maxW="300px"
              >
                <HStack spacing={3}>
                  <Box
                    p={2}
                    bg={colorMode === 'dark' ? 'gray.500' : 'gray.100'}
                    borderRadius="md"
                  >
                    <Icon size={20} />
                  </Box>
                  
                  <VStack align="start" spacing={0} flex={1} minW={0}>
                    <Text fontSize="sm" fontWeight="medium" isTruncated>
                      {attachment.name}
                    </Text>
                    <HStack spacing={2}>
                      <Text fontSize="xs" opacity={0.7}>
                        {formatFileSize(attachment.size)}
                      </Text>
                      <Badge size="sm" colorScheme={typeColor}>
                        {attachment.type}
                      </Badge>
                    </HStack>
                  </VStack>
                  
                  <Tooltip label="Скачать файл">
                    <IconButton
                      aria-label="Скачать файл"
                      icon={<Download size={16} />}
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(attachment)}
                    />
                  </Tooltip>
                </HStack>
              </Box>
            )}
          </Box>
        );
      })}
    </VStack>
  );
}