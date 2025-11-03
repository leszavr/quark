"use client";

import { Home, Moon, Sun, Settings, LogOut, User, Zap, MessageSquare, MessageSquareOff } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/stores/appStore";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/shared/ui/dropdown-menu/DropdownMenu";
import { Button } from "@/shared/ui/button/Button";

interface HeaderProps {
  readonly showHomeButton?: boolean;
}

export function Header({ showHomeButton = false }: HeaderProps) {
  const { viewMode, setViewMode, chatWindow, setChatWindow } = useAppStore();
  
  const isChatVisible = chatWindow.isOpen && (viewMode === "both" || viewMode === "chat-only" || viewMode === "home");
  
  const toggleChat = () => {
    if (isChatVisible) {
      // Скрываем только чат, блог остается открытым
      setViewMode("blog-only");
      setChatWindow({ isOpen: false });
    } else {
      // Показываем чат в режиме both (блог + чат)
      setChatWindow({ isOpen: true });
      setViewMode("both");
    }
  };

  return (
    <header className="sticky top-0 z-[1000] w-full border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Левая часть - Логотип и домой (если нужно) */}
        <div className="flex items-center gap-4">
          {showHomeButton && (
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Home size={20} />
              </Button>
            </Link>
          )}
          
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              {/* Логотип */}
              <div className="w-10 h-10 rounded-lg bg-gray-900 dark:bg-cyan-400 flex items-center justify-center shadow-lg shadow-gray-900/30 dark:shadow-cyan-400/30">
                <Zap size={20} className="text-white dark:text-black" />
              </div>
              
              <span className="text-2xl font-bold font-['Space_Grotesk'] text-gray-900 dark:text-cyan-400">
                Quark
              </span>
            </div>
          </Link>
        </div>

        {/* Правая часть - Управление чатом, переключатель темы и профиль */}
        <div className="flex items-center gap-3">
          {/* Переключатель мессенджера */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleChat}
            className="hover:bg-gray-50 dark:hover:bg-gray-800"
            aria-label={isChatVisible ? "Скрыть мессенджер" : "Показать мессенджер"}
          >
            {isChatVisible ? <MessageSquareOff size={20} /> : <MessageSquare size={20} />}
          </Button>

          {/* Переключатель темы */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const html = document.documentElement;
              html.classList.toggle('dark');
            }}
            className="hover:bg-gray-50 dark:hover:bg-gray-800"
            aria-label="Переключить тему"
          >
            <Moon size={20} className="hidden dark:block" />
            <Sun size={20} className="block dark:hidden" />
          </Button>

          {/* Меню профиля */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                  <User size={16} />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">Иван Петров</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">@ivanpetrov</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-48">
              <Link href="/profile">
                <DropdownMenuItem>
                  <User size={16} />
                  <span>Профиль</span>
                </DropdownMenuItem>
              </Link>
              
              <DropdownMenuItem>
                <Settings size={16} />
                <span>Настройки</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="text-red-500">
                <LogOut size={16} />
                <span>Выйти</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}