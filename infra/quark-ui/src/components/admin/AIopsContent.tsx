"use client";

import {
  VStack, HStack, Flex, Text, Button, Card, CardBody, CardHeader,
  Heading, Badge, Stat, StatNumber, StatLabel, Grid, Box,
  useColorModeValue, useDisclosure, Modal, ModalOverlay, ModalContent, 
  ModalHeader, ModalBody, ModalFooter, ModalCloseButton, IconButton,
  Tooltip, Progress, Alert, AlertIcon, AlertTitle, AlertDescription,
  Divider, useColorMode
} from "@chakra-ui/react";
import { useState } from "react";
import { 
  Brain, Settings, CheckCircle, XCircle, Clock, Target,
  TrendingUp, Activity, Palette, Shield, Code, AlertTriangle
} from "lucide-react";

interface Proposal {
  id: number;
  title: string;
  description: string;
  type: "feature" | "bugfix" | "optimization" | "refactor" | "performance" | "ui_ux" | "code_quality" | "security";
  priority: "low" | "medium" | "high" | "critical";
  author: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  estimatedTime: string;
  rejectionReason?: string;
  confidence?: number;
  impact?: string;
  suggestedChanges?: string;
}

export function AIopsContent() {
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: 1,
      title: "Оптимизация API запросов",
      type: "performance",
      priority: "high",
      author: "ИИ-ассистент",
      status: "pending",
      confidence: 94,
      impact: "high",
      description: "Предлагаю кешировать результаты часто используемых API запросов для повышения производительности",
      suggestedChanges: `// Добавить кеширование
const cache = new Map();

function getCachedApiData(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = fetchApiData(key);
  cache.set(key, data);
  return data;
}`,
      createdAt: "2024-01-15T10:30:00Z",
      estimatedTime: "2 часа"
    },
    {
      id: 2,
      title: "Улучшение UX формы логина",
      type: "ui_ux",
      priority: "medium",
      author: "ИИ-ассистент",
      status: "approved",
      confidence: 87,
      impact: "medium",
      description: "Добавить индикатор силы пароля и автозаполнение для улучшения пользовательского опыта",
      suggestedChanges: `<FormControl>
  <FormLabel>Пароль</FormLabel>
  <Input 
    type="password" 
    autoComplete="current-password"
    onChange={handlePasswordChange}
  />
  <PasswordStrengthIndicator strength={passwordStrength} />
</FormControl>`,
      createdAt: "2024-01-15T09:15:00Z",
      estimatedTime: "1.5 часа"
    },
    {
      id: 3,
      title: "Рефакторинг компонента чата",
      type: "code_quality",
      priority: "low",
      author: "ИИ-ассистент",
      status: "rejected",
      confidence: 76,
      impact: "low",
      description: "Разбить большой компонент чата на более мелкие для лучшей поддерживаемости",
      suggestedChanges: `// Разделить на компоненты:
// - MessageList.tsx
// - MessageInput.tsx  
// - MessageItem.tsx
// - ChatHeader.tsx`,
      createdAt: "2024-01-15T08:45:00Z",
      estimatedTime: "4 часа",
      rejectionReason: "Слишком сложно для текущего спринта"
    }
  ]);

  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const proposalBgLight = (type: Proposal["type"] | undefined) => `${getTypeColor(type)}.50`;
  const proposalBgDark = (type: Proposal["type"] | undefined) => `${getTypeColor(type)}.900`;
  const boxBgLight = useColorModeValue("gray.50", "gray.900");
  const boxBorderLight = useColorModeValue("gray.200", "gray.600");

  const getTypeColor = (type: Proposal["type"] | undefined) => {
    switch (type) {
      case "performance": return "blue";
      case "ui_ux": return "purple";
      case "security": return "red";
      case "code_quality": return "green";
      default: return "gray";
    }
  };

  const getTypeIcon = (type: Proposal["type"] | undefined) => {
    switch (type) {
      case "performance": return Activity;
      case "ui_ux": return Palette;
      case "security": return Shield;
      case "code_quality": return Code;
      case "feature": return Brain;
      case "bugfix": return AlertTriangle;
      case "optimization": return TrendingUp;
      case "refactor": return Code;
      default: return AlertTriangle;
    }
  };

  const getImpactColor = (impact: Proposal["impact"] | undefined) => {
    switch (impact) {
      case "high": return "red";
      case "medium": return "orange";
      case "low": return "green";
      default: return "gray";
    }
  };

  const handleApproveProposal = (proposalId: number) => {
    setProposals(prev => prev.map(p => 
      p.id === proposalId ? { ...p, status: "approved" } : p
    ));
  };

  const handleRejectProposal = (proposalId: number, reason: string) => {
    setProposals(prev => prev.map(p => 
      p.id === proposalId ? { ...p, status: "rejected", rejectionReason: reason } : p
    ));
  };

  const approvedCount = proposals.filter(p => p.status === "approved").length;
  const pendingCount = proposals.filter(p => p.status === "pending").length;
  const rejectedCount = proposals.filter(p => p.status === "rejected").length;

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading size="xl" fontFamily="Space Grotesk">AI Ops Console</Heading>
          <Text color="gray.500">Управление предложениями искусственного интеллекта</Text>
        </VStack>
        <HStack>
          <Button leftIcon={<Brain size={18} />} colorScheme="purple" variant="outline">
            Запустить анализ
          </Button>
          <Button leftIcon={<Settings size={18} />} variant="outline">
            Настройки ИИ
          </Button>
        </HStack>
      </Flex>

      {/* Статистика предложений */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
        <Card>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <Brain size={32} color="purple" />
              <Stat>
                <StatNumber>{proposals.length}</StatNumber>
                <StatLabel>Всего предложений</StatLabel>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
        <Card>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <CheckCircle size={32} color="green" />
              <Stat>
                <StatNumber>{approvedCount}</StatNumber>
                <StatLabel>Одобрено</StatLabel>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
        <Card>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <Clock size={32} color="orange" />
              <Stat>
                <StatNumber>{pendingCount}</StatNumber>
                <StatLabel>На рассмотрении</StatLabel>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
        <Card>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <TrendingUp size={32} color="blue" />
              <Stat>
                <StatNumber>87%</StatNumber>
                <StatLabel>Ср. точность</StatLabel>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Список предложений */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md">Предложения ИИ</Heading>
            <HStack>
              <Badge colorScheme="orange">{pendingCount} ожидает</Badge>
              <Badge colorScheme="green">{approvedCount} одобрено</Badge>
            </HStack>
          </HStack>
        </CardHeader>
        <CardBody p={0}>
          <VStack spacing={0} divider={<Divider />}>
            {proposals.map((proposal) => {
              const TypeIcon = getTypeIcon(proposal.type);
              return (
                <Box 
                  key={proposal.id} 
                  p={6} 
                  w="full"
                  _hover={{ bg: hoverBg }}
                  cursor="pointer"
                  onClick={() => {
                    setSelectedProposal(proposal);
                    onOpen();
                  }}
                >
                  <HStack justify="space-between" align="start">
                    <HStack align="start" spacing={4} flex={1}>
                      <Box
                        p={2}
                        borderRadius="lg"
                        bg={colorMode === "light" ? proposalBgLight(proposal.type) : proposalBgDark(proposal.type)}
                        color={`${getTypeColor(proposal.type)}.500`}
                      >
                        <TypeIcon size={20} />
                      </Box>
                      <VStack align="start" spacing={2} flex={1}>
                        <HStack wrap="wrap" spacing={2}>
                          <Text fontWeight="semibold" fontSize="lg">
                            {proposal.title}
                          </Text>
                          <Badge colorScheme={getTypeColor(proposal.type)} variant="subtle">
                            {proposal.type === "performance" ? "Производительность" :
                             proposal.type === "ui_ux" ? "UI/UX" :
                             proposal.type === "security" ? "Безопасность" : "Качество кода"}
                          </Badge>
                          <Badge colorScheme={getImpactColor(proposal.impact)} variant="outline">
                            {proposal.impact === "high" ? "Высокий" :
                             proposal.impact === "medium" ? "Средний" : "Низкий"} приоритет
                          </Badge>
                        </HStack>
                        <Text color="gray.600" _dark={{ color: "gray.300" }}>
                          {proposal.description}
                        </Text>
                        <HStack spacing={4} fontSize="sm" color="gray.500">
                          <HStack>
                            <Target size={14} />
                            <Text>Точность: {proposal.confidence}%</Text>
                          </HStack>
                          <HStack>
                            <Clock size={14} />
                            <Text>~{proposal.estimatedTime}</Text>
                          </HStack>
                          <Text>{new Date(proposal.createdAt).toLocaleDateString("ru-RU")}</Text>
                        </HStack>
                      </VStack>
                    </HStack>
                    <VStack spacing={2}>
                      <Badge 
                        colorScheme={
                          proposal.status === "approved" ? "green" :
                          proposal.status === "pending" ? "yellow" : "red"
                        }
                        variant="solid"
                      >
                        {proposal.status === "approved" ? "Одобрено" :
                         proposal.status === "pending" ? "На рассмотрении" : "Отклонено"}
                      </Badge>
                      {proposal.status === "pending" && (
                        <HStack spacing={1}>
                          <Tooltip label="Одобрить">
                            <IconButton
                              aria-label="Одобрить"
                              icon={<CheckCircle size={14} />}
                              size="sm"
                              colorScheme="green"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveProposal(proposal.id);
                              }}
                            />
                          </Tooltip>
                          <Tooltip label="Отклонить">
                            <IconButton
                              aria-label="Отклонить"
                              icon={<XCircle size={14} />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectProposal(proposal.id, "Отклонено администратором");
                              }}
                            />
                          </Tooltip>
                        </HStack>
                      )}
                    </VStack>
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        </CardBody>
      </Card>

      {/* Модальное окно с деталями предложения */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent maxH="90vh" overflow="hidden">
          <ModalHeader>
            <HStack>
              <Brain size={24} color="purple" />
              <VStack align="start" spacing={0}>
                <Text>{selectedProposal?.title}</Text>
                <HStack>
                  <Badge colorScheme={getTypeColor(selectedProposal?.type ?? undefined)} variant="subtle">
                    {selectedProposal?.type === "performance" ? "Производительность" :
                     selectedProposal?.type === "ui_ux" ? "UI/UX" :
                     selectedProposal?.type === "security" ? "Безопасность" : "Качество кода"}
                  </Badge>
                  <Badge colorScheme={getImpactColor(selectedProposal?.impact || "")} variant="outline">
                    {selectedProposal?.impact === "high" ? "Высокий" :
                     selectedProposal?.impact === "medium" ? "Средний" : "Низкий"}
                  </Badge>
                </HStack>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody overflow="auto">
            {selectedProposal && (
              <VStack align="stretch" spacing={6}>
                <Box>
                  <Text fontWeight="semibold" mb={2}>Описание</Text>
                  <Text>{selectedProposal.description}</Text>
                </Box>

                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Уверенность ИИ</Text>
                    <HStack>
                      <Progress 
                        value={selectedProposal.confidence || 0} 
                        colorScheme={(selectedProposal.confidence || 0) > 80 ? "green" : "yellow"}
                        size="lg"
                        flex={1}
                      />
                      <Text fontWeight="bold">{selectedProposal.confidence || 0}%</Text>
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Время реализации</Text>
                    <Text>{selectedProposal.estimatedTime}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Создано</Text>
                    <Text>{new Date(selectedProposal.createdAt).toLocaleString("ru-RU")}</Text>
                  </Box>
                </Grid>

                <Box>
                  <Text fontWeight="semibold" mb={3}>Предлагаемые изменения</Text>
                  <Box
                    bg={boxBgLight}
                    p={4}
                    borderRadius="md"
                    border="1px solid"
                    borderColor={boxBorderLight}
                  >
                    <pre style={{ 
                      fontFamily: "Monaco, Menlo, \"Ubuntu Mono\", monospace",
                      fontSize: "14px",
                      lineHeight: "1.4",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word"
                    }}>
                      {selectedProposal.suggestedChanges}
                    </pre>
                  </Box>
                </Box>

                {selectedProposal.status === "rejected" && selectedProposal.rejectionReason && (
                  <Alert status="warning">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Причина отклонения:</AlertTitle>
                      <AlertDescription>{selectedProposal.rejectionReason}</AlertDescription>
                    </Box>
                  </Alert>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              {selectedProposal?.status === "pending" && (
                <>
                  <Button 
                    colorScheme="green" 
                    leftIcon={<CheckCircle size={16} />}
                    onClick={() => {
                      handleApproveProposal(selectedProposal.id);
                      onClose();
                    }}
                  >
                    Одобрить
                  </Button>
                  <Button 
                    colorScheme="red" 
                    variant="outline"
                    leftIcon={<XCircle size={16} />}
                    onClick={() => {
                      const reason = prompt("Причина отклонения:");
                      if (reason) {
                        handleRejectProposal(selectedProposal.id, reason);
                        onClose();
                      }
                    }}
                  >
                    Отклонить
                  </Button>
                </>
              )}
              <Button variant="ghost" onClick={onClose}>
                Закрыть
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
}