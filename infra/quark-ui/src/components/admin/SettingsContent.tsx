'use client';

import {
  VStack, HStack, Flex, Text, Button, Card, CardBody, CardHeader,
  Heading, Badge, Grid, Box, Switch, FormControl, FormLabel,
  Input, Select, Textarea, Divider, Alert, AlertIcon,
  Tabs, TabList, TabPanels, Tab, TabPanel, useColorModeValue,
  NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper, IconButton,
  Tooltip, useToast
} from '@chakra-ui/react'
import { useState } from 'react'
import { 
  Settings, Database, Mail, Globe, Palette, Bell,
  Save, RefreshCw, Upload, Download, Server, Code,
  Shield, Key, Clock, Zap, FileText, Archive
} from 'lucide-react'

export function SettingsContent() {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // Общие настройки
  const [siteName, setSiteName] = useState('Quark UI Platform')
  const [siteDescription, setSiteDescription] = useState('Платформа для разработки и развертывания AI-приложений')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [registrationEnabled, setRegistrationEnabled] = useState(true)

  // Настройки уведомлений
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [newsletterEnabled, setNewsletterEnabled] = useState(true)
  const [notificationRetention, setNotificationRetention] = useState(30)

  // Настройки производительности
  const [cacheEnabled, setCacheEnabled] = useState(true)
  const [cacheTimeout, setCacheTimeout] = useState(3600)
  const [compressionEnabled, setCompressionEnabled] = useState(true)
  const [maxFileSize, setMaxFileSize] = useState(50)

  // Email настройки
  const [smtpHost, setSmtpHost] = useState('smtp.example.com')
  const [smtpPort, setSmtpPort] = useState(587)
  const [smtpUser, setSmtpUser] = useState('noreply@example.com')
  const [smtpPassword, setSmtpPassword] = useState('')
  const [emailFrom, setEmailFrom] = useState('Quark UI <noreply@example.com>')

  // API настройки
  const [apiRateLimit, setApiRateLimit] = useState(1000)
  const [apiTimeout, setApiTimeout] = useState(30)
  const [corsEnabled, setCorsEnabled] = useState(true)
  const [allowedOrigins, setAllowedOrigins] = useState('https://example.com, https://app.example.com')

  // База данных
  const [autoBackup, setAutoBackup] = useState(true)
  const [backupInterval, setBackupInterval] = useState(24)
  const [maxBackups, setMaxBackups] = useState(7)
  const [dbOptimization, setDbOptimization] = useState(false)

  const handleSave = async (section: string) => {
    setIsLoading(true)
    try {
      // Имитация сохранения
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: 'Настройки сохранены',
        description: `Раздел "${section}" успешно обновлен`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Ошибка сохранения',
        description: 'Не удалось сохранить настройки',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading size="xl" fontFamily="Space Grotesk">Настройки системы</Heading>
          <Text color="gray.500">Конфигурация и управление параметрами платформы</Text>
        </VStack>
        <HStack>
          <Button leftIcon={<Upload size={18} />} variant="outline">
            Импорт настроек
          </Button>
          <Button leftIcon={<Download size={18} />} variant="outline">
            Экспорт настроек
          </Button>
        </HStack>
      </Flex>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>
            <HStack>
              <Settings size={16} />
              <Text>Общие</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <Mail size={16} />
              <Text>Уведомления</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <Zap size={16} />
              <Text>Производительность</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <Code size={16} />
              <Text>API</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <Database size={16} />
              <Text>База данных</Text>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Общие настройки */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader>
                  <Heading size="md">Основная информация</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Название сайта</FormLabel>
                      <Input 
                        value={siteName} 
                        onChange={(e) => setSiteName(e.target.value)}
                        placeholder="Название вашего сайта"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Описание</FormLabel>
                      <Textarea 
                        value={siteDescription}
                        onChange={(e) => setSiteDescription(e.target.value)}
                        placeholder="Краткое описание платформы"
                        rows={3}
                      />
                    </FormControl>

                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="maintenance" mb="0" flex="1">
                          Режим обслуживания
                        </FormLabel>
                        <Switch 
                          id="maintenance" 
                          isChecked={maintenanceMode}
                          onChange={(e) => setMaintenanceMode(e.target.checked)}
                          colorScheme="orange"
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="registration" mb="0" flex="1">
                          Регистрация новых пользователей
                        </FormLabel>
                        <Switch 
                          id="registration" 
                          isChecked={registrationEnabled}
                          onChange={(e) => setRegistrationEnabled(e.target.checked)}
                          colorScheme="green"
                        />
                      </FormControl>
                    </Grid>
                  </VStack>
                </CardBody>
              </Card>

              {maintenanceMode && (
                <Alert status="warning">
                  <AlertIcon />
                  Внимание! Режим обслуживания активен. Пользователи не смогут получить доступ к системе.
                </Alert>
              )}

              <Flex justify="end">
                <Button 
                  colorScheme="blue" 
                  leftIcon={<Save size={18} />}
                  onClick={() => handleSave('Общие настройки')}
                  isLoading={isLoading}
                >
                  Сохранить изменения
                </Button>
              </Flex>
            </VStack>
          </TabPanel>

          {/* Уведомления */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader>
                  <Heading size="md">Email настройки</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <FormControl>
                        <FormLabel>SMTP хост</FormLabel>
                        <Input 
                          value={smtpHost}
                          onChange={(e) => setSmtpHost(e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>SMTP порт</FormLabel>
                        <NumberInput value={smtpPort} onChange={(value) => setSmtpPort(Number(value))}>
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </Grid>

                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <FormControl>
                        <FormLabel>SMTP пользователь</FormLabel>
                        <Input 
                          value={smtpUser}
                          onChange={(e) => setSmtpUser(e.target.value)}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>SMTP пароль</FormLabel>
                        <Input 
                          type="password"
                          value={smtpPassword}
                          onChange={(e) => setSmtpPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </FormControl>
                    </Grid>

                    <FormControl>
                      <FormLabel>От кого (From)</FormLabel>
                      <Input 
                        value={emailFrom}
                        onChange={(e) => setEmailFrom(e.target.value)}
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size="md">Настройки уведомлений</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="email-notifications" mb="0" flex="1">
                          Email уведомления
                        </FormLabel>
                        <Switch 
                          id="email-notifications" 
                          isChecked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="push-notifications" mb="0" flex="1">
                          Push уведомления
                        </FormLabel>
                        <Switch 
                          id="push-notifications" 
                          isChecked={pushNotifications}
                          onChange={(e) => setPushNotifications(e.target.checked)}
                        />
                      </FormControl>
                    </Grid>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="newsletter" mb="0" flex="1">
                        Рассылка новостей
                      </FormLabel>
                      <Switch 
                        id="newsletter" 
                        isChecked={newsletterEnabled}
                        onChange={(e) => setNewsletterEnabled(e.target.checked)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Хранение уведомлений (дни)</FormLabel>
                      <NumberInput 
                        value={notificationRetention} 
                        onChange={(value) => setNotificationRetention(Number(value))}
                        min={1}
                        max={365}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              <Flex justify="end">
                <Button 
                  colorScheme="blue" 
                  leftIcon={<Save size={18} />}
                  onClick={() => handleSave('Уведомления')}
                  isLoading={isLoading}
                >
                  Сохранить изменения
                </Button>
              </Flex>
            </VStack>
          </TabPanel>

          {/* Производительность */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader>
                  <Heading size="md">Кеширование</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="cache-enabled" mb="0" flex="1">
                        Включить кеширование
                      </FormLabel>
                      <Switch 
                        id="cache-enabled" 
                        isChecked={cacheEnabled}
                        onChange={(e) => setCacheEnabled(e.target.checked)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Время жизни кеша (секунды)</FormLabel>
                      <NumberInput 
                        value={cacheTimeout}
                        onChange={(value) => setCacheTimeout(Number(value))}
                        min={60}
                        max={86400}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size="md">Оптимизация</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="compression" mb="0" flex="1">
                        Сжатие данных (gzip)
                      </FormLabel>
                      <Switch 
                        id="compression" 
                        isChecked={compressionEnabled}
                        onChange={(e) => setCompressionEnabled(e.target.checked)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Максимальный размер файла (МБ)</FormLabel>
                      <NumberInput 
                        value={maxFileSize}
                        onChange={(value) => setMaxFileSize(Number(value))}
                        min={1}
                        max={1000}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              <Flex justify="end">
                <Button 
                  colorScheme="blue" 
                  leftIcon={<Save size={18} />}
                  onClick={() => handleSave('Производительность')}
                  isLoading={isLoading}
                >
                  Сохранить изменения
                </Button>
              </Flex>
            </VStack>
          </TabPanel>

          {/* API настройки */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader>
                  <Heading size="md">Ограничения API</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Лимит запросов в час</FormLabel>
                      <NumberInput 
                        value={apiRateLimit}
                        onChange={(value) => setApiRateLimit(Number(value))}
                        min={100}
                        max={10000}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Таймаут запроса (секунды)</FormLabel>
                      <NumberInput 
                        value={apiTimeout}
                        onChange={(value) => setApiTimeout(Number(value))}
                        min={5}
                        max={120}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size="md">CORS настройки</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="cors-enabled" mb="0" flex="1">
                        Включить CORS
                      </FormLabel>
                      <Switch 
                        id="cors-enabled" 
                        isChecked={corsEnabled}
                        onChange={(e) => setCorsEnabled(e.target.checked)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Разрешенные домены</FormLabel>
                      <Textarea 
                        value={allowedOrigins}
                        onChange={(e) => setAllowedOrigins(e.target.value)}
                        placeholder="https://example.com, https://app.example.com"
                        rows={3}
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              <Flex justify="end">
                <Button 
                  colorScheme="blue" 
                  leftIcon={<Save size={18} />}
                  onClick={() => handleSave('API')}
                  isLoading={isLoading}
                >
                  Сохранить изменения
                </Button>
              </Flex>
            </VStack>
          </TabPanel>

          {/* База данных */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Card>
                <CardHeader>
                  <Heading size="md">Резервное копирование</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="auto-backup" mb="0" flex="1">
                        Автоматическое резервное копирование
                      </FormLabel>
                      <Switch 
                        id="auto-backup" 
                        isChecked={autoBackup}
                        onChange={(e) => setAutoBackup(e.target.checked)}
                      />
                    </FormControl>

                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <FormControl>
                        <FormLabel>Интервал копирования (часы)</FormLabel>
                        <NumberInput 
                          value={backupInterval}
                          onChange={(value) => setBackupInterval(Number(value))}
                          min={1}
                          max={168}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Максимум копий</FormLabel>
                        <NumberInput 
                          value={maxBackups}
                          onChange={(value) => setMaxBackups(Number(value))}
                          min={1}
                          max={30}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </Grid>
                  </VStack>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size="md">Обслуживание БД</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="db-optimization" mb="0" flex="1">
                        Автоматическая оптимизация
                      </FormLabel>
                      <Switch 
                        id="db-optimization" 
                        isChecked={dbOptimization}
                        onChange={(e) => setDbOptimization(e.target.checked)}
                      />
                    </FormControl>

                    <HStack>
                      <Button leftIcon={<Database size={18} />} variant="outline">
                        Оптимизировать сейчас
                      </Button>
                      <Button leftIcon={<Archive size={18} />} variant="outline">
                        Создать резервную копию
                      </Button>
                      <Button leftIcon={<FileText size={18} />} variant="outline">
                        Просмотреть логи
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              <Flex justify="end">
                <Button 
                  colorScheme="blue" 
                  leftIcon={<Save size={18} />}
                  onClick={() => handleSave('База данных')}
                  isLoading={isLoading}
                >
                  Сохранить изменения
                </Button>
              </Flex>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  )
}