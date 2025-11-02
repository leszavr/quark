"use client";

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorMode,
} from "@chakra-ui/react";
import { useState } from "react";
import { 
  FiSend, 
  FiPhone, 
  FiMail, 
  FiMessageCircle, 
  FiClock, 
  FiHelpCircle,
  FiAlertTriangle,
  FiTool,
} from "react-icons/fi";

interface SupportTicket {
  subject: string;
  category: string;
  priority: string;
  description: string;
  email: string;
}

const categories = [
  { value: "technical", label: "Техническая проблема" },
  { value: "account", label: "Проблемы с аккаунтом" },
  { value: "feature", label: "Предложение улучшений" },
  { value: "billing", label: "Вопросы по оплате" },
  { value: "other", label: "Другое" },
];

const priorities = [
  { value: "low", label: "Низкий" },
  { value: "medium", label: "Средний" },
  { value: "high", label: "Высокий" },
  { value: "urgent", label: "Критический" },
];

const faqItems = [
  {
    question: "Как изменить пароль?",
    answer: "Перейдите в раздел \"Безопасность\" в настройках профиля и нажмите \"Изменить пароль\". Следуйте инструкциям на экране.",
  },
  {
    question: "Как загрузить аватар?",
    answer: "В разделе \"Основная информация\" нажмите на текущий аватар или кнопку \"Загрузить фото\". Выберите изображение размером не более 5 МБ.",
  },
  {
    question: "Почему я не получаю уведомления?",
    answer: "Проверьте настройки уведомлений в разделе \"Персонализация\". Убедитесь, что браузер не блокирует уведомления от сайта.",
  },
  {
    question: "Как удалить аккаунт?",
    answer: "Удаление аккаунта находится в разделе \"Danger Zone\". Это действие необратимо и требует подтверждения.",
  },
];

export function SupportTab() {
  const [ticket, setTicket] = useState<SupportTicket>({
    subject: "",
    category: "",
    priority: "medium",
    description: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colorMode } = useColorMode();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticket.subject.trim() || !ticket.category || !ticket.description.trim() || !ticket.email.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Имитируем отправку на сервер
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Сохраняем в localStorage для демонстрации
      const tickets = JSON.parse(localStorage.getItem("supportTickets") || "[]");
      const newTicket = {
        ...ticket,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      tickets.push(newTicket);
      localStorage.setItem("supportTickets", JSON.stringify(tickets));
      
      toast({
        title: "Обращение отправлено",
        description: "Мы получили ваше сообщение и ответим в ближайшее время",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Очищаем форму
      setTicket({
        subject: "",
        category: "",
        priority: "medium",
        description: "",
        email: "",
      });
    } catch (error) {
      toast({
        title: "Ошибка отправки",
        description: "Не удалось отправить обращение. Попробуйте позже.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Контакты поддержки */}
      <Card>
        <CardHeader pb={2}>
          <Text fontWeight="semibold">Контакты службы поддержки</Text>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={3} align="stretch">
            <HStack spacing={3}>
              <Icon as={FiMail} color="blue.500" />
              <Box>
                <Text fontSize="sm" fontWeight="medium">Email</Text>
                <Text fontSize="sm" color="gray.500">support@quark-ui.com</Text>
              </Box>
            </HStack>
            
            <HStack spacing={3}>
              <Icon as={FiPhone} color="green.500" />
              <Box>
                <Text fontSize="sm" fontWeight="medium">Телефон</Text>
                <Text fontSize="sm" color="gray.500">+7 (800) 555-0123</Text>
              </Box>
            </HStack>
            
            <HStack spacing={3}>
              <Icon as={FiClock} color="orange.500" />
              <Box>
                <Text fontSize="sm" fontWeight="medium">Время работы</Text>
                <Text fontSize="sm" color="gray.500">Пн-Пт: 9:00 - 18:00 (МСК)</Text>
              </Box>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Форма обращения */}
      <Card>
        <CardHeader pb={2}>
          <HStack justify="space-between">
            <Text fontWeight="semibold">Новое обращение</Text>
            <Badge colorScheme="blue" variant="subtle">
              <Icon as={FiMessageCircle} mr={1} />
              Форма обратной связи
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody pt={0}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              {/* Email и тема */}
              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Email для ответа</FormLabel>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={ticket.email}
                    onChange={(e) => setTicket({ ...ticket, email: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm">Тема обращения</FormLabel>
                  <Input
                    placeholder="Кратко опишите проблему"
                    value={ticket.subject}
                    onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                  />
                </FormControl>
              </HStack>

              {/* Категория и приоритет */}
              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Категория</FormLabel>
                  <Select
                    placeholder="Выберите категорию"
                    value={ticket.category}
                    onChange={(e) => setTicket({ ...ticket, category: e.target.value })}
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Приоритет</FormLabel>
                  <Select
                    value={ticket.priority}
                    onChange={(e) => setTicket({ ...ticket, priority: e.target.value })}
                  >
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>

              {/* Описание проблемы */}
              <FormControl isRequired>
                <FormLabel fontSize="sm">Подробное описание</FormLabel>
                <Textarea
                  placeholder="Детально опишите вашу проблему или вопрос..."
                  minH="120px"
                  resize="vertical"
                  value={ticket.description}
                  onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Чем подробнее описание, тем быстрее мы сможем помочь
                </Text>
              </FormControl>

              {/* Превью выбранной категории */}
              {ticket.category && (
                <Alert status="info" variant="subtle">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="sm">
                      {categories.find(c => c.value === ticket.category)?.label}
                    </AlertTitle>
                    <AlertDescription fontSize="xs">
                      Среднее время ответа: {ticket.category === "urgent" ? "2-4 часа" : 
                                           ticket.category === "technical" ? "1-2 дня" : "2-3 дня"}
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

              {/* Кнопка отправки */}
              <Button
                type="submit"
                colorScheme="blue"
                leftIcon={<FiSend />}
                isLoading={isSubmitting}
                loadingText="Отправка..."
                size="lg"
                alignSelf="flex-start"
              >
                Отправить обращение
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader pb={2}>
          <Text fontWeight="semibold">Часто задаваемые вопросы</Text>
        </CardHeader>
        <CardBody pt={0}>
          <Accordion allowMultiple>
            {faqItems.map((item, index) => (
              <AccordionItem key={index} border="none">
                <AccordionButton
                  _hover={{ bg: colorMode === "dark" ? "whiteAlpha.100" : "blackAlpha.50" }}
                  borderRadius="md"
                  px={3}
                >
                  <Box flex="1" textAlign="left">
                    <Text fontSize="sm" fontWeight="medium">{item.question}</Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} pt={2} px={3}>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                    {item.answer}
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </CardBody>
      </Card>
    </VStack>
  );
}