'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  HStack,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import {
  User,
  Palette,
  MessageSquare,
  Shield,
  AlertTriangle,
  Bot,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';

// Импортируем компоненты табов
import { BasicInfoTab } from '../../components/profile/BasicInfoTab';
import { PersonalizationTab } from '../../components/profile/PersonalizationTab';
import { AIAgentTab } from '../../components/profile/AIAgentTab';
import { SupportTab } from '../../components/profile/SupportTab';
import { SecurityTab } from '../../components/profile/SecurityTab';
import { DangerZoneTab } from '../../components/profile/DangerZoneTab';

export default function ProfilePage() {
  const { colorMode } = useColorMode();
  const [tabIndex, setTabIndex] = useState(0);

  const tabs = [
    {
      id: 'basic',
      label: 'Основная информация',
      icon: User,
      color: 'blue',
    },
    {
      id: 'personalization',
      label: 'Персонализация',
      icon: Palette,
      color: 'purple',
    },
    {
      id: 'ai-agent',
      label: 'AI Агент',
      icon: Bot,
      color: 'cyan',
    },
    {
      id: 'support',
      label: 'Поддержка',
      icon: MessageSquare,
      color: 'green',
    },
    {
      id: 'security',
      label: 'Безопасность',
      icon: Shield,
      color: 'orange',
    },
    {
      id: 'danger',
      label: 'Danger Zone',
      icon: AlertTriangle,
      color: 'red',
    },
  ];

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
      <Header showHomeButton />
      <Container maxW="6xl" py={8}>
        <Box mb={8}>
          <Heading size="lg" mb={2}>
            Настройки профиля
          </Heading>
          <Text color="gray.600" _dark={{ color: "gray.400" }}>
            Управляйте своим аккаунтом и персональными настройками
          </Text>
        </Box>

        <Tabs
          index={tabIndex}
          onChange={setTabIndex}
          variant="enclosed"
          colorScheme="blue"
        >
          <TabList
            bg="white"
            _dark={{ bg: "gray.800" }}
            borderRadius="lg"
            p={2}
            mb={6}
            overflowX="auto"
            flexWrap={{ base: "wrap", md: "nowrap" }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={tab.id}
                minW={{ base: "auto", md: "200px" }}
                px={4}
                py={3}
                borderRadius="md"
                _selected={{
                  bg: `${tab.color}.500`,
                  color: 'white',
                  _dark: {
                    bg: `${tab.color}.600`,
                  },
                }}
                _hover={{
                  bg: `${tab.color}.50`,
                  _dark: {
                    bg: 'gray.700',
                  },
                }}
                transition="all 0.2s"
              >
                <HStack spacing={2}>
                  <Icon as={tab.icon} boxSize={4} />
                  <Text fontSize="sm" fontWeight="medium">
                    {tab.label}
                  </Text>
                </HStack>
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <BasicInfoTab />
            </TabPanel>
            
            <TabPanel p={0}>
              <PersonalizationTab />
            </TabPanel>
            
            <TabPanel p={0}>
              <AIAgentTab />
            </TabPanel>
            
            <TabPanel p={0}>
              <SupportTab />
            </TabPanel>
            
            <TabPanel p={0}>
              <SecurityTab />
            </TabPanel>
            
            <TabPanel p={0}>
              <DangerZoneTab />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
}