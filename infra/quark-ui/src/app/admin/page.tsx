"use client";

// Chakra UI удалён, используем стандартные элементы и Tailwind
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { DashboardContent } from "@/components/admin/DashboardContent";
import { ModulesContent } from "@/components/admin/ModulesContent";
import { AIopsContent } from "@/components/admin/AIopsContent";
import { MonitoringContent } from "@/components/admin/MonitoringContent";
import { UsersContent } from "@/components/admin/UsersContent";
import { SecurityContent } from "@/components/admin/SecurityContent";
import { SettingsContent } from "@/components/admin/SettingsContent";

// Импорты иконок
import { 
  Home, Settings, Monitor, Cpu, Shield, Users, 
  ChevronLeft, ChevronRight, Menu
} from "lucide-react";

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const activeBg = "bg-blue-500";
  const inactiveBg = "bg-gray-100 dark:bg-gray-700";

  const menuItems = [
    { id: "dashboard", label: "Главная", icon: Home },
    { id: "users", label: "Пользователи", icon: Users },
    { id: "modules", label: "Модули", icon: Cpu },
    { id: "ai-ops", label: "AI Ops Console", icon: Monitor },
    { id: "monitoring", label: "Мониторинг", icon: Monitor },
    { id: "security", label: "Безопасность", icon: Shield },
    { id: "settings", label: "Настройки", icon: Settings },
  ];

  const getIconForSection = (sectionId: string) => {
    const item = menuItems.find(item => item.id === sectionId);
    return item?.icon || Home;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header showHomeButton={true} />
      <div className="flex">
        {/* Sidebar */}
        <div className={`transition-all duration-300 relative ${sidebarCollapsed ? "w-[70px]" : "w-[280px]"} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-80px)]`}>
          {/* Кнопка сворачивания */}
          <button
            aria-label="Toggle sidebar"
            className="absolute top-4 right-2 z-10 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <div className="flex flex-col gap-1 p-4 pt-12">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  className={`flex items-center w-full h-12 px-2 text-sm rounded transition-colors duration-150 ${isActive ? "bg-blue-500 text-white" : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"} ${sidebarCollapsed ? "justify-center" : "justify-start"}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <IconComponent size={20} className="mr-2" />
                  {!sidebarCollapsed && item.label}
                </button>
              );
            })}
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );

  function renderContent() {
    switch (activeSection) {
      case "dashboard":
        return <DashboardContent />;
      case "users":
        return <UsersContent />;
      case "modules":
        return <ModulesContent />;
      case "ai-ops":
        return <AIopsContent />;
      case "monitoring":
        return <MonitoringContent />;
      case "security":
        return <SecurityContent />;
      case "settings":
        return <SettingsContent />;
      default:
        return (
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-500">🚧 В разработке</h1>
            <p className="text-gray-500">Раздел "{activeSection}" будет реализован на следующем этапе</p>
          </div>
        );
    }
  }
}