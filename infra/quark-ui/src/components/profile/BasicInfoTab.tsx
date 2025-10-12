'use client';

import { useState, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Textarea,
  Button,
  Avatar,
  IconButton,
  FormControl,
  FormLabel,
  Card,
  CardHeader,
  CardBody,
  useToast,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { Camera, Upload, X } from 'lucide-react';

interface UserProfile {
  avatar: string | null;
  fullName: string;
  email: string;
  bio: string;
}

export function BasicInfoTab() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Состояние профиля (позже подключим к глобальному стору)
  const [profile, setProfile] = useState<UserProfile>({
    avatar: null,
    fullName: 'Иван Иванов',
    email: 'ivan@example.com',
    bio: 'Разработчик и энтузиаст новых технологий',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState<UserProfile>(profile);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, выберите изображение',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Размер файла не должен превышать 5MB',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Создаем URL для превью
    const imageUrl = URL.createObjectURL(file);
    setEditProfile(prev => ({ ...prev, avatar: imageUrl }));
  };

  const handleRemoveAvatar = () => {
    setEditProfile(prev => ({ ...prev, avatar: null }));
  };

  const handleSave = () => {
    // Валидация
    if (!editProfile.fullName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Имя пользователя не может быть пустым',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!editProfile.email.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Email не может быть пустым',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Email валидация
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editProfile.email)) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректный email адрес',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Сохраняем данные
    setProfile(editProfile);
    setIsEditing(false);
    
    toast({
      title: 'Успешно',
      description: 'Профиль обновлен',
      status: 'success',
      duration: 3000,
    });
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between">
          <Box>
            <Heading size="md">Основная информация</Heading>
            <Text color="gray.600" _dark={{ color: "gray.400" }} mt={1}>
              Управляйте своими персональными данными
            </Text>
          </Box>
          <Badge colorScheme="green" variant="subtle">
            Активный профиль
          </Badge>
        </HStack>
      </CardHeader>

      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Секция аватара */}
          <Box>
            <FormLabel fontSize="sm" fontWeight="semibold" mb={3}>
              Фотография профиля
            </FormLabel>
            <HStack spacing={4}>
              <Box position="relative">
                <Avatar
                  size="xl"
                  src={isEditing ? editProfile.avatar || undefined : profile.avatar || undefined}
                  name={isEditing ? editProfile.fullName : profile.fullName}
                />
                {isEditing && (
                  <IconButton
                    size="sm"
                    icon={<Camera size={16} />}
                    colorScheme="blue"
                    variant="solid"
                    position="absolute"
                    bottom={0}
                    right={0}
                    borderRadius="full"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Загрузить фото"
                  />
                )}
              </Box>
              
              {isEditing && (
                <VStack spacing={2} align="stretch">
                  <Button
                    size="sm"
                    leftIcon={<Upload size={16} />}
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    Загрузить фото
                  </Button>
                  {editProfile.avatar && (
                    <Button
                      size="sm"
                      leftIcon={<X size={16} />}
                      onClick={handleRemoveAvatar}
                      variant="ghost"
                      colorScheme="red"
                    >
                      Удалить
                    </Button>
                  )}
                  <Text fontSize="xs" color="gray.500">
                    JPG, PNG до 5MB
                  </Text>
                </VStack>
              )}
            </HStack>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
          </Box>

          <Divider />

          {/* Основные поля */}
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Полное имя
              </FormLabel>
              <Input
                value={isEditing ? editProfile.fullName : profile.fullName}
                onChange={(e) => isEditing && setEditProfile(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Введите ваше полное имя"
                isReadOnly={!isEditing}
                bg={isEditing ? "white" : "gray.50"}
                _dark={{
                  bg: isEditing ? "gray.800" : "gray.700"
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Email адрес
              </FormLabel>
              <Input
                type="email"
                value={isEditing ? editProfile.email : profile.email}
                onChange={(e) => isEditing && setEditProfile(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
                isReadOnly={!isEditing}
                bg={isEditing ? "white" : "gray.50"}
                _dark={{
                  bg: isEditing ? "gray.800" : "gray.700"
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold">
                О себе
              </FormLabel>
              <Textarea
                value={isEditing ? editProfile.bio : profile.bio}
                onChange={(e) => isEditing && setEditProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Расскажите о себе..."
                isReadOnly={!isEditing}
                bg={isEditing ? "white" : "gray.50"}
                _dark={{
                  bg: isEditing ? "gray.800" : "gray.700"
                }}
                rows={4}
              />
            </FormControl>
          </VStack>

          <Divider />

          {/* Кнопки действий */}
          <HStack justify="flex-end" spacing={3}>
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                >
                  Отмена
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleSave}
                >
                  Сохранить изменения
                </Button>
              </>
            ) : (
              <Button
                colorScheme="blue"
                onClick={() => setIsEditing(true)}
              >
                Редактировать профиль
              </Button>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}