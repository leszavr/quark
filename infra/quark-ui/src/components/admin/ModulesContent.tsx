"use client";

import { Card } from "@/shared/ui/card/Card";
import { Button } from "@/shared/ui/button/Button";
import { Badge } from "@/shared/ui/badge/Badge";
import { Alert } from "@/shared/ui/alert/Alert";
import { Dialog } from "@/shared/ui/dialog/Dialog";
import { useState } from "react";
import { 
  Package, Search, Download, Eye, Check, X, 
  Upload, CheckCircle, Clock, Shield,
  Code, Database, Server, Settings, FileText
} from "lucide-react";

interface Module {
  id: number;
  name: string;
  version: string;
  author: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "active";
  type: "wasm" | "docker" | "grpc";
  size: string;
  uploadDate: string;
  approvedBy?: string;
  approvedDate?: string;
  icon?: string;
  tags: string[];
}

export function ModulesContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // ⚠️ MOCK DATA - Remove when integrating with real API
  // API endpoint: GET /api/admin/modules - Expected format: Module[]
  const [modules] = useState<Module[]>([
    {
      id: 1,
      name: "blog-generator",
      version: "1.2.0",
      author: "AI Team",
      description: "Автоматическая генерация блог-постов с помощью AI",
      status: "active",
      type: "wasm",
      size: "2.4 MB",
      uploadDate: "2024-01-10T14:30:00Z",
      approvedBy: "admin@example.com",
      approvedDate: "2024-01-11T09:15:00Z",
      icon: "📝",
      tags: ["ai", "content", "generation"]
    },
    {
      id: 2,
      name: "sentiment-analyzer",
      version: "2.0.1",
      author: "Data Science Lab",
      description: "Анализ тональности текстов и комментариев",
      status: "approved",
      type: "docker",
      size: "128 MB",
      uploadDate: "2024-01-12T10:20:00Z",
      approvedBy: "admin@example.com",
      approvedDate: "2024-01-12T16:45:00Z",
      icon: "🎭",
      tags: ["ai", "nlp", "analysis"]
    },
    {
      id: 3,
      name: "data-pipeline",
      version: "3.1.0",
      author: "Backend Team",
      description: "Обработка и трансформация данных в реальном времени",
      status: "pending",
      type: "grpc",
      size: "15.7 MB",
      uploadDate: "2024-01-14T11:00:00Z",
      icon: "🔄",
      tags: ["data", "etl", "streaming"]
    },
    {
      id: 4,
      name: "image-optimizer",
      version: "1.0.5",
      author: "Media Team",
      description: "Оптимизация и сжатие изображений без потери качества",
      status: "rejected",
      type: "wasm",
      size: "1.8 MB",
      uploadDate: "2024-01-08T09:30:00Z",
      approvedBy: "security@example.com",
      approvedDate: "2024-01-09T14:20:00Z",
      icon: "🖼️",
      tags: ["media", "optimization", "image"]
    },
    {
      id: 5,
      name: "auth-middleware",
      version: "2.5.3",
      author: "Security Team",
      description: "Расширенная аутентификация и контроль доступа",
      status: "active",
      type: "docker",
      size: "45 MB",
      uploadDate: "2024-01-05T08:00:00Z",
      approvedBy: "admin@example.com",
      approvedDate: "2024-01-06T10:30:00Z",
      icon: "🔐",
      tags: ["security", "auth", "middleware"]
    }
  ]);
  // ⚠️ END MOCK DATA

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || module.status === statusFilter;
    const matchesType = typeFilter === "all" || module.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    if (status === "active") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (status === "approved") return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (status === "pending") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    if (status === "rejected") return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    return "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string) => {
    if (status === "active") return "Активен";
    if (status === "approved") return "Одобрен";
    if (status === "pending") return "На рассмотрении";
    if (status === "rejected") return "Отклонен";
    return status;
  };

  const getStatusIcon = (status: string) => {
    if (status === "active") return <CheckCircle size={14} />;
    if (status === "approved") return <Check size={14} />;
    if (status === "pending") return <Clock size={14} />;
    if (status === "rejected") return <X size={14} />;
    return null;
  };

  const getTypeColor = (type: string) => {
    if (type === "wasm") return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    if (type === "docker") return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200";
    if (type === "grpc") return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    return "bg-gray-100 text-gray-800";
  };

  const getTypeIcon = (type: string) => {
    if (type === "wasm") return <Code size={14} />;
    if (type === "docker") return <Database size={14} />;
    if (type === "grpc") return <Server size={14} />;
    return null;
  };

  const handleViewModule = (module: Module) => {
    setSelectedModule(module);
    setIsOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold font-['Space_Grotesk']">Управление модулями</h1>
        <Button className="flex items-center gap-2">
          <Upload size={18} />
          Загрузить модуль
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Package size={32} className="text-blue-500" />
            <p className="text-3xl font-bold">{modules.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Всего модулей</p>
          </div>
        </Card>
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <CheckCircle size={32} className="text-green-500" />
            <p className="text-3xl font-bold">{modules.filter(m => m.status === "active").length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Активных</p>
          </div>
        </Card>
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Clock size={32} className="text-yellow-500" />
            <p className="text-3xl font-bold">{modules.filter(m => m.status === "pending").length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Ожидают</p>
          </div>
        </Card>
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Shield size={32} className="text-purple-500" />
            <p className="text-3xl font-bold">{modules.filter(m => m.type === "wasm").length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">WASM модулей</p>
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
              placeholder="Поиск по названию или описанию..."
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
            <option value="approved">Одобренные</option>
            <option value="pending">На рассмотрении</option>
            <option value="rejected">Отклоненные</option>
          </select>
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="all">Все типы</option>
            <option value="wasm">WASM</option>
            <option value="docker">Docker</option>
            <option value="grpc">gRPC</option>
          </select>
        </div>
      </Card>

      {/* Таблица модулей */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Список модулей ({filteredModules.length})</h2>
            <Button variant="outline" disabled={filteredModules.length === 0} className="flex items-center gap-2">
              <Download size={18} />
              Экспорт
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Модуль</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Тип</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Версия</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Статус</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Размер</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Дата загрузки</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {filteredModules.map((module) => (
                <tr key={module.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl">
                        {module.icon || "📦"}
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold">{module.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{module.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`flex items-center gap-1 w-fit uppercase ${getTypeColor(module.type)}`}>
                      {getTypeIcon(module.type)}
                      {module.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono">{module.version}</td>
                  <td className="px-6 py-4">
                    <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(module.status)}`}>
                      {getStatusIcon(module.status)}
                      {getStatusText(module.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm">{module.size}</td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(module.uploadDate).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewModule(module)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        title="Просмотреть детали"
                      >
                        <Eye size={16} />
                      </button>
                      {module.status === "pending" && (
                        <>
                          <button
                            className="p-1 hover:bg-green-100 dark:hover:bg-green-900 text-green-600 rounded"
                            title="Одобрить"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 rounded"
                            title="Отклонить"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      <button
                        className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 rounded"
                        title="Настройки"
                      >
                        <Settings size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Модальное окно с деталями модуля */}
      {selectedModule && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl">
                  {selectedModule.icon || "📦"}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{selectedModule.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">v{selectedModule.version} • {selectedModule.author}</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col gap-6">
                  {/* Описание */}
                  <div>
                    <h3 className="font-semibold mb-2">Описание</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{selectedModule.description}</p>
                  </div>

                  {/* Теги */}
                  <div>
                    <h3 className="font-semibold mb-2">Теги</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedModule.tags.map((tag) => (
                        <Badge key={tag} className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Технические детали */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-3">Технические характеристики</h3>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(selectedModule.type)}
                          <span className="text-sm">Тип: <strong>{selectedModule.type.toUpperCase()}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-gray-500" />
                          <span className="text-sm">Размер: <strong>{selectedModule.size}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-gray-500" />
                          <span className="text-sm">
                            Загружен: <strong>{new Date(selectedModule.uploadDate).toLocaleDateString("ru-RU")}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Статус одобрения</h3>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(selectedModule.status)}
                          <span className="text-sm">
                            Статус: <Badge className={getStatusColor(selectedModule.status)}>{getStatusText(selectedModule.status)}</Badge>
                          </span>
                        </div>
                        {selectedModule.approvedBy && (
                          <>
                            <div className="flex items-center gap-2">
                              <Shield size={16} className="text-gray-500" />
                              <span className="text-sm">Одобрено: <strong>{selectedModule.approvedBy}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={16} className="text-gray-500" />
                              <span className="text-sm">
                                Дата: <strong>{selectedModule.approvedDate ? new Date(selectedModule.approvedDate).toLocaleDateString("ru-RU") : "—"}</strong>
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Предупреждение для отклоненных */}
                  {selectedModule.status === "rejected" && (
                    <Alert variant="destructive">
                      <p className="text-sm font-semibold">
                        Модуль был отклонен по соображениям безопасности или несоответствия требованиям платформы
                      </p>
                    </Alert>
                  )}

                  {/* Информация для ожидающих */}
                  {selectedModule.status === "pending" && (
                    <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                        Модуль ожидает проверки администратором перед активацией
                      </p>
                    </Alert>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
                {selectedModule.status === "pending" && (
                  <>
                    <Button variant="outline" className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950">
                      <Check size={16} />
                      Одобрить
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                      <X size={16} />
                      Отклонить
                    </Button>
                  </>
                )}
                {selectedModule.status === "active" && (
                  <Button variant="outline" className="flex items-center gap-2">
                    <Settings size={16} />
                    Настройки
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