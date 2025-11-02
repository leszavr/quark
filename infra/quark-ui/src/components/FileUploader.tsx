"use client";

import React, { useState, useRef } from "react";
import { Paperclip, X, File, Image as ImageIcon, Video, Music } from "lucide-react";

export interface FileAttachment {
  id: string;
  file: File;
  preview?: string;
  type: "image" | "video" | "audio" | "document";
  uploadProgress?: number;
}

interface FileUploaderProps {
  onFilesChange: (files: FileAttachment[]) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
  acceptedTypes?: string[];
}

const getFileType = (file: File): FileAttachment["type"] => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "document";
};

const getFileIcon = (type: FileAttachment["type"]) => {
  switch (type) {
    case "image": return ImageIcon;
    case "video": return Video;
    case "audio": return Music;
    default: return File;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Б";
  const k = 1024;
  const sizes = ["Б", "КБ", "МБ", "ГБ"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function FileUploader({ 
  onFilesChange, 
  maxFiles = 5, 
  maxSizeInMB = 10,
  acceptedTypes = ["image/*", "video/*", "audio/*", "application/pdf", "text/*"]
}: FileUploaderProps) {
  // Tailwind dark mode
  const isDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    
    setError("");
    const newAttachments: FileAttachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Проверка размера файла
      if (file.size > maxSizeInMB * 1024 * 1024) {
        setError(`Файл "${file.name}" превышает максимальный размер ${maxSizeInMB}МБ`);
        continue;
      }
      
      // Проверка количества файлов
      if (attachments.length + newAttachments.length >= maxFiles) {
        setError(`Максимальное количество файлов: ${maxFiles}`);
        break;
      }
      
      const fileType = getFileType(file);
      const attachment: FileAttachment = {
        id: `file-${Date.now()}-${i}`,
        file,
        type: fileType,
        uploadProgress: 0,
      };
      
      // Создаем preview для изображений
      if (fileType === "image") {
        const reader = new FileReader();
        reader.onload = (e) => {
          attachment.preview = e.target?.result as string;
          setAttachments(prev => 
            prev.map(a => a.id === attachment.id ? attachment : a)
          );
        };
        reader.readAsDataURL(file);
      }
      
      newAttachments.push(attachment);
    }
    
    const updatedAttachments = [...attachments, ...newAttachments];
    setAttachments(updatedAttachments);
    onFilesChange(updatedAttachments);
    
    // Симулируем загрузку файлов
    simulateUpload(newAttachments);
  };

  const simulateUpload = (files: FileAttachment[]) => {
    files.forEach((attachment) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        
        setAttachments(prev =>
          prev.map(a => 
            a.id === attachment.id 
              ? { ...a, uploadProgress: progress }
              : a
          )
        );
      }, 200);
    });
  };

  const removeAttachment = (id: string) => {
    const updatedAttachments = attachments.filter(a => a.id !== id);
    setAttachments(updatedAttachments);
    onFilesChange(updatedAttachments);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="w-full">
      {/* Кнопка прикрепления файлов */}
      <button
        type="button"
        aria-label="Прикрепить файл"
        className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:text-primary-500 focus:outline-none"
        onClick={() => fileInputRef.current?.click()}
      >
        <Paperclip size={18} />
      </button>

      {/* Скрытый input для выбора файлов */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(",")}
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Ошибки */}
      {error && (
        <div className="flex items-center mt-2 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md px-3 py-2 text-sm text-red-700 dark:text-red-200">
          <span className="mr-2">⚠️</span>
          <span>{error}</span>
          <button
            type="button"
            className="ml-auto text-red-500 hover:text-red-700"
            onClick={() => setError("")}
          >✕</button>
        </div>
      )}

      {/* Превью прикрепленных файлов */}
      {attachments.length > 0 && (
        <div
          className={`mt-2 p-3 rounded-md border ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
        >
          <div className="text-sm font-medium mb-2 text-gray-500">
            Прикрепленные файлы ({attachments.length}):
          </div>
          <div className="flex flex-col gap-2">
            {attachments.map((attachment) => {
              const Icon = getFileIcon(attachment.type);
              const isUploading = (attachment.uploadProgress || 0) < 100;
              return (
                <div key={attachment.id}>
                  <div className={`flex items-center gap-3 p-2 rounded-md border ${isDark ? "bg-gray-600 border-gray-500" : "bg-white border-gray-200"}`}>
                    {/* Иконка или превью */}
                    {attachment.preview ? (
                      <img
                        src={attachment.preview}
                        alt={attachment.file.name}
                        className="w-10 h-10 object-cover rounded-md"
                      />
                    ) : (
                      <div className={`w-10 h-10 flex items-center justify-center rounded-md ${isDark ? "bg-gray-500" : "bg-gray-100"}`}>
                        <Icon size={20} color="gray" />
                      </div>
                    )}

                    {/* Информация о файле */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {attachment.file.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {formatFileSize(attachment.file.size)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${attachment.type === "image" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                          {attachment.type}
                        </span>
                      </div>
                    </div>

                    {/* Кнопка удаления */}
                    <button
                      type="button"
                      aria-label="Удалить файл"
                      className="p-2 text-red-500 hover:text-red-700 rounded-md"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  {/* Прогресс загрузки */}
                  {isUploading && (
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-md mt-1">
                      <div
                        className="h-2 rounded-md bg-primary-500 transition-all"
                        style={{ width: `${attachment.uploadProgress || 0}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Зона drag & drop */}
      <div
        className={`mt-2 p-4 border-2 rounded-md text-center cursor-pointer transition-all ${dragOver ? "border-primary-500 bg-primary-50 dark:bg-primary-900" : isDark ? "border-gray-600" : "border-gray-300"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-2">
          <Paperclip 
            size={24} 
            color={dragOver ? "#3b82f6" : "gray"} 
          />
          <span className="text-sm text-gray-500">
            Перетащите файлы сюда или нажмите для выбора
          </span>
          <span className="text-xs text-gray-400">
            Максимум {maxFiles} файлов по {maxSizeInMB}МБ
          </span>
        </div>
      </div>
    </div>
  );
}