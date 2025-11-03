"use client";

import { Card } from "@/shared/ui/card/Card";
import { Button } from "@/shared/ui/button/Button";
import { Badge } from "@/shared/ui/badge/Badge";
import { Dialog } from "@/shared/ui/dialog/Dialog";
import { Switch } from "@/shared/ui/switch/Switch";
import { Label } from "@/shared/ui/label/Label";
import { Alert } from "@/shared/ui/alert/Alert";
import { useState } from "react";
import { 
  Users, Search, Download, Eye, Edit, Trash2, 
  UserCheck, UserX, Shield, Crown, Clock, Calendar,
  Mail, Phone, MapPin, Plus
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
  const [isOpen, setIsOpen] = useState(false);

  // ⚠️ MOCK DATA - Remove when integrating with real API
  // API endpoint: GET /api/admin/users - Expected format: User[]
  const [users] = useState<User[]>([
    {
      id: 1,
      name: "Анна Козлова",
      email: "anna.kozlova@example.com",
      phone: "+7 (999) 123-45-67",
      role: "admin",
      status: "active",
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
      role: "moderator",
      status: "active",
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
      role: "user",
      status: "suspended",
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
      role: "user",
      status: "inactive",
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
      role: "moderator",
      status: "active",
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
  // ⚠️ END MOCK DATA

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusColor = (status: string) => {
    if (status === "active") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (status === "inactive") return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    if (status === "suspended") return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    return "bg-gray-100 text-gray-800";
  };

  const getRoleColor = (role: string) => {
    if (role === "admin") return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    if (role === "moderator") return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  const getStatusText = (status: string) => {
    if (status === "active") return "Активен";
    if (status === "inactive") return "Неактивен";
    if (status === "suspended") return "Заблокирован";
    return status;
  };

  const getRoleText = (role: string) => {
    if (role === "admin") return "Администратор";
    if (role === "moderator") return "Модератор";
    return "Пользователь";
  };

  const getRoleIcon = (role: string) => {
    if (role === "admin") return <Crown size={12} className="text-purple-600" />;
    if (role === "moderator") return <Shield size={12} className="text-blue-600" />;
    return <Users size={12} className="text-gray-600" />;
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold font-['Space_Grotesk']">Управление пользователями</h1>
        <Button className="flex items-center gap-2">
          <Plus size={18} />
          Добавить пользователя
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Users size={32} className="text-blue-500" />
            <p className="text-3xl font-bold">{users.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Всего пользователей</p>
          </div>
        </Card>
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <UserCheck size={32} className="text-green-500" />
            <p className="text-3xl font-bold">{users.filter(u => u.status === "active").length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Активных</p>
          </div>
        </Card>
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Crown size={32} className="text-purple-500" />
            <p className="text-3xl font-bold">{users.filter(u => u.role === "admin").length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Администраторов</p>
          </div>
        </Card>
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <UserX size={32} className="text-red-500" />
            <p className="text-3xl font-bold">{users.filter(u => u.status === "suspended").length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Заблокированных</p>
          </div>
        </Card>
      </div>

      {/* Фильтры */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative col-span-2">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
              placeholder="Поиск по имени или email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="all">Все статусы</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
            <option value="suspended">Заблокированные</option>
          </select>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="all">Все роли</option>
            <option value="admin">Администраторы</option>
            <option value="moderator">Модераторы</option>
            <option value="user">Пользователи</option>
          </select>
        </div>
      </Card>

      {/* Таблица пользователей */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Список пользователей ({filteredUsers.length})</h2>
            <Button variant="outline" disabled={filteredUsers.length === 0} className="flex items-center gap-2">
              <Download size={18} />
              Экспорт
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Пользователь</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Роль</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Местоположение</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Последняя активность</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg">
                        {user.avatar || user.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`flex items-center gap-1 w-fit ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {getRoleText(user.role)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={getStatusColor(user.status)}>
                      {getStatusText(user.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm">{user.location}</td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(user.lastActive).toLocaleString("ru-RU")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        title="Просмотреть детали"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 rounded"
                        title="Редактировать"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded"
                        title="Удалить"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Модальное окно с деталями пользователя */}
      {selectedUser && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl">
                  {selectedUser.avatar || selectedUser.name[0]}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold mb-3">Контактная информация</h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-500" />
                        <span className="text-sm">{selectedUser.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-500" />
                        <span className="text-sm">{selectedUser.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-500" />
                        <span className="text-sm">{selectedUser.location}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Статистика</h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-500" />
                        <span className="text-sm">
                          Последний вход: {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString("ru-RU") : "Неизвестно"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="text-sm">
                          Регистрация: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("ru-RU") : "Неизвестно"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-500" />
                        <span className="text-sm">Сессий: {selectedUser.sessionsCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mb-6">
                  <h3 className="font-semibold mb-4">Настройки аккаунта</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="verified">Верификация аккаунта</Label>
                      <Switch id="verified" checked={selectedUser.verified} disabled />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifications">Уведомления</Label>
                      <Switch id="notifications" defaultChecked disabled />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="two-factor">Двухфакторная аутентификация</Label>
                      <Switch id="two-factor" disabled />
                    </div>
                  </div>
                </div>

                {selectedUser.status === "suspended" && (
                  <Alert variant="destructive" className="mb-6">
                    <p className="text-sm font-semibold">
                      Аккаунт пользователя заблокирован администратором
                    </p>
                  </Alert>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
                <Button className="flex items-center gap-2">
                  <Edit size={16} />
                  Редактировать
                </Button>
                {selectedUser.status === "active" ? (
                  <Button variant="outline" className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                    <UserX size={16} />
                    Заблокировать
                  </Button>
                ) : (
                  <Button variant="outline" className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950">
                    <UserCheck size={16} />
                    Разблокировать
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Закрыть
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
