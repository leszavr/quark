"use client";

import { useState } from "react";
import { Card } from "@/shared/ui/card/Card";
import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";
import { Progress } from "@/shared/ui/progress/Progress";
import { Alert } from "@/shared/ui/alert/Alert";
import { 
  Users, Activity, Clock, TrendingUp, Play, Pause
} from "lucide-react";

export function MonitoringContent() {
  const [timeRange, setTimeRange] = useState("24h");
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // ⚠️ MOCK DATA - Remove when integrating with real monitoring API
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
  };

  const alerts = [
    {
      id: 1,
      type: "warning" as const,
      message: "Высокое использование памяти на сервере app-01",
      timestamp: new Date().toLocaleString("ru-RU"),
      resolved: false
    },
    {
      id: 2,
      type: "info" as const,
      message: "Завершено обновление модуля аутентификации",
      timestamp: new Date(Date.now() - 15*60000).toLocaleString("ru-RU"),
      resolved: true
    },
    {
      id: 3,
      type: "error" as const,
      message: "Ошибка подключения к базе данных (временно)",
      timestamp: new Date(Date.now() - 45*60000).toLocaleString("ru-RU"),
      resolved: true
    }
  ];

  const getProgressColor = (value: number, warning: number, danger: number) => {
    if (value > danger) return "bg-red-500";
    if (value > warning) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold font-['Space_Grotesk']">Мониторинг системы</h1>
          <p className="text-gray-500 dark:text-gray-400">Отслеживание производительности и состояния платформы</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm w-[120px]"
          >
            <option value="1h">1 час</option>
            <option value="6h">6 часов</option>
            <option value="24h">24 часа</option>
            <option value="7d">7 дней</option>
          </select>
          <Button 
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isAutoRefresh ? <Pause size={16} /> : <Play size={16} />}
            {isAutoRefresh ? "Пауза" : "Авто"}
          </Button>
        </div>
      </div>

      {/* Системные метрики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Здоровье системы */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Состояние системы</h2>
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <div className="flex justify-between mb-2">
                <p className="text-sm">CPU</p>
                <p className="text-sm font-semibold">{metrics.systemHealth.cpu}%</p>
              </div>
              <Progress 
                value={metrics.systemHealth.cpu} 
                className={getProgressColor(metrics.systemHealth.cpu, 60, 80)}
              />
            </div>
            
            <div className="w-full">
              <div className="flex justify-between mb-2">
                <p className="text-sm">Память</p>
                <p className="text-sm font-semibold">{metrics.systemHealth.memory}%</p>
              </div>
              <Progress 
                value={metrics.systemHealth.memory} 
                className={getProgressColor(metrics.systemHealth.memory, 70, 85)}
              />
            </div>
            
            <div className="w-full">
              <div className="flex justify-between mb-2">
                <p className="text-sm">Диск</p>
                <p className="text-sm font-semibold">{metrics.systemHealth.disk}%</p>
              </div>
              <Progress 
                value={metrics.systemHealth.disk} 
                className={getProgressColor(metrics.systemHealth.disk, 75, 90)}
              />
            </div>
            
            <div className="w-full">
              <div className="flex justify-between mb-2">
                <p className="text-sm">Сеть</p>
                <p className="text-sm font-semibold">{metrics.systemHealth.network} Мбит/с</p>
              </div>
              <Progress 
                value={(metrics.systemHealth.network / 100) * 100} 
                className="bg-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Производительность */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Производительность</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {metrics.performance.responseTime}мс
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Время отклика</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {metrics.performance.throughput.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Запросов/ч</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {metrics.performance.errorRate}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ошибки</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">
                {metrics.performance.uptime}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Доступность</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Пользователи онлайн */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Активность пользователей</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Users size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold">{metrics.users.online}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Онлайн сейчас</p>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Activity size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold">{metrics.users.active24h.toLocaleString()}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">За 24 часа</p>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <TrendingUp size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold">{metrics.users.newToday}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Новых сегодня</p>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <Clock size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-2xl font-bold">{metrics.users.sessionsAvg}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Мин/сессия</p>
          </div>
        </div>
      </Card>

      {/* Алерты */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Последние события</h2>
          <Badge variant="secondary">{alerts.filter(a => !a.resolved).length} активных</Badge>
        </div>
        <div className="flex flex-col gap-3">
          {alerts.map((alert) => (
            <Alert 
              key={alert.id}
              variant={alert.type === "error" ? "destructive" : "default"}
              className={`rounded-md ${alert.resolved ? "opacity-70" : ""}`}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{alert.message}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{alert.timestamp}</p>
                    {alert.resolved && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Решено</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      </Card>
    </div>
  );
}