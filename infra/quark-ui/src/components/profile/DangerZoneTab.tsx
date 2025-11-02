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
  VStack,
  Text,
  useToast,
  Badge,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Checkbox,
  Progress,
  List,
  ListItem,
  ListIcon,
  Divider,
  useColorMode,
  Code,
} from "@chakra-ui/react";
import { useState } from "react";
import { 
  FiTrash2, 
  FiAlertTriangle, 
  FiShield,
  FiDatabase,
  FiMessageSquare,
  FiImage,
  FiDownload,
  FiClock,
  FiXCircle,
  FiCheckCircle
} from "react-icons/fi";

interface DeletionStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: React.ComponentType<{ size?: number }>
}

const CONFIRMATION_TEXT = "DELETE MY ACCOUNT";
const DELETION_STEPS: DeletionStep[] = [
  {
    id: "backup",
    title: "Экспорт данных",
    description: "Скачайте все ваши данные перед удалением",
    completed: false,
    icon: FiDownload,
  },
  {
    id: "confirmation",
    title: "Подтверждение",
    description: "Введите код подтверждения",
    completed: false,
    icon: FiShield,
  },
  {
    id: "understanding",
    title: "Понимание последствий",
    description: "Подтвердите понимание необратимости действия",
    completed: false,
    icon: FiAlertTriangle,
  },
];

export function DangerZoneTab() {
  const [confirmationText, setConfirmationText] = useState("");
  const [password, setPassword] = useState("");
  const [deletionSteps, setDeletionSteps] = useState<DeletionStep[]>(DELETION_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isDataExported, setIsDataExported] = useState(false);
  const [understandingChecks, setUnderstandingChecks] = useState({
    permanent: false,
    dataLoss: false,
    noRecovery: false,
    contactSupport: false,
  });
  
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Проверка готовности к удалению
  const isReadyToDelete = 
    confirmationText === CONFIRMATION_TEXT &&
    password.length >= 8 &&
    Object.values(understandingChecks).every(Boolean) &&
    isDataExported;

  // Экспорт данных (имитация)
  const handleDataExport = async () => {
    try {
      // Имитируем экспорт данных
      const userData = {
        profile: JSON.parse(localStorage.getItem("profileData") || "{}"),
        personalization: JSON.parse(localStorage.getItem("personalizationData") || "{}"),
        security: JSON.parse(localStorage.getItem("securitySettings") || "{}"),
        support: JSON.parse(localStorage.getItem("supportTickets") || "[]"),
        exportDate: new Date().toISOString(),
      };

      // Создаем и скачиваем файл
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quark-ui-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsDataExported(true);
      toast({
        title: "Данные экспортированы",
        description: "Файл с вашими данными загружен",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Начало процедуры удаления
  const startDeletion = () => {
    if (!isReadyToDelete) {
      toast({
        title: "Не все требования выполнены",
        description: "Пожалуйста, выполните все необходимые шаги",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    onOpen();
  };

  // Финальное подтверждение удаления
  const confirmDeletion = async () => {
    setIsDeleting(true);
    setCountdown(10);

    // Обратный отсчет
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          executeDeletion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Выполнение удаления
  const executeDeletion = async () => {
    try {
      // Имитируем удаление аккаунта
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Очищаем все данные из localStorage
      localStorage.clear();
      
      toast({
        title: "Аккаунт удален",
        description: "Ваш аккаунт был безвозвратно удален",
        status: "info",
        duration: 5000,
        isClosable: true,
      });

      // В реальном приложении здесь был бы редирект на главную страницу
      onClose();
      
      // Имитируем выход из системы
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Ошибка удаления",
        description: "Не удалось удалить аккаунт",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Отмена удаления
  const cancelDeletion = () => {
    setIsDeleting(false);
    setCountdown(0);
    onClose();
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Предупреждение */}
      <Alert status="error" variant="left-accent">
        <AlertIcon as={FiAlertTriangle} />
        <Box>
          <AlertTitle fontSize="sm">
            Опасная зона
          </AlertTitle>
          <AlertDescription fontSize="xs">
            Действия в этом разделе необратимы. Будьте очень осторожны.
          </AlertDescription>
        </Box>
      </Alert>

      {/* Информация о последствиях */}
      <Card borderColor="red.200" _dark={{ borderColor: "red.800" }}>
        <CardHeader pb={2}>
          <HStack justify="space-between">
            <Text fontWeight="semibold" color="red.600" _dark={{ color: "red.400" }}>
              Что произойдет при удалении аккаунта
            </Text>
            <Badge colorScheme="red" variant="subtle">
              Необратимо
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody pt={0}>
          <List spacing={2}>
            <ListItem fontSize="sm">
              <ListIcon as={FiDatabase} color="red.500" />
              Все ваши данные будут безвозвратно удалены
            </ListItem>
            <ListItem fontSize="sm">
              <ListIcon as={FiMessageSquare} color="red.500" />
              История сообщений и обращений будет утеряна
            </ListItem>
            <ListItem fontSize="sm">
              <ListIcon as={FiImage} color="red.500" />
              Загруженные файлы и изображения будут удалены
            </ListItem>
            <ListItem fontSize="sm">
              <ListIcon as={FiXCircle} color="red.500" />
              Восстановление аккаунта будет невозможно
            </ListItem>
          </List>
        </CardBody>
      </Card>

      {/* Шаги подготовки к удалению */}
      <Card>
        <CardHeader pb={2}>
          <Text fontWeight="semibold">Подготовка к удалению</Text>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={4} align="stretch">
            {/* Экспорт данных */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <HStack>
                  <Icon as={FiDownload} color={isDataExported ? "green.500" : "gray.500"} />
                  <Text fontSize="sm" fontWeight="medium">1. Экспорт ваших данных</Text>
                  {isDataExported && <Icon as={FiCheckCircle} color="green.500" />}
                </HStack>
                <Button
                  size="sm"
                  variant={isDataExported ? "solid" : "outline"}
                  colorScheme={isDataExported ? "green" : "blue"}
                  leftIcon={<FiDownload />}
                  onClick={handleDataExport}
                  isDisabled={isDataExported}
                >
                  {isDataExported ? "Экспортировано" : "Экспортировать"}
                </Button>
              </HStack>
              <Text fontSize="xs" color="gray.500" ml={6}>
                Скачайте все ваши данные в формате JSON
              </Text>
            </Box>

            <Divider />

            {/* Понимание последствий */}
            <Box>
              <HStack mb={2}>
                <Icon as={FiAlertTriangle} color="orange.500" />
                <Text fontSize="sm" fontWeight="medium">2. Подтверждение понимания</Text>
              </HStack>
              <VStack spacing={2} align="stretch" ml={6}>
                <Checkbox
                  isChecked={understandingChecks.permanent}
                  onChange={(e) => setUnderstandingChecks({
                    ...understandingChecks,
                    permanent: e.target.checked
                  })}
                  fontSize="xs"
                >
                  Я понимаю, что удаление аккаунта необратимо
                </Checkbox>
                <Checkbox
                  isChecked={understandingChecks.dataLoss}
                  onChange={(e) => setUnderstandingChecks({
                    ...understandingChecks,
                    dataLoss: e.target.checked
                  })}
                  fontSize="xs"
                >
                  Я понимаю, что все данные будут потеряны
                </Checkbox>
                <Checkbox
                  isChecked={understandingChecks.noRecovery}
                  onChange={(e) => setUnderstandingChecks({
                    ...understandingChecks,
                    noRecovery: e.target.checked
                  })}
                  fontSize="xs"
                >
                  Я понимаю, что восстановление невозможно
                </Checkbox>
                <Checkbox
                  isChecked={understandingChecks.contactSupport}
                  onChange={(e) => setUnderstandingChecks({
                    ...understandingChecks,
                    contactSupport: e.target.checked
                  })}
                  fontSize="xs"
                >
                  Я связался с поддержкой, если у меня были вопросы
                </Checkbox>
              </VStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Форма удаления */}
      <Card borderColor="red.300" _dark={{ borderColor: "red.700" }}>
        <CardHeader pb={2} bg="red.50" _dark={{ bg: "red.900" }}>
          <HStack>
            <Icon as={FiTrash2} color="red.500" />
            <Text fontWeight="semibold" color="red.600" _dark={{ color: "red.400" }}>
              Удаление аккаунта
            </Text>
          </HStack>
        </CardHeader>
        <CardBody pt={4}>
          <VStack spacing={4} align="stretch">
            {/* Текстовое подтверждение */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">
                Введите <Code colorScheme="red">{CONFIRMATION_TEXT}</Code> для подтверждения
              </FormLabel>
              <Input
                placeholder={CONFIRMATION_TEXT}
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                borderColor={confirmationText === CONFIRMATION_TEXT ? "green.300" : "red.300"}
                _focus={{
                  borderColor: confirmationText === CONFIRMATION_TEXT ? "green.500" : "red.500"
                }}
              />
            </FormControl>

            {/* Пароль для подтверждения */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">
                Введите ваш пароль для подтверждения
              </FormLabel>
              <Input
                type="password"
                placeholder="Ваш пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                borderColor={password.length >= 8 ? "green.300" : "red.300"}
              />
            </FormControl>

            {/* Индикатор готовности */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Готовность к удалению
              </Text>
              <Progress 
                value={isReadyToDelete ? 100 : 0}
                colorScheme={isReadyToDelete ? "red" : "gray"}
                size="sm"
                borderRadius="md"
              />
            </Box>

            {/* Кнопка удаления */}
            <Button
              colorScheme="red"
              variant="solid"
              leftIcon={<FiTrash2 />}
              onClick={startDeletion}
              isDisabled={!isReadyToDelete}
              size="lg"
              _hover={{
                bg: isReadyToDelete ? "red.600" : undefined
              }}
            >
              Удалить аккаунт навсегда
            </Button>

            {!isReadyToDelete && (
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Выполните все требования выше для активации кнопки удаления
              </Text>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Модальное окно финального подтверждения */}
      <Modal 
        isOpen={isOpen} 
        onClose={cancelDeletion}
        isCentered
        closeOnOverlayClick={!isDeleting}
        closeOnEsc={!isDeleting}
      >
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent>
          <ModalHeader color="red.500">
            <HStack>
              <Icon as={FiAlertTriangle} />
              <Text>Последнее предупреждение</Text>
            </HStack>
          </ModalHeader>
          {!isDeleting && <ModalCloseButton />}
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {countdown > 0 ? (
                <>
                  <Text textAlign="center">
                    Удаление аккаунта начнется через:
                  </Text>
                  <Text 
                    fontSize="3xl" 
                    fontWeight="bold" 
                    textAlign="center"
                    color="red.500"
                  >
                    {countdown}
                  </Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Закройте это окно для отмены
                  </Text>
                </>
              ) : isDeleting ? (
                <>
                  <Text textAlign="center" fontWeight="medium">
                    Удаляем ваш аккаунт...
                  </Text>
                  <Progress isIndeterminate colorScheme="red" />
                </>
              ) : (
                <>
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription>
                      Это действие нельзя отменить. Ваш аккаунт и все данные будут безвозвратно удалены.
                    </AlertDescription>
                  </Alert>
                  <Text fontSize="sm" textAlign="center">
                    Вы уверены, что хотите продолжить?
                  </Text>
                </>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            {countdown === 0 && !isDeleting && (
              <HStack spacing={3}>
                <Button variant="ghost" onClick={cancelDeletion}>
                  Отмена
                </Button>
                <Button 
                  colorScheme="red" 
                  onClick={confirmDeletion}
                  leftIcon={<FiTrash2 />}
                >
                  Да, удалить аккаунт
                </Button>
              </HStack>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}