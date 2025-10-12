'use client';

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  FormHelperText,
  HStack,
  Input,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Switch,
  Textarea,
  VStack,
  Text,
  useToast,
  Badge,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorMode,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { 
  FiSave, 
  FiCpu, 
  FiSettings,
  FiZap,
  FiTarget,
  FiMessageSquare,
  FiEdit3,
  FiRefreshCw,
  FiChevronRight
} from 'react-icons/fi';

interface AISettings {
  // Основные настройки
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  
  // Персональность и стиль
  personality: string;
  writingStyle: string;
  tone: string;
  language: string;
  
  // Системные промпты
  systemPrompt: string;
  postPrompt: string;
  chatPrompt: string;
  
  // Дополнительные настройки
  useContext: boolean;
  maxContextLength: number;
  streaming: boolean;
  autoSuggestions: boolean;
  
  // Модерация
  contentFiltering: boolean;
  safetyLevel: string;
}

const defaultSettings: AISettings = {
  model: 'gpt-4-turbo',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  
  personality: 'professional',
  writingStyle: 'clear',
  tone: 'friendly',
  language: 'ru',
  
  systemPrompt: 'Ты - полезный AI ассистент, который помогает создавать качественный контент.',
  postPrompt: 'Помоги создать интересный и информативный пост на заданную тему.',
  chatPrompt: 'Отвечай естественно и дружелюбно, как опытный собеседник.',
  
  useContext: true,
  maxContextLength: 4000,
  streaming: true,
  autoSuggestions: true,
  
  contentFiltering: true,
  safetyLevel: 'moderate',
};

const models = [
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Recommended)', description: 'Самая мощная модель' },
  { value: 'gpt-4', label: 'GPT-4', description: 'Высокое качество' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Быстро и экономично' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus', description: 'Отлично для творчества' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', description: 'Сбалансированный выбор' },
];

const personalities = [
  { value: 'professional', label: 'Профессиональный', description: 'Деловой и точный' },
  { value: 'creative', label: 'Творческий', description: 'Креативный и вдохновляющий' },
  { value: 'casual', label: 'Неформальный', description: 'Дружелюбный и простой' },
  { value: 'expert', label: 'Экспертный', description: 'Глубокие знания и анализ' },
  { value: 'humorous', label: 'С юмором', description: 'Легкий и остроумный' },
];

const writingStyles = [
  { value: 'clear', label: 'Ясный' },
  { value: 'detailed', label: 'Подробный' },
  { value: 'concise', label: 'Краткий' },
  { value: 'academic', label: 'Академический' },
  { value: 'conversational', label: 'Разговорный' },
];

const tones = [
  { value: 'friendly', label: 'Дружелюбный' },
  { value: 'formal', label: 'Формальный' },
  { value: 'enthusiastic', label: 'Восторженный' },
  { value: 'calm', label: 'Спокойный' },
  { value: 'authoritative', label: 'Авторитетный' },
];

const safetyLevels = [
  { value: 'strict', label: 'Строгий', description: 'Максимальная фильтрация' },
  { value: 'moderate', label: 'Умеренный', description: 'Сбалансированная фильтрация' },
  { value: 'relaxed', label: 'Свободный', description: 'Минимальная фильтрация' },
];

export function AIAgentTab() {
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [isEditing, setIsEditing] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<AISettings>(defaultSettings);
  const { colorMode } = useColorMode();
  const toast = useToast();

  // Загружаем настройки из localStorage при монтировании
  useEffect(() => {
    const saved = localStorage.getItem('aiSettings');
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        setSettings(parsedSettings);
        setOriginalSettings(parsedSettings);
      } catch (error) {
        console.error('Ошибка парсинга настроек AI:', error);
      }
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('aiSettings', JSON.stringify(settings));
      setOriginalSettings(settings);
      setIsEditing(false);
      toast({
        title: 'Настройки AI сохранены',
        description: 'Новые параметры агента будут применены для следующих запросов',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Ошибка сохранения',
        description: 'Не удалось сохранить настройки AI',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCancel = () => {
    setSettings(originalSettings);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setOriginalSettings(defaultSettings);
    localStorage.removeItem('aiSettings');
    toast({
      title: 'Настройки сброшены',
      description: 'Все параметры AI агента восстановлены по умолчанию',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const getModelDescription = (modelValue: string) => {
    return models.find(m => m.value === modelValue)?.description || '';
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Заголовок и действия */}
      <HStack justify="space-between">
        <HStack>
          <Icon as={FiCpu} color="blue.500" />
          <Text fontSize="lg" fontWeight="semibold">
            Настройки AI Агента
          </Text>
        </HStack>
        <HStack>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<FiRefreshCw />}
            onClick={handleReset}
            isDisabled={isEditing}
          >
            Сбросить
          </Button>
          {isEditing ? (
            <HStack>
              <Button
                size="sm"
                variant="ghost"
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
              leftIcon={<FiSettings />}
              onClick={handleEdit}
            >
              Редактировать
            </Button>
          )}
        </HStack>
      </HStack>

      {/* Информация о текущих настройках */}
      <Alert status="info" variant="subtle">
        <AlertIcon as={FiCpu} />
        <Box>
          <AlertTitle fontSize="sm">
            Текущая конфигурация AI агента
          </AlertTitle>
          <AlertDescription fontSize="xs">
            Модель: {models.find(m => m.value === settings.model)?.label} • 
            Температура: {settings.temperature} • 
            Стиль: {personalities.find(p => p.value === settings.personality)?.label}
          </AlertDescription>
        </Box>
      </Alert>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab fontSize="sm">
            <Icon as={FiZap} mr={2} />
            Модель и параметры
          </Tab>
          <Tab fontSize="sm">
            <Icon as={FiTarget} mr={2} />
            Персональность
          </Tab>
          <Tab fontSize="sm">
            <Icon as={FiMessageSquare} mr={2} />
            Промпты
          </Tab>
          <Tab fontSize="sm">
            <Icon as={FiSettings} mr={2} />
            Дополнительно
          </Tab>
        </TabList>

        <TabPanels>
          {/* Вкладка: Модель и параметры */}
          <TabPanel px={0}>
            <VStack spacing={4} align="stretch">
              {/* Модель AI */}
              <Card>
                <CardHeader pb={2}>
                  <Text fontWeight="semibold">Модель AI</Text>
                </CardHeader>
                <CardBody pt={0}>
                  <FormControl>
                    <Select
                      value={settings.model}
                      onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                      isDisabled={!isEditing}
                    >
                      {models.map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </Select>
                    <FormHelperText>
                      {getModelDescription(settings.model)}
                    </FormHelperText>
                  </FormControl>
                </CardBody>
              </Card>

              {/* Температура */}
              <Card>
                <CardHeader pb={2}>
                  <Text fontWeight="semibold">Креативность (Температура)</Text>
                </CardHeader>
                <CardBody pt={0}>
                  <FormControl>
                    <Box px={3}>
                      <Slider
                        value={settings.temperature}
                        onChange={(value) => setSettings({ ...settings, temperature: value })}
                        min={0}
                        max={2}
                        step={0.1}
                        isDisabled={!isEditing}
                      >
                        <SliderMark value={0} mt={2} ml={-2} fontSize="xs">0</SliderMark>
                        <SliderMark value={1} mt={2} ml={-2} fontSize="xs">1</SliderMark>
                        <SliderMark value={2} mt={2} ml={-2} fontSize="xs">2</SliderMark>
                        <SliderMark 
                          value={settings.temperature} 
                          textAlign="center" 
                          bg="blue.500" 
                          color="white" 
                          mt="-10" 
                          ml="-5" 
                          w="12"
                          borderRadius="md"
                          fontSize="sm"
                        >
                          {settings.temperature}
                        </SliderMark>
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </Box>
                    <FormHelperText mt={4}>
                      Низкие значения (0-0.3) - более предсказуемо, высокие (0.7-1.5) - более креативно
                    </FormHelperText>
                  </FormControl>
                </CardBody>
              </Card>

              {/* Максимальные токены */}
              <Card>
                <CardHeader pb={2}>
                  <Text fontWeight="semibold">Максимальная длина ответа</Text>
                </CardHeader>
                <CardBody pt={0}>
                  <FormControl>
                    <NumberInput
                      value={settings.maxTokens}
                      onChange={(_, value) => setSettings({ ...settings, maxTokens: value || 1024 })}
                      min={256}
                      max={8192}
                      step={256}
                      isDisabled={!isEditing}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormHelperText>
                      Максимальное количество токенов в ответе (256-8192)
                    </FormHelperText>
                  </FormControl>
                </CardBody>
              </Card>

              {/* Top P */}
              <Card>
                <CardHeader pb={2}>
                  <Text fontWeight="semibold">Top P (Nucleus Sampling)</Text>
                </CardHeader>
                <CardBody pt={0}>
                  <FormControl>
                    <Box px={3}>
                      <Slider
                        value={settings.topP}
                        onChange={(value) => setSettings({ ...settings, topP: value })}
                        min={0.1}
                        max={1}
                        step={0.1}
                        isDisabled={!isEditing}
                      >
                        <SliderMark value={0.1} mt={2} ml={-2} fontSize="xs">0.1</SliderMark>
                        <SliderMark value={1} mt={2} ml={-2} fontSize="xs">1.0</SliderMark>
                        <SliderMark 
                          value={settings.topP} 
                          textAlign="center" 
                          bg="green.500" 
                          color="white" 
                          mt="-10" 
                          ml="-5" 
                          w="12"
                          borderRadius="md"
                          fontSize="sm"
                        >
                          {settings.topP}
                        </SliderMark>
                        <SliderTrack>
                          <SliderFilledTrack bg="green.500" />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </Box>
                    <FormHelperText mt={4}>
                      Контролирует разнообразие ответов. Рекомендуется 0.9 для большинства задач
                    </FormHelperText>
                  </FormControl>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Вкладка: Персональность */}
          <TabPanel px={0}>
            <VStack spacing={4} align="stretch">
              {/* Тип личности */}
              <Card>
                <CardHeader pb={2}>
                  <Text fontWeight="semibold">Тип личности агента</Text>
                </CardHeader>
                <CardBody pt={0}>
                  <FormControl>
                    <Select
                      value={settings.personality}
                      onChange={(e) => setSettings({ ...settings, personality: e.target.value })}
                      isDisabled={!isEditing}
                    >
                      {personalities.map((personality) => (
                        <option key={personality.value} value={personality.value}>
                          {personality.label}
                        </option>
                      ))}
                    </Select>
                    <FormHelperText>
                      {personalities.find(p => p.value === settings.personality)?.description}
                    </FormHelperText>
                  </FormControl>
                </CardBody>
              </Card>

              {/* Стиль письма */}
              <Card>
                <CardHeader pb={2}>
                  <Text fontWeight="semibold">Стиль написания</Text>
                </CardHeader>
                <CardBody pt={0}>
                  <FormControl>
                    <Select
                      value={settings.writingStyle}
                      onChange={(e) => setSettings({ ...settings, writingStyle: e.target.value })}
                      isDisabled={!isEditing}
                    >
                      {writingStyles.map((style) => (
                        <option key={style.value} value={style.value}>
                          {style.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </CardBody>
              </Card>

              {/* Тон общения */}
              <Card>
                <CardHeader pb={2}>
                  <Text fontWeight="semibold">Тон общения</Text>
                </CardHeader>
                <CardBody pt={0}>
                  <FormControl>
                    <Select
                      value={settings.tone}
                      onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
                      isDisabled={!isEditing}
                    >
                      {tones.map((tone) => (
                        <option key={tone.value} value={tone.value}>
                          {tone.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </CardBody>
              </Card>

              {/* Язык */}
              <Card>
                <CardHeader pb={2}>
                  <Text fontWeight="semibold">Предпочитаемый язык</Text>
                </CardHeader>
                <CardBody pt={0}>
                  <FormControl>
                    <Select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      isDisabled={!isEditing}
                    >
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                      <option value="uk">Українська</option>
                      <option value="kz">Қазақша</option>
                    </Select>
                  </FormControl>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Вкладка: Промпты */}
          <TabPanel px={0}>
            <VStack spacing={4} align="stretch">
              {/* Системный промпт */}
              <Card>
                <CardHeader pb={2}>
                  <Text fontWeight="semibold">Системный промпт</Text>
                </CardHeader>
                <CardBody pt={0}>
                  <FormControl>
                    <Textarea
                      value={settings.systemPrompt}
                      onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                      placeholder="Опишите роль и поведение AI агента..."
                      minH="100px"
                      isReadOnly={!isEditing}
                      bg={isEditing ? undefined : colorMode === 'dark' ? 'whiteAlpha.50' : 'blackAlpha.50'}
                    />
                    <FormHelperText>
                      Базовые инструкции для AI агента, определяющие его роль и поведение
                    </FormHelperText>
                  </FormControl>
                </CardBody>
              </Card>

              {/* Промпт для постов */}
              <Card>
                <CardHeader pb={2}>
                  <Text fontWeight="semibold">Промпт для создания постов</Text>
                </CardHeader>
                <CardBody pt={0}>
                  <FormControl>
                    <Textarea
                      value={settings.postPrompt}
                      onChange={(e) => setSettings({ ...settings, postPrompt: e.target.value })}
                      placeholder="Инструкции для создания постов..."
                      minH="80px"
                      isReadOnly={!isEditing}
                      bg={isEditing ? undefined : colorMode === 'dark' ? 'whiteAlpha.50' : 'blackAlpha.50'}
                    />
                    <FormHelperText>
                      Специальные инструкции для генерации постов в социальных сетях
                    </FormHelperText>
                  </FormControl>
                </CardBody>
              </Card>

              {/* Промпт для чата */}
              <Card>
                <CardHeader pb={2}>
                  <Text fontWeight="semibold">Промпт для чата</Text>
                </CardHeader>
                <CardBody pt={0}>
                  <FormControl>
                    <Textarea
                      value={settings.chatPrompt}
                      onChange={(e) => setSettings({ ...settings, chatPrompt: e.target.value })}
                      placeholder="Инструкции для общения в чате..."
                      minH="80px"
                      isReadOnly={!isEditing}
                      bg={isEditing ? undefined : colorMode === 'dark' ? 'whiteAlpha.50' : 'blackAlpha.50'}
                    />
                    <FormHelperText>
                      Инструкции для ответов в чате и диалогах
                    </FormHelperText>
                  </FormControl>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Вкладка: Дополнительные настройки */}
          <TabPanel px={0}>
            <VStack spacing={4} align="stretch">
              {/* Контекст и память */}
              <Card>
                <CardHeader pb={2}>
                  <Text fontWeight="semibold">Контекст и память</Text>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={4} align="stretch">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="use-context" mb={0} flex={1}>
                        <Text fontSize="sm">Использовать контекст предыдущих сообщений</Text>
                        <Text fontSize="xs" color="gray.500">
                          AI будет помнить предыдущие части диалога
                        </Text>
                      </FormLabel>
                      <Switch
                        id="use-context"
                        isChecked={settings.useContext}
                        onChange={(e) => setSettings({ ...settings, useContext: e.target.checked })}
                        isDisabled={!isEditing}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Максимальная длина контекста</FormLabel>
                      <NumberInput
                        value={settings.maxContextLength}
                        onChange={(_, value) => setSettings({ ...settings, maxContextLength: value || 2000 })}
                        min={1000}
                        max={8000}
                        step={500}
                        isDisabled={!isEditing || !settings.useContext}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <FormHelperText>
                        Количество символов контекста для запоминания
                      </FormHelperText>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              {/* Поведение интерфейса */}
              <Card>
                <CardHeader pb={2}>
                  <Text fontWeight="semibold">Поведение интерфейса</Text>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={4} align="stretch">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="streaming" mb={0} flex={1}>
                        <Text fontSize="sm">Потоковый вывод</Text>
                        <Text fontSize="xs" color="gray.500">
                          Показывать ответ по мере генерации
                        </Text>
                      </FormLabel>
                      <Switch
                        id="streaming"
                        isChecked={settings.streaming}
                        onChange={(e) => setSettings({ ...settings, streaming: e.target.checked })}
                        isDisabled={!isEditing}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="auto-suggestions" mb={0} flex={1}>
                        <Text fontSize="sm">Автоподсказки</Text>
                        <Text fontSize="xs" color="gray.500">
                          Предлагать варианты продолжения текста
                        </Text>
                      </FormLabel>
                      <Switch
                        id="auto-suggestions"
                        isChecked={settings.autoSuggestions}
                        onChange={(e) => setSettings({ ...settings, autoSuggestions: e.target.checked })}
                        isDisabled={!isEditing}
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              {/* Безопасность и модерация */}
              <Card>
                <CardHeader pb={2}>
                  <Text fontWeight="semibold">Безопасность и модерация</Text>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={4} align="stretch">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="content-filtering" mb={0} flex={1}>
                        <Text fontSize="sm">Фильтрация контента</Text>
                        <Text fontSize="xs" color="gray.500">
                          Автоматическая проверка на неподходящий контент
                        </Text>
                      </FormLabel>
                      <Switch
                        id="content-filtering"
                        isChecked={settings.contentFiltering}
                        onChange={(e) => setSettings({ ...settings, contentFiltering: e.target.checked })}
                        isDisabled={!isEditing}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Уровень безопасности</FormLabel>
                      <Select
                        value={settings.safetyLevel}
                        onChange={(e) => setSettings({ ...settings, safetyLevel: e.target.value })}
                        isDisabled={!isEditing || !settings.contentFiltering}
                      >
                        {safetyLevels.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </Select>
                      <FormHelperText>
                        {safetyLevels.find(l => l.value === settings.safetyLevel)?.description}
                      </FormHelperText>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}