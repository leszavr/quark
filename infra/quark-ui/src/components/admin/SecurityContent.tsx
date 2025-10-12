'use client';

import {
  VStack, HStack, Flex, Text, Button, Card, CardBody, CardHeader,
  Heading, Badge, Grid, Box, Switch, FormControl, FormLabel,
  Input, Select, Stat, StatNumber, StatLabel, StatHelpText,
  Alert, AlertIcon, AlertTitle, AlertDescription, Progress,
  Table, Thead, Tbody, Tr, Th, Td, useColorModeValue, Divider,
  IconButton, Tooltip
} from '@chakra-ui/react'
import { useState } from 'react'
import { 
  Shield, Lock, Eye, AlertTriangle, Users, Activity,
  Globe, Database, Key, Settings, RefreshCw, Download,
  CheckCircle, XCircle, Clock, Zap, FileText, Search
} from 'lucide-react'

export function SecurityContent() {
  const [autoLockout, setAutoLockout] = useState(true)
  const [twoFactorRequired, setTwoFactorRequired] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('30')
  const [passwordComplexity, setPasswordComplexity] = useState('medium')

  // Статистика безопасности
  const securityStats = {
    activeThreats: 2,
    blockedAttempts: 1247,
    secureConnections: 99.8,
    lastSecurityScan: '2024-01-15T10:30:00Z'
  }

  // Последние события безопасности
  const securityEvents = [
    {
      id: 1,
      type: 'warning',
      title: 'Подозрительная активность',
      description: 'Множественные попытки входа с IP 192.168.1.100',
      timestamp: '2024-01-15T14:30:00Z',
      severity: 'medium',
      resolved: false
    },
    {
      id: 2,
      type: 'success',
      title: 'Успешное обновление безопасности',
      description: 'Обновлены правила файрвола',
      timestamp: '2024-01-15T12:15:00Z',
      severity: 'low',
      resolved: true
    },
    {
      id: 3,
      type: 'error',
      title: 'Обнаружена уязвимость',
      description: 'Найдена потенциальная уязвимость в модуле аутентификации',
      timestamp: '2024-01-15T09:45:00Z',
      severity: 'high',
      resolved: false
    },
    {
      id: 4,
      type: 'info',
      title: 'Плановое сканирование',
      description: 'Завершено плановое сканирование системы безопасности',
      timestamp: '2024-01-15T08:00:00Z',
      severity: 'low',
      resolved: true
    }
  ]

  // Попытки входа
  const loginAttempts = [
    {
      id: 1,
      ip: '192.168.1.100',
      user: 'admin@example.com',
      status: 'blocked',
      attempts: 15,
      lastAttempt: '2024-01-15T14:25:00Z',
      location: 'Неизвестно'
    },
    {
      id: 2,
      ip: '10.0.0.45',
      user: 'user@example.com',
      status: 'success',
      attempts: 1,
      lastAttempt: '2024-01-15T13:10:00Z',
      location: 'Москва, Россия'
    },
    {
      id: 3,
      ip: '203.0.113.42',
      user: 'test@example.com',
      status: 'failed',
      attempts: 3,
      lastAttempt: '2024-01-15T11:30:00Z',
      location: 'Санкт-Петербург, Россия'
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'red'
      case 'medium': return 'orange'
      case 'low': return 'green'
      default: return 'gray'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'green'
      case 'failed': return 'orange'
      case 'blocked': return 'red'
      default: return 'gray'
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading size="xl" fontFamily="Space Grotesk">Центр безопасности</Heading>
          <Text color="gray.500">Мониторинг и управление безопасностью системы</Text>
        </VStack>
        <HStack>
          <Button leftIcon={<RefreshCw size={18} />} variant="outline">
            Обновить данные
          </Button>
          <Button leftIcon={<Download size={18} />} variant="outline">
            Отчет безопасности
          </Button>
        </HStack>
      </Flex>

      {/* Обзор безопасности */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
        <Card>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <AlertTriangle size={32} color="red" />
              <Stat>
                <StatNumber color="red.500">{securityStats.activeThreats}</StatNumber>
                <StatLabel>Активные угрозы</StatLabel>
                <StatHelpText>Требуют внимания</StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <Shield size={32} color="blue" />
              <Stat>
                <StatNumber>{securityStats.blockedAttempts.toLocaleString()}</StatNumber>
                <StatLabel>Заблокировано попыток</StatLabel>
                <StatHelpText>За последний месяц</StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <Lock size={32} color="green" />
              <Stat>
                <StatNumber color="green.500">{securityStats.secureConnections}%</StatNumber>
                <StatLabel>Защищенные соединения</StatLabel>
                <StatHelpText>HTTPS/SSL</StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <Activity size={32} color="purple" />
              <Stat>
                <StatNumber fontSize="lg">
                  {new Date(securityStats.lastSecurityScan).toLocaleDateString('ru-RU')}
                </StatNumber>
                <StatLabel>Последнее сканирование</StatLabel>
                <StatHelpText>
                  {new Date(securityStats.lastSecurityScan).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </StatHelpText>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Настройки безопасности */}
      <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
        <Card>
          <CardHeader>
            <Heading size="md">Политики безопасности</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="auto-lockout" mb="0" flex="1">
                  Автоматическая блокировка подозрительных IP
                </FormLabel>
                <Switch 
                  id="auto-lockout" 
                  isChecked={autoLockout}
                  onChange={(e) => setAutoLockout(e.target.checked)}
                  colorScheme="blue"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="2fa-required" mb="0" flex="1">
                  Обязательная двухфакторная аутентификация
                </FormLabel>
                <Switch 
                  id="2fa-required" 
                  isChecked={twoFactorRequired}
                  onChange={(e) => setTwoFactorRequired(e.target.checked)}
                  colorScheme="green"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Время жизни сессии (минуты)</FormLabel>
                <Select value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)}>
                  <option value="15">15 минут</option>
                  <option value="30">30 минут</option>
                  <option value="60">1 час</option>
                  <option value="120">2 часа</option>
                  <option value="480">8 часов</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Сложность паролей</FormLabel>
                <Select 
                  value={passwordComplexity} 
                  onChange={(e) => setPasswordComplexity(e.target.value)}
                >
                  <option value="low">Низкая (8+ символов)</option>
                  <option value="medium">Средняя (8+ символов, цифры)</option>
                  <option value="high">Высокая (12+ символов, цифры, спецсимволы)</option>
                </Select>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Уровень защиты системы</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <Box w="full">
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">Файрвол</Text>
                  <Badge colorScheme="green">Активен</Badge>
                </Flex>
                <Progress value={95} colorScheme="green" size="lg" />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  95% трафика проверяется
                </Text>
              </Box>

              <Box w="full">
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">Антивирус</Text>
                  <Badge colorScheme="green">Обновлен</Badge>
                </Flex>
                <Progress value={100} colorScheme="green" size="lg" />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Базы обновлены сегодня
                </Text>
              </Box>

              <Box w="full">
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">Мониторинг доступа</Text>
                  <Badge colorScheme="blue">Включен</Badge>
                </Flex>
                <Progress value={88} colorScheme="blue" size="lg" />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  88% подключений мониторится
                </Text>
              </Box>

              <Box w="full">
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">Шифрование данных</Text>
                  <Badge colorScheme="purple">AES-256</Badge>
                </Flex>
                <Progress value={100} colorScheme="purple" size="lg" />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Все данные зашифрованы
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* События безопасности */}
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Последние события безопасности</Heading>
            <Badge colorScheme="orange">
              {securityEvents.filter(e => !e.resolved).length} требуют внимания
            </Badge>
          </Flex>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            {securityEvents.map((event) => (
              <Alert 
                key={event.id}
                status={event.type === 'error' ? 'error' : event.type === 'warning' ? 'warning' : event.type === 'success' ? 'success' : 'info'}
                borderRadius="md"
                opacity={event.resolved ? 0.7 : 1}
              >
                <AlertIcon />
                <Box flex="1">
                  <AlertTitle fontSize="sm">
                    {event.title}
                    <Badge 
                      ml={2} 
                      colorScheme={getSeverityColor(event.severity)} 
                      size="sm"
                    >
                      {event.severity === 'high' ? 'Высокий' :
                       event.severity === 'medium' ? 'Средний' : 'Низкий'}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription fontSize="sm">
                    {event.description}
                  </AlertDescription>
                </Box>
                <VStack spacing={1} align="end">
                  <Text fontSize="xs" color="gray.500">
                    {new Date(event.timestamp).toLocaleString('ru-RU')}
                  </Text>
                  {event.resolved && (
                    <Badge colorScheme="green" size="sm">Решено</Badge>
                  )}
                </VStack>
              </Alert>
            ))}
          </VStack>
        </CardBody>
      </Card>

      {/* Попытки входа */}
      <Card>
        <CardHeader>
          <Heading size="md">Мониторинг попыток входа</Heading>
        </CardHeader>
        <CardBody p={0}>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                <Tr>
                  <Th>IP-адрес</Th>
                  <Th>Пользователь</Th>
                  <Th>Статус</Th>
                  <Th>Попытки</Th>
                  <Th>Местоположение</Th>
                  <Th>Последняя попытка</Th>
                  <Th>Действия</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loginAttempts.map((attempt) => (
                  <Tr key={attempt.id}>
                    <Td fontFamily="mono" fontSize="sm">{attempt.ip}</Td>
                    <Td>{attempt.user}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(attempt.status)}>
                        {attempt.status === 'success' ? 'Успешно' :
                         attempt.status === 'failed' ? 'Неудачно' : 'Заблокировано'}
                      </Badge>
                    </Td>
                    <Td>
                      <Text color={attempt.attempts > 5 ? 'red.500' : 'inherit'}>
                        {attempt.attempts}
                      </Text>
                    </Td>
                    <Td>{attempt.location}</Td>
                    <Td>{new Date(attempt.lastAttempt).toLocaleString('ru-RU')}</Td>
                    <Td>
                      <HStack spacing={1}>
                        <Tooltip label="Подробности">
                          <IconButton
                            aria-label="Подробности"
                            icon={<Eye size={14} />}
                            size="sm"
                            variant="ghost"
                          />
                        </Tooltip>
                        {attempt.status === 'blocked' ? (
                          <Tooltip label="Разблокировать IP">
                            <IconButton
                              aria-label="Разблокировать"
                              icon={<CheckCircle size={14} />}
                              size="sm"
                              colorScheme="green"
                              variant="ghost"
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip label="Заблокировать IP">
                            <IconButton
                              aria-label="Заблокировать"
                              icon={<XCircle size={14} />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                            />
                          </Tooltip>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>
    </VStack>
  )
}