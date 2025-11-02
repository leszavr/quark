"use client";

import {
  Button,
  ButtonGroup,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useToast,
  Tooltip,
  Badge,
  HStack,
  Text,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  VStack,
  Progress,
  Alert,
  AlertIcon,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { 
  FiCpu, 
  FiChevronDown,
  FiSettings,
  FiZap,
  FiEdit3,
  FiMessageSquare,
  FiFileText,
  FiImage,
  FiMic
} from "react-icons/fi";

interface AIAssistantProps {
  mode: "post" | "chat" | "message";
  onGenerate: (content: string) => void;
  currentContent?: string;
  placeholder?: string;
  disabled?: boolean;
}

interface AISettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  postPrompt: string;
  chatPrompt: string;
  streaming: boolean;
}

const defaultSettings: AISettings = {
  model: "gpt-4-turbo",
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: "Ты - полезный AI ассистент, который помогает создавать качественный контент.",
  postPrompt: "Помоги создать интересный и информативный пост на заданную тему.",
  chatPrompt: "Отвечай естественно и дружелюбно, как опытный собеседник.",
  streaming: true,
};

const quickActions = [
  {
    id: "improve",
    label: "Улучшить текст",
    icon: FiEdit3,
    prompt: "Улучши этот текст, сделай его более читаемым и интересным:"
  },
  {
    id: "shorten",
    label: "Сократить",
    icon: FiZap,
    prompt: "Сократи этот текст, оставив только самое важное:"
  },
  {
    id: "expand",
    label: "Расширить",
    icon: FiFileText,
    prompt: "Расширь этот текст, добавь больше деталей и примеров:"
  },
  {
    id: "tone",
    label: "Изменить тон",
    icon: FiMessageSquare,
    prompt: "Перепиши этот текст в более дружелюбном и позитивном тоне:"
  },
];

export function AIAssistant({ 
  mode, 
  onGenerate, 
  currentContent = "", 
  placeholder = "Опишите что вы хотите создать...",
  disabled = false 
}: AIAssistantProps) {
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [progress, setProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Загружаем настройки AI из localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("aiSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error("Ошибка загрузки настроек AI:", error);
      }
    }
  }, []);

  // Имитация генерации контента AI
  const generateContent = async (customPrompt?: string) => {
    setIsGenerating(true);
    setProgress(0);
    setGeneratedContent("");
    
    try {
      const basePrompt = mode === "post" 
        ? settings.postPrompt 
        : mode === "chat" 
        ? settings.chatPrompt 
        : settings.systemPrompt;
      
      const fullPrompt = customPrompt 
        ? `${customPrompt} ${currentContent}`
        : `${basePrompt} ${prompt}`;

      // Имитируем процесс генерации с прогрессом
      const words = [
        "Анализирую запрос...",
        "Генерирую идеи...",
        "Структурирую контент...",
        "Проверяю качество...",
        "Финализирую текст..."
      ];

      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(((i + 1) / words.length) * 100);
      }

      // Имитируем сгенерированный контент (в реальности здесь был бы API вызов)
      let mockContent = "";
      if (customPrompt?.includes("Улучши")) {
        mockContent = `Улучшенная версия:\n\n${currentContent}\n\nДобавлены улучшения: более четкая структура, живые примеры и эмоциональная окраска текста.`;
      } else if (customPrompt?.includes("Сократи")) {
        mockContent = `Краткая версия: ${currentContent.slice(0, Math.floor(currentContent.length / 2))}...`;
      } else if (customPrompt?.includes("Расширь")) {
        mockContent = `${currentContent}\n\nДополнительные детали:\n• Интересные факты по теме\n• Практические примеры\n• Рекомендации для читателей`;
      } else if (customPrompt?.includes("тон")) {
        mockContent = `✨ ${currentContent.replace(/\./g, "! 😊").replace(/,/g, ", и это здорово,")} ✨`;
      } else {
        mockContent = mode === "post" 
          ? `🚀 Интересный пост по теме "${prompt}"\n\nВведение с крючком для привлечения внимания...\n\nОсновная часть с ценной информацией:\n• Ключевой момент 1\n• Ключевой момент 2\n• Ключевой момент 3\n\nЗаключение с призывом к действию. 💡`
          : mode === "chat"
          ? `Привет! 👋 Отвечаю на твой вопрос: "${prompt}"\n\nВот подробный и полезный ответ с практическими советами и рекомендациями...`
          : `Ответ по теме "${prompt}":\n\nСтруктурированная информация с примерами и объяснениями...`;
      }

      setGeneratedContent(mockContent);

      toast({
        title: "Контент сгенерирован",
        description: `AI создал ${mode === "post" ? "пост" : "сообщение"} на основе ваших настроек`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      toast({
        title: "Ошибка генерации",
        description: "Не удалось сгенерировать контент. Попробуйте еще раз.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Быстрое действие
  const handleQuickAction = (action: typeof quickActions[0]) => {
    if (!currentContent.trim()) {
      toast({
        title: "Нет контента",
        description: "Сначала введите текст для обработки",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    generateContent(action.prompt);
  };

  // Использование сгенерированного контента
  const useGeneratedContent = () => {
    onGenerate(generatedContent);
    setGeneratedContent("");
    setPrompt("");
    onClose();
  };

  // Открытие настроек AI
  const openAISettings = () => {
    window.open("/profile?tab=ai-agent", "_blank");
  };

  const hasAISettings = localStorage.getItem("aiSettings") !== null;

  return (
    <>
      <ButtonGroup isAttached variant="outline">
        <Button
          leftIcon={<FiCpu />}
          onClick={onOpen}
          isDisabled={disabled}
          colorScheme="blue"
          size="sm"
        >
          AI Ассистент
          {!hasAISettings && <Badge ml={2} colorScheme="orange" size="sm">Настроить</Badge>}
        </Button>
        
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<FiChevronDown />}
            isDisabled={disabled}
            size="sm"
            colorScheme="blue"
          />
          <MenuList>
            {currentContent && (
              <>
                <MenuItem fontSize="sm" color="gray.500" fontWeight="semibold" isDisabled>
                  Быстрые действия
                </MenuItem>
                {quickActions.map((action) => (
                  <MenuItem
                    key={action.id}
                    icon={<action.icon />}
                    onClick={() => handleQuickAction(action)}
                    fontSize="sm"
                  >
                    {action.label}
                  </MenuItem>
                ))}
                <MenuDivider />
              </>
            )}
            <MenuItem 
              icon={<FiSettings />} 
              onClick={openAISettings}
              fontSize="sm"
            >
              Настройки AI
            </MenuItem>
          </MenuList>
        </Menu>
      </ButtonGroup>

      {/* Модальное окно AI ассистента */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FiCpu />
              <Text>AI Ассистент</Text>
              <Badge colorScheme="blue" variant="subtle">
                {settings.model}
              </Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {!hasAISettings && (
                <Alert status="warning" size="sm">
                  <AlertIcon />
                  <Box>
                    <Text fontSize="sm">
                      AI агент не настроен. 
                      <Text as="span" cursor="pointer" color="blue.500" onClick={openAISettings} ml={1}>
                        Перейти к настройкам →
                      </Text>
                    </Text>
                  </Box>
                </Alert>
              )}

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Что вы хотите создать?
                </Text>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={placeholder}
                  minH="100px"
                  resize="vertical"
                />
              </Box>

              {isGenerating && (
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <Spinner size="sm" color="blue.500" />
                      <Text fontSize="sm">Генерирую контент...</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.500">
                      {Math.round(progress)}%
                    </Text>
                  </HStack>
                  <Progress 
                    value={progress} 
                    colorScheme="blue" 
                    size="sm" 
                    borderRadius="md"
                  />
                </Box>
              )}

              {generatedContent && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Результат:
                  </Text>
                  <Textarea
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    minH="150px"
                    resize="vertical"
                    bg="blue.50"
                    _dark={{ bg: "blue.900" }}
                  />
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <ButtonGroup>
              <Button variant="ghost" onClick={onClose}>
                Отмена
              </Button>
              
              {generatedContent ? (
                <Button colorScheme="blue" onClick={useGeneratedContent}>
                  Использовать
                </Button>
              ) : (
                <Button 
                  colorScheme="blue" 
                  onClick={() => generateContent()}
                  isDisabled={!prompt.trim() || isGenerating}
                  isLoading={isGenerating}
                  loadingText="Генерирую..."
                >
                  Генерировать
                </Button>
              )}
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}