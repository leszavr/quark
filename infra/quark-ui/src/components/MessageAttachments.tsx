"use client";
import Image from "next/image";

import { Download, FileText, Image as ImageIcon, Video, Music, Play } from "lucide-react";
import { Badge } from "@/shared/ui/badge/Badge";
import { MessageAttachment } from "../hooks/useChatStorage";

interface MessageAttachmentsProps {
  readonly attachments: MessageAttachment[];
  readonly isOwn: boolean;
}

const getFileIcon = (type: MessageAttachment["type"]) => {
  switch (type) {
    case "image": return ImageIcon;
    case "video": return Video;
    case "audio": return Music;
    default: return FileText;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Б";
  const k = 1024;
  const sizes = ["Б", "КБ", "МБ", "ГБ"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getBadgeColorClass = (type: MessageAttachment["type"]): string => {
  if (type === "image") return "bg-green-100 text-green-700";
  if (type === "video") return "bg-purple-100 text-purple-700";
  if (type === "audio") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-700";
};

export function MessageAttachments({ attachments, isOwn }: MessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleDownload = (attachment: MessageAttachment) => {
    if (attachment.url) {
      const link = document.createElement("a");
      link.href = attachment.url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-2">
      {attachments.map((attachment) => {
        const Icon = getFileIcon(attachment.type);
        const badgeColorClass = getBadgeColorClass(attachment.type);
        
        if (attachment.type === "image" && attachment.preview) {
          return (
            <div key={attachment.id} className="relative rounded-md overflow-hidden max-w-[300px] cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="relative w-full" style={{ minHeight: '200px' }}>
                <Image
                  fill
                  src={attachment.preview}
                  alt={attachment.name}
                  className="object-cover"
                  sizes="300px"
                  style={{ maxHeight: '200px' }}
                />
              </div>
              <div className="absolute top-2 right-2 bg-black/70 rounded-md p-1">
                <button
                  className="p-1 hover:bg-white/10 rounded"
                  title="Скачать изображение"
                  onClick={() => handleDownload(attachment)}
                >
                  <Download size={16} className="text-white" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                <p className="text-xs text-white truncate">
                  {attachment.name}
                </p>
              </div>
            </div>
          );
        }
        
        if (attachment.type === "video" && attachment.preview) {
          return (
            <div key={attachment.id} className="relative rounded-md overflow-hidden max-w-[300px] cursor-pointer bg-black">
              <div className="relative w-full" style={{ minHeight: '200px' }}>
                <Image
                  fill
                  src={attachment.preview}
                  alt={attachment.name}
                  className="object-cover"
                  sizes="300px"
                  style={{ maxHeight: '200px' }}
                />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 rounded-full p-3">
                <Play size={24} className="text-white" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                <p className="text-xs text-white truncate">
                  {attachment.name}
                </p>
              </div>
            </div>
          );
        }
        
        // Обычный файл
        return (
          <div 
            key={attachment.id}
            className={`p-3 rounded-md max-w-[300px] ${
              isOwn 
                ? 'bg-white/20 dark:bg-white/10' 
                : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-500 rounded-md">
                <Icon size={20} />
              </div>
              
              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {attachment.name}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-70">
                    {formatFileSize(attachment.size)}
                  </span>
                  <Badge className={badgeColorClass}>
                    {attachment.type}
                  </Badge>
                </div>
              </div>
              
              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-500 rounded"
                title="Скачать файл"
                onClick={() => handleDownload(attachment)}
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}