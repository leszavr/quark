"use client";

import {
  VStack, HStack, Flex, Text, Button, Card, CardBody, CardHeader,
  Heading, Badge, Stat, StatLabel, StatNumber, Avatar, IconButton, 
  Tooltip, Grid, Input, Select, Table, Thead, Tbody, Tr, Th, Td, 
  useColorMode, useColorModeValue, useDisclosure, Modal, ModalOverlay, ModalContent, 
  ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Box
} from "@chakra-ui/react";
import { useState } from "react";
import { 
  Code, Search, Filter, Download, Eye, CheckCircle, XCircle, 
  Clock, GitBranch
} from "lucide-react";

interface Module {
  id: number;
  name: string;
  version: string;
  status: "approved" | "pending" | "rejected";
  author: string;
  description: string;
  dependencies: string[];
  lastUpdate: string;
  rating: number;
  downloads?: number;
  category?: string;
}

export function ModulesContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const rowHoverBg = useColorModeValue("gray.50", "gray.700");

  // Тестовые данные модулей
  const [modules] = useState([
    {
      id: 1,
      name: "User Authentication",
      version: "2.1.0",
      status: "approved" as const,
      author: "system",
      description: "Core authentication module with JWT tokens",
      dependencies: ["crypto-utils", "jwt-lib"],
      lastUpdate: "2024-01-15",
      rating: 4.8,
      downloads: 1248,
      category: "Security"
    },
    {
      id: 2,
      name: "Data Validator",
      version: "1.5.2",
      status: "pending" as const,
      author: "user123",
      description: "Advanced data validation with custom rules",
      dependencies: ["lodash", "joi"],
      lastUpdate: "2024-01-14",
      rating: 4.2,
      downloads: 842,
      category: "Utilities"
    },
    {
      id: 3,
      name: "API Gateway",
      version: "3.0.1",
      status: "rejected" as const,
      author: "developer456",
      description: "HTTP API gateway with rate limiting",
      dependencies: ["express", "redis"],
      lastUpdate: "2024-01-13",
      rating: 3.7,
      downloads: 0,
      category: "Network"
    },
    {
      id: 4,
      name: "Notification Service",
      version: "1.0.5",
      status: "approved" as const,
      author: "dev-team",
      description: "Multi-channel notification service (email, SMS, push)",
      dependencies: ["nodemailer", "twilio"],
      lastUpdate: "2024-01-12",
      rating: 4.5,
      downloads: 567,
      category: "Communication"
    },
    {
      id: 5,
      name: "File Storage",
      version: "3.2.1",
      status: "approved" as const,
      author: "system",
      description: "Cloud file storage with compression",
      dependencies: ["minio", "sharp"],
      lastUpdate: "2024-01-10",
      rating: 4.9,
      downloads: 2103,
      category: "Storage"
    }
  ]);

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || module.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "green";
      case "pending": return "yellow"; 
      case "rejected": return "red";
      default: return "gray";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return CheckCircle;
      case "pending": return Clock;
      case "rejected": return XCircle;
      default: return Clock;
    }
  };

  const handleViewModule = (module: Module) => {
    setSelectedModule(module);
    onOpen();
  };

  const handleApproveModule = (moduleId: number) => {
    console.log("Approving module:", moduleId);
  };

  const handleRejectModule = (moduleId: number) => {
    console.log("Rejecting module:", moduleId);
  };

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center">
        <Heading size="xl">Управление модулями</Heading>
        <Button colorScheme="blue" leftIcon={<Code size={18} />}>
          Добавить модуль
        </Button>
      </Flex>

      {/* Фильтры и поиск */}
      <Card>
        <CardBody>
          <Grid templateColumns={{ base: "1fr", md: "1fr 200px 200px" }} gap={4}>
            <Box position="relative">
              <Search 
                size={18} 
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1,
                  color: "gray"
                }} 
              />
              <Input
                pl="40px"
                placeholder="Поиск модулей..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>
            <Select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              icon={<Filter />}
            >
              <option value="all">Все статусы</option>
              <option value="approved">Одобрено</option>
              <option value="pending">На рассмотрении</option>
              <option value="rejected">Отклонено</option>
            </Select>
            <Button 
              variant="outline" 
              leftIcon={<Download size={18} />}
              isDisabled={filteredModules.length === 0}
            >
              Экспорт
            </Button>
          </Grid>
        </CardBody>
      </Card>

      {/* Статистика модулей */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
        <Card>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <Code size={32} color="blue" />
              <Stat>
                <StatNumber>{modules.length}</StatNumber>
                <StatLabel>Всего модулей</StatLabel>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
        <Card>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <CheckCircle size={32} color="green" />
              <Stat>
                <StatNumber>{modules.filter(m => m.status === "approved").length}</StatNumber>
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
                <StatNumber>{modules.filter(m => m.status === "pending").length}</StatNumber>
                <StatLabel>На рассмотрении</StatLabel>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
        <Card>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <Download size={32} color="purple" />
              <Stat>
                <StatNumber>{modules.reduce((acc, m) => acc + m.downloads, 0)}</StatNumber>
                <StatLabel>Загрузки</StatLabel>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Таблица модулей */}
      <Card>
        <CardHeader>
          <Heading size="md">Список модулей ({filteredModules.length})</Heading>
        </CardHeader>
        <CardBody p={0}>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg={tableHeaderBg}>
                <Tr>
                  <Th>Модуль</Th>
                  <Th>Автор</Th>
                  <Th>Версия</Th>
                  <Th>Статус</Th>
                  <Th>Категория</Th>
                  <Th>Загрузки</Th>
                  <Th>Обновлено</Th>
                  <Th>Действия</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredModules.map((module) => {
                  const StatusIcon = getStatusIcon(module.status);
                  return (
                    <Tr key={module.id} _hover={{ bg: rowHoverBg }}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="semibold">{module.name}</Text>
                          <Text fontSize="sm" color="gray.500" noOfLines={1}>
                            {module.description}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <HStack>
                          <Avatar size="xs" name={module.author} />
                          <Text fontSize="sm">{module.author}</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge variant="outline">{module.version}</Badge>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={getStatusColor(module.status)}
                          variant="subtle"
                          display="flex"
                          alignItems="center"
                          gap={1}
                          w="fit-content"
                        >
                          <StatusIcon size={12} />
                          {module.status === "approved" ? "Одобрено" :
                           module.status === "pending" ? "На рассмотрении" : "Отклонено"}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge variant="outline" colorScheme="gray">
                          {module.category}
                        </Badge>
                      </Td>
                      <Td>{module.downloads.toLocaleString()}</Td>
                      <Td>{module.lastUpdate}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="Просмотреть детали">
                            <IconButton
                              aria-label="Просмотреть"
                              icon={<Eye size={16} />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewModule(module)}
                            />
                          </Tooltip>
                          {module.status === "pending" && (
                            <>
                              <Tooltip label="Одобрить модуль">
                                <IconButton
                                  aria-label="Одобрить"
                                  icon={<CheckCircle size={16} />}
                                  size="sm"
                                  colorScheme="green"
                                  variant="ghost"
                                  onClick={() => handleApproveModule(module.id)}
                                />
                              </Tooltip>
                              <Tooltip label="Отклонить модуль">
                                <IconButton
                                  aria-label="Отклонить"
                                  icon={<XCircle size={16} />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => handleRejectModule(module.id)}
                                />
                              </Tooltip>
                            </>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>

      {/* Модальное окно с деталями модуля */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Code size={24} />
              <VStack align="start" spacing={0}>
                <Text>{selectedModule?.name}</Text>
                <Text fontSize="sm" color="gray.500">v{selectedModule?.version}</Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedModule && (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="semibold" mb={2}>Описание</Text>
                  <Text>{selectedModule.description}</Text>
                </Box>
                
                <Grid templateColumns="1fr 1fr" gap={4}>
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Автор</Text>
                    <HStack>
                      <Avatar size="sm" name={selectedModule.author} />
                      <Text>{selectedModule.author}</Text>
                    </HStack>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Статус</Text>
                    <Badge colorScheme={getStatusColor(selectedModule.status)}>
                      {selectedModule.status === "approved" ? "Одобрено" :
                       selectedModule.status === "pending" ? "На рассмотрении" : "Отклонено"}
                    </Badge>
                  </Box>
                </Grid>

                <Box>
                  <Text fontWeight="semibold" mb={2}>Зависимости</Text>
                  <HStack wrap="wrap" spacing={2}>
                    {selectedModule.dependencies.map((dep: string) => (
                      <Badge key={dep} variant="outline" colorScheme="blue">
                        <GitBranch size={12} style={{ marginRight: "4px" }} />
                        {dep}
                      </Badge>
                    ))}
                  </HStack>
                </Box>

                <Grid templateColumns="1fr 1fr" gap={4}>
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Загрузки</Text>
                    <Text>{(selectedModule.downloads || 0).toLocaleString()}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Последнее обновление</Text>
                    <Text>{selectedModule.lastUpdate}</Text>
                  </Box>
                </Grid>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              {selectedModule?.status === "pending" && (
                <>
                  <Button 
                    colorScheme="green" 
                    leftIcon={<CheckCircle size={16} />}
                    onClick={() => {
                      handleApproveModule(selectedModule.id);
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
                      handleRejectModule(selectedModule.id);
                      onClose();
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