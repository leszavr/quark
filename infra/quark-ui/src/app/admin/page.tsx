'use client';

import {
  Box, Flex, Text, Button, VStack, HStack,
  Heading, IconButton, Tooltip, useColorModeValue,
  Spacer, useColorMode
} from '@chakra-ui/react'
import { useState } from 'react'
import { Header } from '@/components/layout/Header';
import { DashboardContent } from '@/components/admin/DashboardContent';
import { ModulesContent } from '@/components/admin/ModulesContent';
import { AIopsContent } from '@/components/admin/AIopsContent';
import { MonitoringContent } from '@/components/admin/MonitoringContent';
import { UsersContent } from '@/components/admin/UsersContent';
import { SecurityContent } from '@/components/admin/SecurityContent';
import { SettingsContent } from '@/components/admin/SettingsContent';

// Импорты иконок
import { 
  Home, Settings, Monitor, Cpu, Shield, Users, 
  ChevronLeft, ChevronRight, Menu
} from 'lucide-react'

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { colorMode } = useColorMode()

  const menuItems = [
    { id: 'dashboard', label: 'Главная', icon: Home },
    { id: 'users', label: 'Пользователи', icon: Users },
    { id: 'modules', label: 'Модули', icon: Cpu },
    { id: 'ai-ops', label: 'AI Ops Console', icon: Monitor },
    { id: 'monitoring', label: 'Мониторинг', icon: Monitor },
    { id: 'security', label: 'Безопасность', icon: Shield },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ]

  const getIconForSection = (sectionId: string) => {
    const item = menuItems.find(item => item.id === sectionId)
    return item?.icon || Home
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Header showHomeButton={true} />
      
      <Flex>
        {/* Sidebar */}
        <Box
          w={sidebarCollapsed ? '70px' : '280px'}
          bg={useColorModeValue('white', 'gray.800')}
          borderRight="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          minH="calc(100vh - 80px)"
          transition="all 0.3s ease"
          position="relative"
        >
          {/* Кнопка сворачивания */}
          <IconButton
            aria-label="Toggle sidebar"
            icon={sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            size="sm"
            variant="ghost"
            position="absolute"
            top={4}
            right={sidebarCollapsed ? 2 : 4}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            zIndex={10}
          />

          <VStack align="stretch" spacing={1} p={4} pt={12}>
            {menuItems.map((item) => {
              const IconComponent = item.icon
              const isActive = activeSection === item.id

              return (
                <Tooltip 
                  key={item.id}
                  label={sidebarCollapsed ? item.label : ''}
                  placement="right"
                  isDisabled={!sidebarCollapsed}
                >
                  <Button
                    variant={isActive ? 'solid' : 'ghost'}
                    colorScheme={isActive ? 'blue' : 'gray'}
                    justifyContent={sidebarCollapsed ? 'center' : 'flex-start'}
                    leftIcon={<IconComponent size={20} />}
                    onClick={() => setActiveSection(item.id)}
                    w="full"
                    h="48px"
                    px={sidebarCollapsed ? 2 : 4}
                    fontSize="sm"
                    _hover={{
                      bg: isActive 
                        ? useColorModeValue('blue.500', 'blue.500')
                        : useColorModeValue('gray.100', 'gray.700')
                    }}
                  >
                    {!sidebarCollapsed && item.label}
                  </Button>
                </Tooltip>
              )
            })}
          </VStack>
        </Box>

        {/* Main Content */}
        <Box flex={1} p={6}>
          {renderContent()}
        </Box>
      </Flex>
    </Box>
  )

  function renderContent() {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return <UsersContent />;
      case 'modules':
        return <ModulesContent />;
      case 'ai-ops':
        return <AIopsContent />;
      case 'monitoring':
        return <MonitoringContent />;
      case 'security':
        return <SecurityContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return (
          <Box p={8} textAlign="center">
            <Heading size="lg" mb={4} color="gray.500">
              🚧 В разработке
            </Heading>
            <Text color="gray.500">
              Раздел "{activeSection}" будет реализован на следующем этапе
            </Text>
          </Box>
        );
    }
  }
}