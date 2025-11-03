"use client";

import { Card } from "@/shared/ui/card/Card";
import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";
import { 
  Users, Activity, Monitor, Cpu, Bell, Settings, 
  FileText, Plus, Download, RefreshCw
} from "lucide-react";
type UsersProps = React.ComponentProps<typeof Users>;

// Компонент главной страницы админки
export function DashboardContent() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl font-bold font-['Space_Grotesk']">
        Обзор системы
      </h1>
      
      {/* Карточки статистики */}
      <div className="flex flex-wrap gap-4">
        <StatCard title="Активные пользователи" value="8,450" change="+12%" changeType="positive" icon={Users} />
        <StatCard title="Загруженные модули" value="12" change="+2" changeType="positive" icon={Cpu} />
        <StatCard title="Активные ИИ-агенты" value="3" change="stable" changeType="neutral" icon={Monitor} />
        <StatCard title="Доступность" value="99.95%" change="+0.01%" changeType="positive" icon={Activity} />
      </div>

      {/* Лента событий и быстрые действия */}
      <div className="flex flex-col lg:flex-row gap-6">
        <EventsFeed />
        <QuickActions />
      </div>
    </div>
  );
}

// Компонент статистической карточки
function StatCard({ title, value, change, changeType, icon: Icon }: { 
  readonly title: string;
  readonly value: string;
  readonly change: string;
  readonly changeType: "positive" | "negative" | "neutral";
  readonly icon?: React.ComponentType<UsersProps>
}) {
  const changeColorClass = {
    positive: "text-green-500",
    negative: "text-red-500",
    neutral: "text-gray-500"
  }[changeType];
  
  const iconColorClass = {
    positive: "text-green-500",
    negative: "text-red-500",
    neutral: "text-gray-500"
  }[changeType];

  return (
    <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm min-w-[200px] hover:-translate-y-0.5 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{title}</p>
        {Icon && <Icon size={20} className={iconColorClass} />}
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className={`text-sm font-medium ${changeColorClass}`}>{change}</p>
    </div>
  );
}

// Компонент ленты событий
function EventsFeed() {
  const events = [
    { id: 1, type: "info", message: "Новый пользователь зарегистрирован", time: "2 мин назад" },
    { id: 2, type: "success", message: "Модуль \"User Auth\" одобрен", time: "15 мин назад" },
    { id: 3, type: "warning", message: "Высокая нагрузка на сервер", time: "1 час назад" },
    { id: 4, type: "info", message: "Создан новый ИИ-агент", time: "2 часа назад" }
  ];
  
  const getEventColor = (type: string) => {
    if (type === "success") return "bg-green-500";
    if (type === "warning") return "bg-orange-500";
    return "bg-blue-500";
  };

  return (
    <Card className="flex-[2] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Лента событий</h2>
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-2"
          aria-label="Обновить"
        >
          <RefreshCw size={16} />
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-3 p-3 rounded-md bg-gray-50 dark:bg-gray-700">
            <div className={`w-3 h-3 rounded-full mt-1 ${getEventColor(event.type)}`} />
            <div className="flex-1">
              <p className="text-sm font-medium">{event.message}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// Компонент быстрых действий
function QuickActions() {
  return (
    <Card className="flex-1 min-w-[300px] p-6">
      <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Button
              size="lg"
              className="rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all"
              aria-label="Новый модуль"
              title="Создать новый модуль"
            >
              <Plus size={20} />
            </Button>
          </div>
          <div className="relative group">
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all"
              aria-label="Экспорт"
              title="Экспорт данных"
            >
              <Download size={20} />
            </Button>
          </div>
          <div className="relative group">
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all relative"
              aria-label="Уведомления"
              title="Просмотреть уведомления (3)"
            >
              <Bell size={20} />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-xs rounded-full flex items-center justify-center"
              >
                3
              </Badge>
            </Button>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800" />
        
        {/* Дополнительные действия */}
        <div className="flex flex-col gap-2 w-full">
          <p className="text-xs text-gray-500 text-center">Дополнительно</p>
          <div className="flex items-center justify-between w-full gap-2">
            <Button
              size="sm"
              variant="outline"
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Просмотр логов"
              title="Системные логи"
            >
              <FileText size={16} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Настройки системы"
              title="Настройки"
            >
              <Settings size={16} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Мониторинг"
              title="Мониторинг"
            >
              <Monitor size={16} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}