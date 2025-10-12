'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  IconButton,
  useColorMode,
  Image,
  Badge,
  Progress,
  Alert,
  AlertIcon,
  CloseButton,
} from '@chakra-ui/react';
import { useState, useRef } from 'react';
import { Paperclip, X, File, Image as ImageIcon, Video, Music } from 'lucide-react';

interface FileAttachment {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'video' | 'audio' | 'document';
  uploadProgress?: number;
}

interface FileUploaderProps {
  onFilesChange: (files: FileAttachment[]) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedTypes?: string[];
}

const getFileType = (file: File): FileAttachment['type'] => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'document';
};

const getFileIcon = (type: FileAttachment['type']) => {
  switch (type) {
    case 'image': return ImageIcon;
    case 'video': return Video;
    case 'audio': return Music;
    default: return File;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Б';
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileUploader({ 
  onFilesChange, 
  maxFiles = 5, 
  maxSizeInMB = 10,
  acceptedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*']
}: FileUploaderProps) {
  const { colorMode } = useColorMode();
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    
    setError('');
    const newAttachments: FileAttachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Проверка размера файла
      if (file.size > maxSizeInMB * 1024 * 1024) {
        setError(`Файл "${file.name}" превышает максимальный размер ${maxSizeInMB}МБ`);
        continue;
      }
      
      // Проверка количества файлов
      if (attachments.length + newAttachments.length >= maxFiles) {
        setError(`Максимальное количество файлов: ${maxFiles}`);
        break;
      }
      
      const fileType = getFileType(file);
      const attachment: FileAttachment = {
        id: `file-${Date.now()}-${i}`,
        file,
        type: fileType,
        uploadProgress: 0,
      };
      
      // Создаем preview для изображений
      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          attachment.preview = e.target?.result as string;
          setAttachments(prev => 
            prev.map(a => a.id === attachment.id ? attachment : a)
          );
        };
        reader.readAsDataURL(file);
      }
      
      newAttachments.push(attachment);
    }
    
    const updatedAttachments = [...attachments, ...newAttachments];
    setAttachments(updatedAttachments);
    onFilesChange(updatedAttachments);
    
    // Симулируем загрузку файлов
    simulateUpload(newAttachments);
  };

  const simulateUpload = (files: FileAttachment[]) => {
    files.forEach((attachment) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        
        setAttachments(prev =>
          prev.map(a => 
            a.id === attachment.id 
              ? { ...a, uploadProgress: progress }
              : a
          )
        );
      }, 200);
    });
  };

  const removeAttachment = (id: string) => {
    const updatedAttachments = attachments.filter(a => a.id !== id);
    setAttachments(updatedAttachments);
    onFilesChange(updatedAttachments);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <Box>
      {/* Кнопка прикрепления файлов */}
      <IconButton
        aria-label="Прикрепить файл"
        icon={<Paperclip size={18} />}
        variant="ghost"
        size="sm"
        color="gray.500"
        _hover={{ color: 'primary.500' }}
        onClick={() => fileInputRef.current?.click()}
      />
      
      {/* Скрытый input для выбора файлов */}
      <Input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        display="none"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Ошибки */}
      {error && (
        <Alert status="error" size="sm" mt={2} borderRadius="md">
          <AlertIcon />
          <Text fontSize="sm">{error}</Text>
          <CloseButton
            size="sm"
            onClick={() => setError('')}
            ml="auto"
          />
        </Alert>
      )}

      {/* Превью прикрепленных файлов */}
      {attachments.length > 0 && (
        <Box
          mt={2}
          p={3}
          bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
          borderRadius="md"
          borderWidth="1px"
          borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
        >
          <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.500">
            Прикрепленные файлы ({attachments.length}):
          </Text>
          
          <VStack spacing={2} align="stretch">
            {attachments.map((attachment) => {
              const Icon = getFileIcon(attachment.type);
              const isUploading = (attachment.uploadProgress || 0) < 100;
              
              return (
                <Box key={attachment.id}>
                  <HStack
                    spacing={3}
                    p={2}
                    bg={colorMode === 'dark' ? 'gray.600' : 'white'}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor={colorMode === 'dark' ? 'gray.500' : 'gray.200'}
                  >
                    {/* Иконка или превью */}
                    {attachment.preview ? (
                      <Image
                        src={attachment.preview}
                        alt={attachment.file.name}
                        boxSize="40px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                    ) : (
                      <Box
                        w="40px"
                        h="40px"
                        bg={colorMode === 'dark' ? 'gray.500' : 'gray.100'}
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon size={20} color="gray" />
                      </Box>
                    )}
                    
                    {/* Информация о файле */}
                    <VStack align="start" spacing={0} flex={1} minW={0}>
                      <Text fontSize="sm" fontWeight="medium" isTruncated>
                        {attachment.file.name}
                      </Text>
                      <HStack spacing={2}>
                        <Text fontSize="xs" color="gray.500">
                          {formatFileSize(attachment.file.size)}
                        </Text>
                        <Badge
                          size="sm"
                          colorScheme={attachment.type === 'image' ? 'green' : 'blue'}
                        >
                          {attachment.type}
                        </Badge>
                      </HStack>
                    </VStack>
                    
                    {/* Кнопка удаления */}
                    <IconButton
                      aria-label="Удалить файл"
                      icon={<X size={16} />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => removeAttachment(attachment.id)}
                    />
                  </HStack>
                  
                  {/* Прогресс загрузки */}
                  {isUploading && (
                    <Progress
                      value={attachment.uploadProgress || 0}
                      size="sm"
                      colorScheme="primary"
                      mt={1}
                      borderRadius="md"
                    />
                  )}
                </Box>
              );
            })}
          </VStack>
        </Box>
      )}

      {/* Зона drag & drop */}
      <Box
        mt={2}
        p={4}
        border="2px dashed"
        borderColor={dragOver 
          ? 'primary.500' 
          : (colorMode === 'dark' ? 'gray.600' : 'gray.300')
        }
        borderRadius="md"
        bg={dragOver 
          ? (colorMode === 'dark' ? 'primary.900' : 'primary.50')
          : 'transparent'
        }
        textAlign="center"
        cursor="pointer"
        transition="all 0.2s"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <VStack spacing={2}>
          <Paperclip 
            size={24} 
            color={dragOver ? 'var(--chakra-colors-primary-500)' : 'gray'} 
          />
          <Text fontSize="sm" color="gray.500">
            Перетащите файлы сюда или нажмите для выбора
          </Text>
          <Text fontSize="xs" color="gray.400">
            Максимум {maxFiles} файлов по {maxSizeInMB}МБ
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}