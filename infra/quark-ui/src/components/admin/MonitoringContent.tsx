'use client';

import {
  VStack, HStack, Flex, Text, Button, Card, CardBody, CardHeader,
  Heading, Badge, Grid, Box, Select, Progress, Alert, AlertIcon,
  useColorModeValue
} from '@chakra-ui/react'
import { useState } from 'react'
import { 
  Users, Activity, Monitor, Clock, TrendingUp, Play, Pause
} from 'lucide-react'

export function MonitoringContent() {
  const [timeRange, setTimeRange] = useState('24h')
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)

  // Тестовые данные метрик
  const metrics = {
    systemHealth: {
      cpu: 45,
      memory: 72,
      disk: 38,
      network: 12
    },
    performance: {
      responseTime: 120,
      throughput: 2340,
      errorRate: 0.12,
      uptime: 99.97
    },
    users: {
      online: 142,
      active24h: 8450,
      newToday: 23,
      sessionsAvg: 8.3
    }
  }

  const alerts = [
    {
      id: 1,
      type: 'warning',
      message: 'Высокое использование памяти на сервере app-01',
      timestamp: new Date().toLocaleString('ru-RU'),
      resolved: false
    },
    {
      id: 2,
      type: 'info',
      message: 'Завершено обновление модуля аутентификации',
      timestamp: new Date(Date.now() - 15*60000).toLocaleString('ru-RU'),
      resolved: true
    },
    {
      id: 3,
      type: 'error',
      message: 'Ошибка подключения к базе данных (временно)',
      timestamp: new Date(Date.now() - 45*60000).toLocaleString('ru-RU'),
      resolved: true
    }
  ]

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading size="xl" fontFamily="Space Grotesk">Мониторинг системы</Heading>
          <Text color="gray.500">Отслеживание производительности и состояния платформы</Text>
        </VStack>
        <HStack>
          <Select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            w="120px"
          >
            <option value="1h">1 час</option>
            <option value="6h">6 часов</option>
            <option value="24h">24 часа</option>
            <option value="7d">7 дней</option>
          </Select>
          <Button 
            leftIcon={isAutoRefresh ? <Pause size={16} /> : <Play size={16} />}
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            colorScheme={isAutoRefresh ? 'orange' : 'green'}
            variant="outline"
          >
            {isAutoRefresh ? 'Пауза' : 'Авто'}
          </Button>
        </HStack>
      </Flex>

      {/* Системные метрики */}
      <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
        {/* Здоровье системы */}
        <Card>
          <CardHeader>
            <Heading size="md">Состояние системы</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <Box w="full">
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">CPU</Text>
                  <Text fontSize="sm" fontWeight="semibold">{metrics.systemHealth.cpu}%</Text>
                </Flex>
                <Progress 
                  value={metrics.systemHealth.cpu} 
                  colorScheme={metrics.systemHealth.cpu > 80 ? 'red' : metrics.systemHealth.cpu > 60 ? 'orange' : 'green'}
                  size="lg"
                />
              </Box>
              
              <Box w="full">
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">Память</Text>
                  <Text fontSize="sm" fontWeight="semibold">{metrics.systemHealth.memory}%</Text>
                </Flex>
                <Progress 
                  value={metrics.systemHealth.memory} 
                  colorScheme={metrics.systemHealth.memory > 85 ? 'red' : metrics.systemHealth.memory > 70 ? 'orange' : 'green'}
                  size="lg"
                />
              </Box>
              
              <Box w="full">
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">Диск</Text>
                  <Text fontSize="sm" fontWeight="semibold">{metrics.systemHealth.disk}%</Text>
                </Flex>
                <Progress 
                  value={metrics.systemHealth.disk} 
                  colorScheme={metrics.systemHealth.disk > 90 ? 'red' : metrics.systemHealth.disk > 75 ? 'orange' : 'green'}
                  size="lg"
                />
              </Box>
              
              <Box w="full">
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">Сеть</Text>
                  <Text fontSize="sm" fontWeight="semibold">{metrics.systemHealth.network} Мбит/с</Text>
                </Flex>
                <Progress 
                  value={(metrics.systemHealth.network / 100) * 100} 
                  colorScheme="blue"
                  size="lg"
                />
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Производительность */}
        <Card>
          <CardHeader>
            <Heading size="md">Производительность</Heading>
          </CardHeader>
          <CardBody>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {metrics.performance.responseTime}мс
                </Text>
                <Text fontSize="sm" color="gray.500">Время отклика</Text>
              </Box>
              
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {metrics.performance.throughput.toLocaleString()}
                </Text>
                <Text fontSize="sm" color="gray.500">Запросов/ч</Text>
              </Box>
              
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="red.500">
                  {metrics.performance.errorRate}%
                </Text>
                <Text fontSize="sm" color="gray.500">Ошибки</Text>
              </Box>
              
              <Box textAlign="center">
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {metrics.performance.uptime}%
                </Text>
                <Text fontSize="sm" color="gray.500">Доступность</Text>
              </Box>
            </Grid>
          </CardBody>
        </Card>
      </Grid>

      {/* Пользователи онлайн */}
      <Card>
        <CardHeader>
          <Heading size="md">Активность пользователей</Heading>
        </CardHeader>
        <CardBody>
          <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={6}>
            <VStack>
              <Box
                w="16"
                h="16"
                borderRadius="full"
                bg="green.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                _dark={{ bg: "green.900" }}
              >
                <Users size={24} color="green" />
              </Box>
              <Text fontSize="2xl" fontWeight="bold">{metrics.users.online}</Text>
              <Text fontSize="sm" color="gray.500">Онлайн сейчас</Text>
            </VStack>
            
            <VStack>
              <Box
                w="16"
                h="16"
                borderRadius="full"
                bg="blue.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                _dark={{ bg: "blue.900" }}
              >
                <Activity size={24} color="blue" />
              </Box>
              <Text fontSize="2xl" fontWeight="bold">{metrics.users.active24h.toLocaleString()}</Text>
              <Text fontSize="sm" color="gray.500">За 24 часа</Text>
            </VStack>
            
            <VStack>
              <Box
                w="16"
                h="16"
                borderRadius="full"
                bg="purple.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                _dark={{ bg: "purple.900" }}
              >
                <TrendingUp size={24} color="purple" />
              </Box>
              <Text fontSize="2xl" fontWeight="bold">{metrics.users.newToday}</Text>
              <Text fontSize="sm" color="gray.500">Новых сегодня</Text>
            </VStack>
            
            <VStack>
              <Box
                w="16"
                h="16"
                borderRadius="full"
                bg="orange.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
                _dark={{ bg: "orange.900" }}
              >
                <Clock size={24} color="orange" />
              </Box>
              <Text fontSize="2xl" fontWeight="bold">{metrics.users.sessionsAvg}</Text>
              <Text fontSize="sm" color="gray.500">Мин/сессия</Text>
            </VStack>
          </Grid>
        </CardBody>
      </Card>

      {/* Алерты */}
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Последние события</Heading>
            <Badge colorScheme="orange">{alerts.filter(a => !a.resolved).length} активных</Badge>
          </Flex>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            {alerts.map((alert) => (
              <Alert 
                key={alert.id}
                status={alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'}
                borderRadius="md"
                opacity={alert.resolved ? 0.7 : 1}
              >
                <AlertIcon />
                <Box flex="1">
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" fontWeight="semibold">
                      {alert.message}
                    </Text>
                    <HStack spacing={2}>
                      <Text fontSize="xs" color="gray.500">
                        {alert.timestamp}
                      </Text>
                      {alert.resolved && (
                        <Badge colorScheme="green" size="sm">Решено</Badge>
                      )}
                    </HStack>
                  </Flex>
                </Box>
              </Alert>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}