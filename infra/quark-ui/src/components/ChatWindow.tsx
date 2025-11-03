"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Phone, Video, MoreVertical, Paperclip, Send, Mic, Check, CheckCheck } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { EmojiPicker } from "./EmojiPicker";
import Image from "next/image";
import { FileUploader } from "./FileUploader";
import { MessageAttachments } from "./MessageAttachments";
import { useState, useRef, useEffect, useMemo } from "react";
import { useChatStorage } from "../hooks/useChatStorage";
import type { FileAttachment } from "./FileUploader";
import type { Message, MessageAttachment } from "../hooks/useChatStorage";

const MotionBox = motion.create("div");

// Компонент для рендеринга сообщений с поддержкой Markdown (пасхалка!)
interface MessageContentProps {
  readonly content: string;
}

function MessageContent({ content }: MessageContentProps) {
  // Проверяем, содержит ли сообщение Markdown синтаксис
  const hasMarkdown = /(\*\*|\*|`|#|\[|\]|```|^\s*[-+*]|^\s*\d+\.)/m.test(content);
  
  if (hasMarkdown) {
    // Если есть Markdown - рендерим через MarkdownRenderer
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <MarkdownRenderer>{content}</MarkdownRenderer>
      </div>
    );
  }
  
  // Обычное текстовое сообщение
  return <span className="text-sm">{content}</span>;
}

// Типы импортированы из useChatStorage

// Моковые данные теперь в useChatStorage

interface ChatWindowProps {
  readonly chatId?: string;
  readonly onClose?: () => void;
  readonly showBackButton?: boolean; // показывать ли кнопку назад (для мобильного режима)
  readonly onBack?: () => void; // функция возврата к списку чатов
}

export function ChatWindow({ chatId = "chat-1", onClose: _onClose, showBackButton = false, onBack }: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<MessageAttachment[]>([]);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const { 
    sendMessage, 
    markMessagesAsRead, 
    getChatById 
  } = useChatStorage();
  
  // Получаем текущий чат
  const currentChat = getChatById(chatId);
  const messages = useMemo(() => currentChat?.messages || [], [currentChat]);
  const user = currentChat?.user;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Отмечаем сообщения как прочитанные при открытии чата
  useEffect(() => {
    if (currentChat) {
      markMessagesAsRead(chatId);
    }
  }, [chatId, currentChat, markMessagesAsRead]);

  const handleSend = () => {
    if (message.trim() || attachedFiles.length > 0) {
      sendMessage(chatId, message, attachedFiles);
      setMessage("");
      setAttachedFiles([]);
      setShowFileUploader(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const newMessage = message + emoji;
    setMessage(newMessage);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFilesChange = (files: FileAttachment[]) => {
    const messageAttachments: MessageAttachment[] = files.map(file => ({
      id: file.id,
      name: file.file.name,
      size: file.file.size,
      type: file.type,
      mimeType: file.file.type,
      preview: file.preview,
      url: file.preview || URL.createObjectURL(file.file),
    }));
    setAttachedFiles(messageAttachments);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Автоматическое изменение высоты textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Статус сообщений теперь определяется через isRead в Message

  return (
    <div className="h-full flex flex-col">
      {/* Шапка чата */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex justify-between">
          <div className="flex gap-3">
            {/* Кнопка назад (только в мобильном режиме) */}
            {showBackButton && (
              <button
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={onBack}
                aria-label="Назад к списку чатов"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="relative w-8 h-8">
              <Image
                fill
                className="rounded-full object-cover"
                src={user?.avatar || "/avatar-placeholder.png"}
                alt={user?.name || "Пользователь"}
                sizes="32px"
              />
              {user?.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
              )}
            </div>
            <div>
              <span className="font-semibold text-sm">
                {user?.name || "Пользователь"}
              </span>
              <span className="text-xs text-gray-500 block">
                {user?.isOnline ? "онлайн" : user?.lastSeen || "не в сети"}
              </span>
            </div>
          </div>

          <div className="flex gap-1">
            <button
              className="p-2 rounded hover:text-cyan-500 text-gray-500"
              aria-label="Voice call"
            >
              <Phone size={16} />
            </button>
            <button
              className="p-2 rounded hover:text-cyan-500 text-gray-500"
              aria-label="Video call"
            >
              <Video size={16} />
            </button>
            <button
              className="p-2 rounded hover:text-cyan-500 text-gray-500"
              aria-label="More options"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-3">
          {messages.map((msg: Message, index: number) => (
            <MotionBox
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`self-${msg.sender === "user" ? "end" : "start"} max-w-[70%]`}
            >
              <div
                className={`p-3 rounded-2xl ${
                  msg.sender === "user" 
                    ? "bg-cyan-500 dark:bg-cyan-600 text-white rounded-br-md"
                    : "bg-gray-100 dark:bg-gray-700 text-inherit rounded-bl-md"
                }`}
              >
                <div className="text-sm mb-1">
                  <MessageContent content={msg.content} />
                </div>
                
                {/* Отображение вложений */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <MessageAttachments 
                    attachments={msg.attachments} 
                    isOwn={msg.sender === "user"}
                  />
                )}
                
                <div className="flex justify-end gap-1 mt-1">
                  <span className="text-xs opacity-70">
                    {msg.timestamp}
                  </span>
                  {msg.sender === "user" && (
                    <div className={`w-3 h-3 opacity-70 ${msg.isRead ? "text-cyan-300" : "text-gray-300"}`}>
                      {msg.isRead ? <CheckCheck size={12} /> : <Check size={12} />}
                    </div>
                  )}
                </div>
              </div>
            </MotionBox>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Поле ввода */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* Область загрузки файлов */}
        {showFileUploader && (
          <div className="mb-4">
            <FileUploader onFilesChange={handleFilesChange} />
          </div>
        )}

        <div className="flex gap-2 items-end">
          <button
            className={`p-2 rounded hover:text-cyan-500 ${showFileUploader ? "text-cyan-500" : "text-gray-500"}`}
            onClick={() => setShowFileUploader(!showFileUploader)}
            aria-label="Прикрепить файл"
          >
            <Paperclip size={18} />
          </button>

          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Введите сообщение..."
              rows={1}
              className="w-full min-h-10 max-h-30 resize-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl px-3 py-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder-gray-500"
            />
          </div>

          <EmojiPicker onEmojiSelect={handleEmojiSelect} />

          <button
            className="p-2 rounded hover:text-red-400 text-gray-500"
            aria-label="Voice message"
          >
            <Mic size={18} />
          </button>

          <button
            className={`p-2 rounded text-sm ${
              (message.trim() || attachedFiles.length > 0) 
                ? "bg-cyan-500 text-white hover:scale-105 transform" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleSend}
            disabled={!message.trim() && attachedFiles.length === 0}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}