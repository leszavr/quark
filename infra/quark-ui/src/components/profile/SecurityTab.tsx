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
  InputGroup,
  InputRightElement,
  IconButton,
  VStack,
  Text,
  useToast,
  Badge,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  List,
  ListItem,
  ListIcon,
  Switch,
  Divider,
  useColorMode,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { 
  FiEye, 
  FiEyeOff, 
  FiSave, 
  FiShield, 
  FiLock,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiSmartphone,
  FiClock,
  FiActivity
} from "react-icons/fi";

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: string;
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
  deviceTracking: boolean;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

const defaultSettings: SecuritySettings = {
  twoFactorEnabled: false,
  sessionTimeout: "24",
  loginNotifications: true,
  suspiciousActivityAlerts: true,
  deviceTracking: true,
};

const sessionTimeoutOptions = [
  { value: "1", label: "1 час" },
  { value: "8", label: "8 часов" },
  { value: "24", label: "24 часа" },
  { value: "168", label: "1 неделя" },
  { value: "720", label: "1 месяц" },
];

export function SecurityTab() {
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [settings, setSettings] = useState<SecuritySettings>(defaultSettings);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: "gray",
  });
  
  const { colorMode } = useColorMode();
  const toast = useToast();

  // Загружаем настройки из localStorage при монтировании
  useEffect(() => {
    const savedSettings = localStorage.getItem("securitySettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Ошибка загрузки настроек безопасности:", error);
      }
    }
  }, []);

  // Анализ силы пароля
  const analyzePasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return { score: 0, feedback: [], color: "gray" };
    }

    let score = 0;
    const feedback: string[] = [];

    // Проверка длины
    if (password.length >= 8) {
      score += 20;
    } else {
      feedback.push("Минимум 8 символов");
    }

    // Проверка на прописные буквы
    if (/[A-Z]/.test(password)) {
      score += 20;
    } else {
      feedback.push("Добавьте заглавные буквы");
    }

    // Проверка на строчные буквы
    if (/[a-z]/.test(password)) {
      score += 20;
    } else {
      feedback.push("Добавьте строчные буквы");
    }

    // Проверка на цифры
    if (/\d/.test(password)) {
      score += 20;
    } else {
      feedback.push("Добавьте цифры");
    }

    // Проверка на специальные символы
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      score += 20;
    } else {
      feedback.push("Добавьте спецсимволы");
    }

    let color = "red";
    if (score >= 80) color = "green";
    else if (score >= 60) color = "yellow";
    else if (score >= 40) color = "orange";

    return { score, feedback, color };
  };

  // Обновление анализа пароля
  useEffect(() => {
    setPasswordStrength(analyzePasswordStrength(passwordData.newPassword));
  }, [passwordData.newPassword]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Новые пароли не совпадают",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (passwordStrength.score < 60) {
      toast({
        title: "Слабый пароль",
        description: "Пожалуйста, выберите более надежный пароль",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setIsChangingPassword(true);
    
    try {
      // Имитируем смену пароля
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Сохраняем информацию о смене пароля
      const passwordHistory = JSON.parse(localStorage.getItem("passwordHistory") || "[]");
      passwordHistory.push({
        changedAt: new Date().toISOString(),
        strength: passwordStrength.score,
      });
      localStorage.setItem("passwordHistory", JSON.stringify(passwordHistory));
      
      toast({
        title: "Пароль изменен",
        description: "Ваш пароль успешно обновлен",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Очищаем поля
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить пароль",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSettingsChange = (key: keyof SecuritySettings, value: boolean | string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("securitySettings", JSON.stringify(newSettings));
    
    toast({
      title: "Настройки обновлены",
      description: "Изменения настроек безопасности сохранены",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Смена пароля */}
      <Card>
        <CardHeader pb={2}>
          <HStack justify="space-between">
            <Text fontWeight="semibold">Смена пароля</Text>
            <Badge colorScheme="blue" variant="subtle">
              <Icon as={FiLock} mr={1} />
              Защищено
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody pt={0}>
          <form onSubmit={handlePasswordChange}>
            <VStack spacing={4} align="stretch">
              {/* Текущий пароль */}
              <FormControl isRequired>
                <FormLabel fontSize="sm">Текущий пароль</FormLabel>
                <InputGroup>
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    placeholder="Введите текущий пароль"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ 
                      ...passwordData, 
                      currentPassword: e.target.value 
                    })}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Показать пароль"
                      icon={showPasswords.current ? <FiEyeOff /> : <FiEye />}
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePasswordVisibility("current")}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {/* Новый пароль */}
              <FormControl isRequired>
                <FormLabel fontSize="sm">Новый пароль</FormLabel>
                <InputGroup>
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Введите новый пароль"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ 
                      ...passwordData, 
                      newPassword: e.target.value 
                    })}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Показать пароль"
                      icon={showPasswords.new ? <FiEyeOff /> : <FiEye />}
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePasswordVisibility("new")}
                    />
                  </InputRightElement>
                </InputGroup>
                
                {/* Индикатор силы пароля */}
                {passwordData.newPassword && (
                  <Box mt={2}>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="xs" color="gray.500">Надежность пароля</Text>
                      <Text fontSize="xs" color={`${passwordStrength.color}.500`}>
                        {passwordStrength.score >= 80 ? "Отличный" :
                         passwordStrength.score >= 60 ? "Хороший" :
                         passwordStrength.score >= 40 ? "Средний" : "Слабый"}
                      </Text>
                    </HStack>
                    <Progress 
                      value={passwordStrength.score} 
                      size="sm" 
                      colorScheme={passwordStrength.color}
                      borderRadius="md"
                    />
                    {passwordStrength.feedback.length > 0 && (
                      <List spacing={1} mt={2}>
                        {passwordStrength.feedback.map((item, index) => (
                          <ListItem key={index} fontSize="xs" color="gray.500">
                            <ListIcon as={FiX} color="red.500" />
                            {item}
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                )}
              </FormControl>

              {/* Подтверждение пароля */}
              <FormControl isRequired>
                <FormLabel fontSize="sm">Подтвердите новый пароль</FormLabel>
                <InputGroup>
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Подтвердите новый пароль"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ 
                      ...passwordData, 
                      confirmPassword: e.target.value 
                    })}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Показать пароль"
                      icon={showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePasswordVisibility("confirm")}
                    />
                  </InputRightElement>
                </InputGroup>
                {passwordData.confirmPassword && passwordData.newPassword && 
                 passwordData.confirmPassword !== passwordData.newPassword && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    Пароли не совпадают
                  </Text>
                )}
              </FormControl>

              {/* Кнопка смены пароля */}
              <Button
                type="submit"
                colorScheme="blue"
                leftIcon={<FiSave />}
                isLoading={isChangingPassword}
                loadingText="Изменение пароля..."
                alignSelf="flex-start"
              >
                Изменить пароль
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Card>

      {/* Двухфакторная аутентификация */}
      <Card>
        <CardHeader pb={2}>
          <HStack justify="space-between">
            <Text fontWeight="semibold">Двухфакторная аутентификация</Text>
            <Badge 
              colorScheme={settings.twoFactorEnabled ? "green" : "gray"} 
              variant="subtle"
            >
              {settings.twoFactorEnabled ? "Включена" : "Отключена"}
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={4} align="stretch">
            <Alert status={settings.twoFactorEnabled ? "success" : "warning"} variant="subtle">
              <AlertIcon as={settings.twoFactorEnabled ? FiShield : FiAlertTriangle} />
              <Box>
                <AlertTitle fontSize="sm">
                  {settings.twoFactorEnabled ? "Аккаунт защищен" : "Повысьте безопасность"}
                </AlertTitle>
                <AlertDescription fontSize="xs">
                  {settings.twoFactorEnabled 
                    ? "Двухфакторная аутентификация активна"
                    : "Включите 2FA для дополнительной защиты аккаунта"
                  }
                </AlertDescription>
              </Box>
            </Alert>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="2fa" mb={0} flex={1}>
                <HStack>
                  <Icon as={FiSmartphone} color="blue.500" />
                  <Box>
                    <Text fontSize="sm">Включить 2FA</Text>
                    <Text fontSize="xs" color="gray.500">
                      Дополнительный код из мобильного приложения
                    </Text>
                  </Box>
                </HStack>
              </FormLabel>
              <Switch
                id="2fa"
                isChecked={settings.twoFactorEnabled}
                onChange={(e) => handleSettingsChange("twoFactorEnabled", e.target.checked)}
                colorScheme="blue"
              />
            </FormControl>
          </VStack>
        </CardBody>
      </Card>

      {/* Настройки безопасности */}
      <Card>
        <CardHeader pb={2}>
          <Text fontWeight="semibold">Настройки безопасности</Text>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={4} align="stretch">
            {/* Уведомления о входах */}
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="login-notifications" mb={0} flex={1}>
                <HStack>
                  <Icon as={FiActivity} color="green.500" />
                  <Box>
                    <Text fontSize="sm">Уведомления о входах</Text>
                    <Text fontSize="xs" color="gray.500">
                      Получать email при входе с нового устройства
                    </Text>
                  </Box>
                </HStack>
              </FormLabel>
              <Switch
                id="login-notifications"
                isChecked={settings.loginNotifications}
                onChange={(e) => handleSettingsChange("loginNotifications", e.target.checked)}
              />
            </FormControl>

            <Divider />

            {/* ВРЕМЕННО: Ссылка на админку для разработки */}
            <Box 
              p={4} 
              borderRadius="md" 
              bg="orange.50" 
              border="1px solid"
              borderColor="orange.200"
              _dark={{
                bg: "orange.900",
                borderColor: "orange.700"
              }}
            >
              <HStack justify="space-between">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="orange.700" _dark={{ color: "orange.200" }}>
                    🚧 Режим разработки
                  </Text>
                  <Text fontSize="xs" color="orange.600" _dark={{ color: "orange.300" }}>
                    Доступ к административной панели
                  </Text>
                </Box>
                <Button 
                  as="a" 
                  href="/admin" 
                  size="sm" 
                  colorScheme="orange" 
                  variant="solid"
                  leftIcon={<FiShield />}
                >
                  Admin Panel
                </Button>
              </HStack>
            </Box>

            <Divider />

            {/* Оповещения о подозрительной активности */}
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="suspicious-alerts" mb={0} flex={1}>
                <HStack>
                  <Icon as={FiAlertTriangle} color="orange.500" />
                  <Box>
                    <Text fontSize="sm">Оповещения о подозрительной активности</Text>
                    <Text fontSize="xs" color="gray.500">
                      Уведомления о необычных действиях в аккаунте
                    </Text>
                  </Box>
                </HStack>
              </FormLabel>
              <Switch
                id="suspicious-alerts"
                isChecked={settings.suspiciousActivityAlerts}
                onChange={(e) => handleSettingsChange("suspiciousActivityAlerts", e.target.checked)}
              />
            </FormControl>

            <Divider />

            {/* Отслеживание устройств */}
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="device-tracking" mb={0} flex={1}>
                <HStack>
                  <Icon as={FiSmartphone} color="purple.500" />
                  <Box>
                    <Text fontSize="sm">Отслеживание устройств</Text>
                    <Text fontSize="xs" color="gray.500">
                      Запоминать информацию об используемых устройствах
                    </Text>
                  </Box>
                </HStack>
              </FormLabel>
              <Switch
                id="device-tracking"
                isChecked={settings.deviceTracking}
                onChange={(e) => handleSettingsChange("deviceTracking", e.target.checked)}
              />
            </FormControl>

            <Divider />

            {/* Автовыход */}
            <FormControl>
              <FormLabel fontSize="sm">
                <HStack>
                  <Icon as={FiClock} color="blue.500" />
                  <Text>Автоматический выход из системы</Text>
                </HStack>
              </FormLabel>
              <HStack spacing={4}>
                {sessionTimeoutOptions.map((option) => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={settings.sessionTimeout === option.value ? "solid" : "outline"}
                    colorScheme="blue"
                    onClick={() => handleSettingsChange("sessionTimeout", option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={2}>
                Автоматический выход при бездействии
              </Text>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
}