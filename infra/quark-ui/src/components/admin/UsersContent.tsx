"use client";

import {
  VStack, HStack, Flex, Text, Button, Card, CardBody, CardHeader,
  Heading, Badge, Avatar, IconButton, Tooltip, Grid, Input, Select,
  Table, Thead, Tbody, Tr, Th, Td, useColorMode, useColorModeValue, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, Box, Stat, StatNumber, StatLabel, FormControl,
  FormLabel, Switch, Divider, Alert, AlertIcon
} from "@chakra-ui/react";
import { useState } from "react";
import { 
  Users, Search, Filter, Download, Eye, Edit, Trash2, 
  UserCheck, UserX, Shield, Crown, Clock, Calendar,
  Mail, Phone, MapPin, MoreHorizontal, Plus
} from "lucide-react";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  role: "admin" | "user" | "moderator";
  status: "active" | "inactive" | "suspended";
  lastActive: string;
  joinDate: string;
  avatar?: string;
  lastLogin?: string;
  createdAt?: string;
  sessionsCount?: number;
  verified?: boolean;
}

export function UsersContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const rowHoverBg = useColorModeValue("gray.50", "gray.700");

  // Тестовые данные пользователей
  const [users] = useState([
    {
      id: 1,
      name: "Анна Козлова",
      email: "anna.kozlova@example.com",
      phone: "+7 (999) 123-45-67",
      role: "admin" as const,
      status: "active" as const,
      avatar: "👩‍💼",
      lastActive: "2024-01-15T14:30:00Z",
      joinDate: "2023-06-15T10:00:00Z",
      lastLogin: "2024-01-15T14:30:00Z",
      createdAt: "2023-06-15T10:00:00Z",
      location: "Москва",
      sessionsCount: 1247,
      verified: true
    },
    {
      id: 2,
      name: "Дмитрий Петров",
      email: "dmitry.petrov@example.com",
      phone: "+7 (999) 234-56-78",
      role: "moderator" as const,
      status: "active" as const,
      avatar: "👨‍💻",
      lastActive: "2024-01-15T12:15:00Z",
      joinDate: "2023-08-22T09:30:00Z",
      lastLogin: "2024-01-15T12:15:00Z",
      createdAt: "2023-08-22T09:30:00Z",
      location: "Санкт-Петербург",
      sessionsCount: 892,
      verified: true
    },
    {
      id: 3,
      name: "Елена Смирнова",
      email: "elena.smirnova@example.com",
      phone: "+7 (999) 345-67-89",
      role: "user" as const,
      status: "suspended" as const,
      avatar: "👩‍🎨",
      lastActive: "2024-01-10T09:45:00Z",
      joinDate: "2023-12-05T14:20:00Z",
      lastLogin: "2024-01-10T09:45:00Z",
      createdAt: "2023-12-05T14:20:00Z",
      location: "Новосибирск",
      sessionsCount: 42,
      verified: false
    },
    {
      id: 4,
      name: "Михаил Иванов",
      email: "mikhail.ivanov@example.com",
      phone: "+7 (999) 456-78-90",
      role: "user" as const,
      status: "inactive" as const,
      avatar: "👨‍🔧",
      lastActive: "2023-12-28T16:20:00Z",
      joinDate: "2023-11-15T11:30:00Z",
      lastLogin: "2023-12-28T16:20:00Z",
      createdAt: "2023-11-15T11:30:00Z",
      location: "Екатеринбург",
      sessionsCount: 156,
      verified: true
    },
    {
      id: 5,
      name: "Ольга Кузнецова",
      email: "olga.kuznetsova@example.com",
      phone: "+7 (999) 567-89-01",
      role: "moderator" as const,
      status: "active" as const,
      avatar: "👩‍🔬",
      lastActive: "2024-01-15T11:10:00Z",
      joinDate: "2023-09-30T13:45:00Z",
      lastLogin: "2024-01-15T11:10:00Z",
      createdAt: "2023-09-30T13:45:00Z",
      location: "Казань",
      sessionsCount: 634,
      verified: true
    }
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "green";
      case "inactive": return "gray";
      case "suspended": return "red";
      default: return "gray";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "purple";
      case "moderator": return "blue";
      case "user": return "gray";
      default: return "gray";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return Crown;
      case "moderator": return Shield;
      case "user": return Users;
      default: return Users;
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    onOpen();
  };

  const activeUsers = users.filter(u => u.status === "active").length;
  const suspendedUsers = users.filter(u => u.status === "suspended").length;
  const verifiedUsers = users.filter(u => u.verified).length;

  return (
    <VStack spacing={6} align="stretch">
      <Flex justify="space-between" align="center">
        <Heading size="xl" fontFamily="Space Grotesk">Управление пользователями</Heading>
        <HStack>
          <Button colorScheme="blue" leftIcon={<Plus size={18} />}>
            Добавить пользователя
          </Button>
          <Button variant="outline" leftIcon={<Download size={18} />}>
            Экспорт
          </Button>
        </HStack>
      </Flex>

      {/* Статистика пользователей */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>
        <Card>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <Users size={32} color="blue" />
              <Stat>
                <StatNumber>{users.length}</StatNumber>
                <StatLabel>Всего пользователей</StatLabel>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
        <Card>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <UserCheck size={32} color="green" />
              <Stat>
                <StatNumber>{activeUsers}</StatNumber>
                <StatLabel>Активных</StatLabel>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
        <Card>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <UserX size={32} color="red" />
              <Stat>
                <StatNumber>{suspendedUsers}</StatNumber>
                <StatLabel>Заблокировано</StatLabel>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
        <Card>
          <CardBody textAlign="center">
            <VStack spacing={2}>
              <Shield size={32} color="purple" />
              <Stat>
                <StatNumber>{verifiedUsers}</StatNumber>
                <StatLabel>Верифицировано</StatLabel>
              </Stat>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Фильтры и поиск */}
      <Card>
        <CardBody>
          <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr 200px" }} gap={4}>
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
                placeholder="Поиск по имени или email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Box>
            <Select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
              <option value="suspended">Заблокированные</option>
            </Select>
            <Select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Все роли</option>
              <option value="admin">Администраторы</option>
              <option value="moderator">Модераторы</option>
              <option value="user">Пользователи</option>
            </Select>
            <Button 
              variant="outline" 
              leftIcon={<Filter size={18} />}
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setRoleFilter("all");
              }}
            >
              Сбросить
            </Button>
          </Grid>
        </CardBody>
      </Card>

      {/* Таблица пользователей */}
      <Card>
        <CardHeader>
          <Heading size="md">Пользователи ({filteredUsers.length})</Heading>
        </CardHeader>
        <CardBody p={0}>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg={useColorModeValue("gray.50", "gray.700")}>
                <Tr>
                  <Th>Пользователь</Th>
                  <Th>Роль</Th>
                  <Th>Статус</Th>
                  <Th>Последний вход</Th>
                  <Th>Сессии</Th>
                  <Th>Верификация</Th>
                  <Th>Действия</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <Tr key={user.id} _hover={{ bg: rowHoverBg }}>
                      <Td>
                        <HStack spacing={3}>
                          <Box fontSize="2xl">{user.avatar}</Box>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="semibold">{user.name}</Text>
                            <Text fontSize="sm" color="gray.500">{user.email}</Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={getRoleColor(user.role)}
                          variant="subtle"
                          display="flex"
                          alignItems="center"
                          gap={1}
                          w="fit-content"
                        >
                          <RoleIcon size={12} />
                          {user.role === "admin" ? "Администратор" :
                           user.role === "moderator" ? "Модератор" : "Пользователь"}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(user.status)}>
                          {user.status === "active" ? "Активен" :
                           user.status === "inactive" ? "Неактивен" : "Заблокирован"}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {new Date(user.lastLogin).toLocaleDateString("ru-RU")}
                        </Text>
                      </Td>
                      <Td>{user.sessionsCount}</Td>
                      <Td>
                        {user.verified ? (
                          <Badge colorScheme="green">Верифицирован</Badge>
                        ) : (
                          <Badge colorScheme="orange">Не верифицирован</Badge>
                        )}
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <Tooltip label="Просмотреть профиль">
                            <IconButton
                              aria-label="Просмотреть"
                              icon={<Eye size={16} />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewUser(user)}
                            />
                          </Tooltip>
                          <Tooltip label="Редактировать">
                            <IconButton
                              aria-label="Редактировать"
                              icon={<Edit size={16} />}
                              size="sm"
                              variant="ghost"
                            />
                          </Tooltip>
                          <Tooltip label="Дополнительно">
                            <IconButton
                              aria-label="Дополнительно"
                              icon={<MoreHorizontal size={16} />}
                              size="sm"
                              variant="ghost"
                            />
                          </Tooltip>
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

      {/* Модальное окно с деталями пользователя */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Box fontSize="2xl">{selectedUser?.avatar}</Box>
              <VStack align="start" spacing={0}>
                <Text>{selectedUser?.name}</Text>
                <Text fontSize="sm" color="gray.500">{selectedUser?.email}</Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <VStack align="stretch" spacing={4}>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box>
                    <Text fontWeight="semibold" mb={2}>Контактная информация</Text>
                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Mail size={16} />
                        <Text fontSize="sm">{selectedUser.email}</Text>
                      </HStack>
                      <HStack>
                        <Phone size={16} />
                        <Text fontSize="sm">{selectedUser.phone}</Text>
                      </HStack>
                      <HStack>
                        <MapPin size={16} />
                        <Text fontSize="sm">{selectedUser.location}</Text>
                      </HStack>
                    </VStack>
                  </Box>

                  <Box>
                    <Text fontWeight="semibold" mb={2}>Статистика</Text>
                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Clock size={16} />
                        <Text fontSize="sm">
                          Последний вход: {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString("ru-RU") : "Неизвестно"}
                        </Text>
                      </HStack>
                      <HStack>
                        <Calendar size={16} />
                        <Text fontSize="sm">
                          Регистрация: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("ru-RU") : "Неизвестно"}
                        </Text>
                      </HStack>
                      <HStack>
                        <Users size={16} />
                        <Text fontSize="sm">Сессий: {selectedUser.sessionsCount}</Text>
                      </HStack>
                    </VStack>
                  </Box>
                </Grid>

                <Divider />

                <Box>
                  <Text fontWeight="semibold" mb={3}>Настройки аккаунта</Text>
                  <VStack spacing={3}>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="verified" mb="0">
                        Верификация аккаунта
                      </FormLabel>
                      <Switch id="verified" isChecked={selectedUser.verified} />
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="notifications" mb="0">
                        Уведомления
                      </FormLabel>
                      <Switch id="notifications" defaultChecked />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="two-factor" mb="0">
                        Двухфакторная аутентификация
                      </FormLabel>
                      <Switch id="two-factor" />
                    </FormControl>
                  </VStack>
                </Box>

                {selectedUser.status === "suspended" && (
                  <Alert status="warning">
                    <AlertIcon />
                    Аккаунт пользователя заблокирован администратором
                  </Alert>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button 
                colorScheme="blue" 
                leftIcon={<Edit size={16} />}
              >
                Редактировать
              </Button>
              {selectedUser?.status === "active" ? (
                <Button 
                  colorScheme="red" 
                  variant="outline"
                  leftIcon={<UserX size={16} />}
                >
                  Заблокировать
                </Button>
              ) : (
                <Button 
                  colorScheme="green" 
                  variant="outline"
                  leftIcon={<UserCheck size={16} />}
                >
                  Разблокировать
                </Button>
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