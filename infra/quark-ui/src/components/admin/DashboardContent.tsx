'use client';

import {
  Box, Flex, Text, VStack, HStack, Card, CardBody, CardHeader,
  Heading, Badge, Stat, StatLabel, StatNumber,
  IconButton, Tooltip, useColorModeValue, Divider
} from '@chakra-ui/react'
import { useState } from 'react'
import { 
  Users, Activity, Monitor, Cpu, Bell, Settings, 
  FileText, Plus, Download, RefreshCw
} from 'lucide-react'

// Компонент главной страницы админки
export function DashboardContent() {
  return (
    <VStack spacing={6} align="stretch">
      <Heading size="xl" fontFamily="Space Grotesk">
        Обзор системы
      </Heading>
      
      {/* Карточки статистики */}
      <Flex wrap="wrap" gap={4}>
        <StatCard title="Активные пользователи" value="8,450" change="+12%" changeType="positive" icon={Users} />
        <StatCard title="Загруженные модули" value="12" change="+2" changeType="positive" icon={Cpu} />
        <StatCard title="Активные ИИ-агенты" value="3" change="stable" changeType="neutral" icon={Monitor} />
        <StatCard title="Доступность" value="99.95%" change="+0.01%" changeType="positive" icon={Activity} />
      </Flex>

      {/* Лента событий и быстрые действия */}
      <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
        <EventsFeed />
        <QuickActions />
      </Flex>
    </VStack>
  );
}

// Компонент статистической карточки
function StatCard({ title, value, change, changeType, icon: Icon }: { 
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon?: React.ComponentType<any>;
}) {
  const changeColor = {
    positive: 'green.500',
    negative: 'red.500',
    neutral: 'gray.500'
  }[changeType];

  return (
    <Box
      p={6}
      bg="white"
      _dark={{ bg: "gray.800", borderColor: "gray.700" }}
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.200"
      shadow="sm"
      minW="200px"
      _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
      transition="all 0.2s"
    >
      <HStack justify="space-between" mb={2}>
        <Text fontSize="sm" color="gray.500">
          {title}
        </Text>
        {Icon && (
          <Icon 
            size={20} 
            color={changeType === 'positive' ? '#48BB78' : changeType === 'negative' ? '#F56565' : '#A0AEC0'}
          />
        )}
      </HStack>
      <Text fontSize="2xl" fontWeight="bold" mb={1}>
        {value}
      </Text>
      <Text fontSize="sm" color={changeColor} fontWeight="medium">
        {change}
      </Text>
    </Box>
  );
}

// Компонент ленты событий
function EventsFeed() {
  const events = [
    { id: 1, type: 'info', message: 'Новый пользователь зарегистрирован', time: '2 мин назад' },
    { id: 2, type: 'success', message: 'Модуль "User Auth" одобрен', time: '15 мин назад' },
    { id: 3, type: 'warning', message: 'Высокая нагрузка на сервер', time: '1 час назад' },
    { id: 4, type: 'info', message: 'Создан новый ИИ-агент', time: '2 часа назад' }
  ];

  return (
    <Card flex={2}>
      <CardHeader>
        <Flex justify="space-between" align="center">
          <Heading size="md">Лента событий</Heading>
          <IconButton
            aria-label="Обновить"
            icon={<RefreshCw size={16} />}
            size="sm"
            variant="ghost"
          />
        </Flex>
      </CardHeader>
      <CardBody pt={0}>
        <VStack spacing={3} align="stretch">
          {events.map((event) => (
            <HStack key={event.id} p={3} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
              <Box
                w={3}
                h={3}
                borderRadius="full"
                bg={
                  event.type === 'success' ? 'green.500' :
                  event.type === 'warning' ? 'orange.500' : 'blue.500'
                }
              />
              <VStack align="start" spacing={0} flex={1}>
                <Text fontSize="sm" fontWeight="medium">
                  {event.message}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {event.time}
                </Text>
              </VStack>
            </HStack>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );
}

// Компонент быстрых действий
function QuickActions() {
  return (
    <Card flex={1} minW="300px">
      <CardHeader>
        <Heading size="md">Быстрые действия</Heading>
      </CardHeader>
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          <HStack spacing={3}>
            <Tooltip label="Создать новый модуль" placement="bottom" hasArrow>
              <IconButton
                aria-label="Новый модуль"
                icon={<Plus size={20} />}
                colorScheme="blue"
                size="lg"
                borderRadius="xl"
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                transition="all 0.2s"
              />
            </Tooltip>
            <Tooltip label="Экспорт данных" placement="bottom" hasArrow>
              <IconButton
                aria-label="Экспорт"
                icon={<Download size={20} />}
                colorScheme="green"
                variant="outline"
                size="lg"
                borderRadius="xl"
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                transition="all 0.2s"
              />
            </Tooltip>
            <Tooltip label="Просмотреть уведомления (3)" placement="bottom" hasArrow>
              <Box position="relative">
                <IconButton
                  aria-label="Уведомления"
                  icon={<Bell size={20} />}
                  colorScheme="orange"
                  variant="outline"
                  size="lg"
                  borderRadius="xl"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                  transition="all 0.2s"
                />
                <Badge
                  colorScheme="red"
                  fontSize="xs"
                  borderRadius="full"
                  position="absolute"
                  top="-1"
                  right="-1"
                  minW="18px"
                  h="18px"
                >
                  3
                </Badge>
              </Box>
            </Tooltip>
          </HStack>
          
          <Divider />
          
          {/* Дополнительные действия */}
          <VStack spacing={2} w="full">
            <Text fontSize="xs" color="gray.500" textAlign="center">
              Дополнительно
            </Text>
            <HStack spacing={2} w="full" justify="space-between">
              <Tooltip label="Системные логи" hasArrow>
                <IconButton
                  aria-label="Просмотр логов"
                  icon={<FileText size={16} />}
                  variant="ghost"
                  size="sm"
                  _hover={{ bg: "gray.100", _dark: { bg: "gray.700" } }}
                />
              </Tooltip>
              <Tooltip label="Настройки" hasArrow>
                <IconButton
                  aria-label="Настройки системы"
                  icon={<Settings size={16} />}
                  variant="ghost"
                  size="sm"
                  _hover={{ bg: "gray.100", _dark: { bg: "gray.700" } }}
                />
              </Tooltip>
              <Tooltip label="Мониторинг" hasArrow>
                <IconButton
                  aria-label="Мониторинг"
                  icon={<Monitor size={16} />}
                  variant="ghost"
                  size="sm"
                  _hover={{ bg: "gray.100", _dark: { bg: "gray.700" } }}
                />
              </Tooltip>
            </HStack>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
}