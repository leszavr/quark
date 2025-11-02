"use client";

import { useState, useEffect, useCallback } from "react";

export interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  type: "image" | "video" | "audio" | "document";
  url?: string;
  preview?: string; // для изображений
  mimeType: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: "user" | "other";
  senderId: string; // ID отправителя сообщения
  isRead: boolean; // прочитано ли сообщение
  type?: "text" | "image" | "file" | "audio";
  attachments?: MessageAttachment[]; // новое поле для файлов
  // Оставляем старые поля для совместимости
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
}

export interface ChatUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Chat {
  id: string;
  user: ChatUser;
  messages: Message[];
  lastActivity: string;
}

// Моковые данные чатов с правильной структурой
const initialChats: Chat[] = [
  {
    id: "chat-1",
    user: {
      id: "user-anna",
      name: "Анна Смирнова",
      username: "@anna_dev",
      avatar: "👩‍💻",
      isOnline: true,
    },
    lastActivity: "2024-01-15T14:30:00",
    messages: [
      {
        id: "msg-1",
        sender: "other",
        senderId: "user-anna",
        content: "Привет! Как дела с новым проектом?",
        timestamp: "10:30",
        isRead: true,
        type: "text"
      },
      {
        id: "msg-2",
        sender: "user",
        senderId: "current-user",
        content: "Всё отлично! Уже настроил базовую структуру",
        timestamp: "10:32",
        isRead: true,
        type: "text"
      },
      {
        id: "msg-3",
        sender: "other",
        senderId: "user-anna",
        content: "Супер! Можешь показать что получилось?",
        timestamp: "10:35",
        isRead: true,
        type: "text"
      },
      {
        id: "msg-4",
        sender: "user",
        senderId: "current-user",
        content: "**Конечно!** Вот что уже сделано:\n\n- ✅ Настроил Next.js 15 с TypeScript\n- ✅ Подключил Chakra UI\n- ✅ Создал систему чатов\n- 🚧 Работаю над блог-системой\n\nКод можно посмотреть здесь: [GitHub Repository](https://github.com/example/quark-ui)",
        timestamp: "10:36",
        isRead: true,
        type: "text"
      },
      {
        id: "msg-5",
        sender: "other",
        senderId: "user-anna",
        content: "Вау, круто! А `markdown` в чате работает? 😮",
        timestamp: "10:38",
        isRead: true,
        type: "text"
      },
      {
        id: "msg-6",
        sender: "user",
        senderId: "current-user",
        content: "## 🎉 Сюрприз!\n\nДа, это **пасхальное яичко**! Попробуй написать:\n\n```javascript\nconst magic = \"markdown в чате!\"\nconsole.log(magic)\n```\n\nИли просто используй *курсив* и **жирный** текст! 🚀",
        timestamp: "10:40",
        isRead: true,
        type: "text"
      },
      {
        id: "msg-7",
        sender: "other",
        senderId: "user-anna",
        content: "Отлично! Когда планируешь релиз?",
        timestamp: "14:30",
        isRead: false,
        type: "text"
      },
    ]
  },
  {
    id: "chat-2",
    user: {
      id: "user-mike",
      name: "Михаил Петров",
      username: "@mike_design",
      avatar: "🎨",
      isOnline: true,
    },
    lastActivity: "2024-01-15T13:45:00",
    messages: [
      {
        id: "msg-2-1",
        sender: "other",
        senderId: "user-mike",
        content: "Посмотри новый дизайн в Figma",
        timestamp: "13:45",
        isRead: true,
        type: "text"
      },
      {
        id: "msg-2-2",
        sender: "user",
        senderId: "current-user",
        content: "Отличный дизайн! Особенно нравится цветовая схема",
        timestamp: "13:50",
        isRead: true,
        type: "text"
      },
    ]
  },
  {
    id: "chat-3",
    user: {
      id: "user-elena",
      name: "Елена Козлова",
      username: "@elena_pm",
      avatar: "👩‍💼",
      isOnline: false,
      lastSeen: "вчера в 18:30",
    },
    lastActivity: "2024-01-14T18:30:00",
    messages: [
      {
        id: "msg-3-1",
        sender: "other",
        senderId: "user-elena",
        content: "Нужно обсудить техзадание",
        timestamp: "Вчера",
        isRead: false,
        type: "text"
      },
    ]
  },
];

// Текущий пользователь
const currentUser = {
  id: "current-user",
  name: "Вы",
  username: "@you",
  avatar: "🚀",
};

export function useChatStorage() {
  const [chats, setChats] = useState<Chat[]>(initialChats); // Инициализируем сразу
  const [loading, setLoading] = useState(true);

  // Загрузка чатов из localStorage (только в браузере)
  useEffect(() => {
    // Проверяем, что мы в браузере
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const loadChats = () => {
      try {
        const stored = localStorage.getItem("quark-chats");
        if (stored) {
          const parsedChats = JSON.parse(stored);
          setChats(parsedChats);
        } else {
          localStorage.setItem("quark-chats", JSON.stringify(initialChats));
        }
      } catch (error) {
        console.error("Ошибка загрузки чатов:", error);
        // Оставляем initialChats, которые уже в state
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  // Сохранение чатов в localStorage
  const saveChats = useCallback((newChats: Chat[]) => {
    setChats(newChats);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("quark-chats", JSON.stringify(newChats));
      } catch (error) {
        console.error("Ошибка сохранения чатов:", error);
      }
    }
  }, []);

  // Отправка сообщения с поддержкой вложений
  const sendMessage = useCallback((chatId: string, content: string, attachments?: MessageAttachment[]): Message => {
    const hasAttachments = attachments && attachments.length > 0;
    const messageType = hasAttachments 
      ? (attachments[0].type === "image" ? "image" : "file")
      : "text";
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      timestamp: new Date().toLocaleTimeString("ru-RU", { 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
      sender: "user",
      senderId: currentUser.id,
      isRead: true,
      type: messageType,
      attachments: attachments || [],
    };

    const newChats = chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastActivity: new Date().toISOString(),
        };
      }
      return chat;
    });

    saveChats(newChats);

    // Симуляция ответа через 1-3 секунды
    setTimeout(() => {
      const responses = [
        "Интересно! Расскажи подробнее 🤔",
        "Круто! 🎉",
        "Понятно, спасибо за информацию",
        "А что ты думаешь об этом? 💭",
        "Хорошая идея! 💡",
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const replyMessage: Message = {
        id: `msg-${Date.now()}-reply`,
        content: randomResponse,
        timestamp: new Date().toLocaleTimeString("ru-RU", { 
          hour: "2-digit", 
          minute: "2-digit" 
        }),
        sender: "other",
        senderId: chats.find(c => c.id === chatId)?.user.id || "unknown",
        isRead: false,
        type: "text",
      };

      setChats(prevChats => 
        prevChats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, replyMessage],
              lastActivity: new Date().toISOString(),
            };
          }
          return chat;
        })
      );
    }, Math.random() * 2000 + 1000);

    return newMessage;
  }, [chats, saveChats]);

  // Отметка сообщений как прочитанные
  const markMessagesAsRead = useCallback((chatId: string) => {
    setChats(prevChats => {
      const newChats = prevChats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: chat.messages.map(message => ({
              ...message,
              isRead: true,
            })),
          };
        }
        return chat;
      });

      // Сохраняем в localStorage (только в браузере)
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("quark-chats", JSON.stringify(newChats));
        } catch (error) {
          console.error("Ошибка сохранения чатов:", error);
        }
      }

      return newChats;
    });
  }, []);

  // Получение чата по ID
  const getChatById = useCallback((chatId: string) => {
    return chats.find(chat => chat.id === chatId);
  }, [chats]);

  // Редактирование сообщения
  const editMessage = useCallback((chatId: string, messageId: string, newContent: string) => {
    const newChats = chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: chat.messages.map(msg => {
            if (msg.id === messageId && msg.senderId === currentUser.id) {
              return { ...msg, content: newContent };
            }
            return msg;
          }),
        };
      }
      return chat;
    });

    saveChats(newChats);
  }, [chats, saveChats]);

  // Удаление сообщения
  const deleteMessage = useCallback((chatId: string, messageId: string) => {
    const newChats = chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: chat.messages.filter(msg => msg.id !== messageId),
        };
      }
      return chat;
    });

    saveChats(newChats);
  }, [chats, saveChats]);

  // Удаление чата
  const deleteChat = useCallback((chatId: string) => {
    const newChats = chats.filter(chat => chat.id !== chatId);
    saveChats(newChats);
  }, [chats, saveChats]);

  // Получение количества непрочитанных сообщений
  const getUnreadCount = useCallback((chatId: string): number => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return 0;
    
    return chat.messages.filter(message => 
      !message.isRead && message.senderId !== currentUser.id
    ).length;
  }, [chats]);

  return {
    chats,
    currentUser,
    loading,
    sendMessage,
    markMessagesAsRead,
    getChatById,
    editMessage,
    deleteMessage,
    deleteChat,
    getUnreadCount,
  };
}