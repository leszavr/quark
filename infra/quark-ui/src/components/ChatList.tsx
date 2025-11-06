"use client";

import { motion } from "framer-motion";
import { Search, MessageSquare, Plus } from "lucide-react";
import { useChatStorage } from "../hooks/useChatStorage";
import type { Chat } from "../hooks/useChatStorage";
import Image from "next/image";

const MotionBox = motion.create("div");

interface ChatListProps {
  readonly onChatSelect?: (chatId: string) => void;
  readonly selectedChatId?: string;
  readonly fullWidth?: boolean; // Показывать ли в полную ширину без ChatWindow
}

export function ChatList({ onChatSelect, selectedChatId, fullWidth = false }: ChatListProps) {
  const { chats, getUnreadCount } = useChatStorage();

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-3 mb-4 justify-between">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-600 dark:bg-green-400 rounded-md flex items-center justify-center">
              <MessageSquare size={18} className="text-white dark:text-black" />
            </div>
            <span className="text-xl font-bold font-space-grotesk text-gray-600 dark:text-green-400">
              Чаты
            </span>
          </div>

          {/* Кнопка создания нового чата (только в fullWidth режиме) */}
          {fullWidth && (
            <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <Plus size={18} />
            </button>
          )}
        </div>

        {/* Поиск */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Поиск чатов..."
            className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded focus:bg-white dark:focus:bg-gray-600 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Вкладки фильтрации (только в режиме fullWidth) */}
        {fullWidth && (
          <div className="flex mt-4">
            <button className="px-3 py-2 text-sm font-semibold border-b-2 border-cyan-400 text-cyan-400 hover:bg-transparent">
              All Chats (1)
            </button>
            <button className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-cyan-400 hover:bg-transparent">
              Unread (1)
            </button>
            <button className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-cyan-400 hover:bg-transparent">
              Channels
            </button>
          </div>
        )}
      </div>

      {/* Список чатов */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {chats.map((chat: Chat, index: number) => (
            <MotionBox
              key={chat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                type="button"
                className={`w-full p-4 cursor-pointer transition-all duration-200 border-l-3 text-left ${
                  selectedChatId === chat.id 
                    ? "bg-black/5 dark:bg-white/10 border-l-cyan-500" 
                    : "border-l-transparent hover:bg-black/5 dark:hover:bg-white/10"
                }`}
                onClick={() => onChatSelect?.(chat.id)}
              >
                <div className="flex gap-3 items-start">
                  <div className="relative w-12 h-12">
                    {chat.user.avatar.startsWith('http') ? (
                      <Image
                        fill
                        className="rounded-full object-cover"
                        src={chat.user.avatar}
                        alt={chat.user.name}
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl">
                        {chat.user.avatar}
                      </div>
                    )}
                    {chat.user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm truncate flex-1">
                        {chat.user.name}
                      </span>
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-500">
                          {chat.messages.at(-1)?.timestamp || ""}
                        </span>
                        {getUnreadCount(chat.id) > 0 && (
                          <span className="bg-cyan-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center">
                            {getUnreadCount(chat.id)}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs text-gray-500 mb-1">
                      {chat.user.username}
                    </span>

                    <span
                      className={`text-sm text-gray-600 truncate ${
                        getUnreadCount(chat.id) > 0 ? "font-medium" : "font-normal"
                      }`}
                    >
                      {chat.messages.at(-1)?.content || "Нет сообщений"}
                    </span>
                  </div>
                </div>
              </button>
              <div className="border-b border-gray-200 dark:border-gray-700"></div>
            </MotionBox>
          ))}
        </div>
      </div>

      {/* Кнопка создать новый чат */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-cyan-500 text-cyan-700 rounded hover:bg-cyan-50 dark:hover:bg-cyan-900 dark:text-cyan-300">
          <Plus size={16} />
          Новый чат
        </button>
      </div>
    </div>
  );
}