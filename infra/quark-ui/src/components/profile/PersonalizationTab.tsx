'use client';

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  HStack,
  Switch,
  Textarea,
  VStack,
  Text,
  Select,
  Divider,
  useColorMode,
  Badge,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiEdit2, FiSave, FiX, FiRefreshCw } from 'react-icons/fi';

interface PersonalizationData {
  signature: string;
  displayOnlineStatus: boolean;
  showLastSeen: boolean;
  showReadReceipts: boolean;
  language: string;
  timezone: string;
  theme: string;
  notifications: {
    email: boolean;
    push: boolean;
    mentions: boolean;
    replies: boolean;
  };
}

const defaultData: PersonalizationData = {
  signature: '',
  displayOnlineStatus: true,
  showLastSeen: true,
  showReadReceipts: true,
  language: 'ru',
  timezone: 'Europe/Moscow',
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    mentions: true,
    replies: true,
  },
};

const languages = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
  { value: 'uk', label: 'Українська' },
  { value: 'kz', label: 'Қазақша' },
];

const timezones = [
  { value: 'Europe/Moscow', label: 'Москва (UTC+3)' },
  { value: 'Europe/Kiev', label: 'Киев (UTC+2)' },
  { value: 'Asia/Almaty', label: 'Алматы (UTC+6)' },
  { value: 'Europe/London', label: 'Лондон (UTC+0)' },
  { value: 'America/New_York', label: 'Нью-Йорк (UTC-5)' },
];

const themes = [
  { value: 'system', label: 'Системная' },
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
];

export function PersonalizationTab() {
  const [data, setData] = useState<PersonalizationData>(defaultData);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState<PersonalizationData>(defaultData);
  const { colorMode } = useColorMode();
  const toast = useToast();

  // Загружаем данные из localStorage при монтировании
  useEffect(() => {
    const saved = localStorage.getItem('personalizationData');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setData(parsedData);
        setOriginalData(parsedData);
      } catch (error) {
        console.error('Ошибка парсинга данных персонализации:', error);
      }
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('personalizationData', JSON.stringify(data));
      setOriginalData(data);
      setIsEditing(false);
      toast({
        title: 'Настройки сохранены',
        description: 'Настройки персонализации успешно обновлены',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    setData(originalData);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleReset = () => {
    setData(defaultData);
    setOriginalData(defaultData);
    localStorage.removeItem('personalizationData');
    toast({
      title: 'Настройки сброшены',
      description: 'Все настройки персонализации сброшены к значениям по умолчанию',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Заголовок и действия */}
      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="semibold">
          Персонализация
        </Text>
        <HStack>
          <IconButton
            aria-label="Сбросить настройки"
            icon={<FiRefreshCw />}
            size="sm"
            variant="ghost"
            onClick={handleReset}
            isDisabled={isEditing}
          />
          {isEditing ? (
            <HStack>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<FiX />}
                onClick={handleCancel}
              >
                Отмена
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<FiSave />}
                onClick={handleSave}
              >
                Сохранить
              </Button>
            </HStack>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<FiEdit2 />}
              onClick={handleEdit}
            >
              Редактировать
            </Button>
          )}
        </HStack>
      </HStack>

      {/* Подпись */}
      <Card>
        <CardHeader pb={2}>
          <Text fontWeight="semibold">Подпись</Text>
        </CardHeader>
        <CardBody pt={0}>
          <FormControl>
            <FormLabel fontSize="sm">Автоматическая подпись в сообщениях</FormLabel>
            <Textarea
              value={data.signature}
              onChange={(e) => setData({ ...data, signature: e.target.value })}
              placeholder="Введите вашу подпись..."
              resize="vertical"
              minH="100px"
              isReadOnly={!isEditing}
              bg={isEditing ? undefined : colorMode === 'dark' ? 'whiteAlpha.50' : 'blackAlpha.50'}
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              Максимум 500 символов. Подпись будет автоматически добавляться к вашим сообщениям.
            </Text>
          </FormControl>
        </CardBody>
      </Card>

      {/* Приватность и отображение */}
      <Card>
        <CardHeader pb={2}>
          <Text fontWeight="semibold">Приватность и отображение</Text>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={4} align="stretch">
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="online-status" mb={0} flex={1}>
                <Text fontSize="sm">Показывать статус «онлайн»</Text>
                <Text fontSize="xs" color="gray.500">
                  Другие пользователи смогут видеть, когда вы находитесь в сети
                </Text>
              </FormLabel>
              <Switch
                id="online-status"
                isChecked={data.displayOnlineStatus}
                onChange={(e) => setData({ ...data, displayOnlineStatus: e.target.checked })}
                isDisabled={!isEditing}
              />
            </FormControl>

            <Divider />

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="last-seen" mb={0} flex={1}>
                <Text fontSize="sm">Показывать время последнего входа</Text>
                <Text fontSize="xs" color="gray.500">
                  Отображение времени вашего последнего посещения
                </Text>
              </FormLabel>
              <Switch
                id="last-seen"
                isChecked={data.showLastSeen}
                onChange={(e) => setData({ ...data, showLastSeen: e.target.checked })}
                isDisabled={!isEditing}
              />
            </FormControl>

            <Divider />

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="read-receipts" mb={0} flex={1}>
                <Text fontSize="sm">Уведомления о прочтении</Text>
                <Text fontSize="xs" color="gray.500">
                  Отправлять и получать уведомления о прочтении сообщений
                </Text>
              </FormLabel>
              <Switch
                id="read-receipts"
                isChecked={data.showReadReceipts}
                onChange={(e) => setData({ ...data, showReadReceipts: e.target.checked })}
                isDisabled={!isEditing}
              />
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {/* Язык и регион */}
      <Card>
        <CardHeader pb={2}>
          <HStack>
            <Text fontWeight="semibold">Язык и регион</Text>
            <Badge colorScheme="blue" size="sm">Требует перезагрузки</Badge>
          </HStack>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel fontSize="sm">Язык интерфейса</FormLabel>
              <Select
                value={data.language}
                onChange={(e) => setData({ ...data, language: e.target.value })}
                isDisabled={!isEditing}
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Часовой пояс</FormLabel>
              <Select
                value={data.timezone}
                onChange={(e) => setData({ ...data, timezone: e.target.value })}
                isDisabled={!isEditing}
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Тема оформления</FormLabel>
              <Select
                value={data.theme}
                onChange={(e) => setData({ ...data, theme: e.target.value })}
                isDisabled={!isEditing}
              >
                {themes.map((theme) => (
                  <option key={theme.value} value={theme.value}>
                    {theme.label}
                  </option>
                ))}
              </Select>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {/* Уведомления */}
      <Card>
        <CardHeader pb={2}>
          <Text fontWeight="semibold">Уведомления</Text>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={4} align="stretch">
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="email-notifications" mb={0} flex={1}>
                <Text fontSize="sm">Email уведомления</Text>
                <Text fontSize="xs" color="gray.500">
                  Получать уведомления на электронную почту
                </Text>
              </FormLabel>
              <Switch
                id="email-notifications"
                isChecked={data.notifications.email}
                onChange={(e) => setData({ 
                  ...data, 
                  notifications: { ...data.notifications, email: e.target.checked }
                })}
                isDisabled={!isEditing}
              />
            </FormControl>

            <Divider />

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="push-notifications" mb={0} flex={1}>
                <Text fontSize="sm">Push уведомления</Text>
                <Text fontSize="xs" color="gray.500">
                  Получать push-уведомления в браузере
                </Text>
              </FormLabel>
              <Switch
                id="push-notifications"
                isChecked={data.notifications.push}
                onChange={(e) => setData({ 
                  ...data, 
                  notifications: { ...data.notifications, push: e.target.checked }
                })}
                isDisabled={!isEditing}
              />
            </FormControl>

            <Divider />

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="mentions-notifications" mb={0} flex={1}>
                <Text fontSize="sm">Упоминания</Text>
                <Text fontSize="xs" color="gray.500">
                  Уведомления при упоминании в сообщениях
                </Text>
              </FormLabel>
              <Switch
                id="mentions-notifications"
                isChecked={data.notifications.mentions}
                onChange={(e) => setData({ 
                  ...data, 
                  notifications: { ...data.notifications, mentions: e.target.checked }
                })}
                isDisabled={!isEditing}
              />
            </FormControl>

            <Divider />

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="replies-notifications" mb={0} flex={1}>
                <Text fontSize="sm">Ответы на сообщения</Text>
                <Text fontSize="xs" color="gray.500">
                  Уведомления при ответах на ваши сообщения
                </Text>
              </FormLabel>
              <Switch
                id="replies-notifications"
                isChecked={data.notifications.replies}
                onChange={(e) => setData({ 
                  ...data, 
                  notifications: { ...data.notifications, replies: e.target.checked }
                })}
                isDisabled={!isEditing}
              />
            </FormControl>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}