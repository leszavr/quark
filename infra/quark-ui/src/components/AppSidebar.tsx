
"use client";
// Chakra UI удалён, используем стандартные элементы и Tailwind
import { Home, MessageSquare, User, Puzzle, Settings, BookOpen, LayoutGrid, Zap } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import Link from "next/link";

export function AppSidebar() {
  const { viewMode, setViewMode, unreadChats } = useAppStore();

  const mainItems = [
    { title: "Главная", mode: "home" as const, icon: Home },
    { title: "Блог", mode: "blog-only" as const, icon: BookOpen },
    { title: "Чат", mode: "chat-only" as const, icon: MessageSquare, badge: unreadChats > 0 ? unreadChats.toString() : undefined },
    { title: "Оба окна", mode: "both" as const, icon: LayoutGrid },
  ];

  const systemItems = [
    { title: "Plugin Hub", icon: Puzzle },
    { title: "Settings", icon: Settings },
  ];

  const sidebarBg = "bg-gray-50 dark:bg-gray-800";
  const itemHoverBg = "hover:bg-black/5 dark:hover:bg-white/10";

  return (
    <div className="w-[280px] h-screen bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col">
      {/* Заголовок */}
      <div className="flex items-center mb-6 gap-3">
        <div className="w-8 h-8 rounded-md flex items-center justify-center bg-cyan-400 dark:bg-gray-900 shadow-md">
          <Zap size={18} color="black" />
        </div>
        <span className="text-xl font-bold font-space-grotesk">Quark</span>
      </div>
      {/* Основная навигация */}
      <div className="flex flex-col gap-2 mb-6">
        <span className="text-sm text-gray-500 font-medium mb-2">Навигация</span>
        {mainItems.map((item) => (
          <button
            key={item.title}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors ${viewMode === item.mode ? "bg-cyan-500 text-white" : "bg-transparent text-gray-700 dark:text-gray-300"} ${itemHoverBg}`}
            onClick={() => setViewMode(item.mode)}
          >
            <item.icon size={18} />
            <span>{item.title}</span>
            {item.badge && <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{item.badge}</span>}
          </button>
        ))}
      </div>
      <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
      {/* Системная навигация */}
      <div className="flex flex-col gap-2 mb-4">
        {systemItems.map((item) => (
          <button
            key={item.title}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors bg-transparent text-gray-700 dark:text-gray-300 ${itemHoverBg}`}
          >
            <item.icon size={18} />
            <span>{item.title}</span>
          </button>
        ))}
      </div>
      <div className="flex-1" />
      {/* Профиль пользователя */}
      <Link href="/profile" className="w-full block">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all cursor-pointer">
          <img src="/avatar.png" alt="Иван Петров" className="w-8 h-8 rounded-full object-cover" />
          <div className="flex-1 overflow-hidden">
            <span className="block text-sm font-medium truncate">Иван Петров</span>
            <span className="block text-xs text-gray-500 truncate">@ivanpetrov</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
