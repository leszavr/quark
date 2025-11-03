"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Node, mergeAttributes } from "@tiptap/core";
import { Button } from "@/shared/ui/button/Button";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Link as LinkIcon,
  Undo,
  Redo,
  Video as VideoIcon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { AIAssistant } from "./ai/AIAssistant";

// Функция для получения embed URL из различных видео платформ
function getEmbedUrl(url: string): string | null {
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/;
  const youtubeMatch = youtubeRegex.exec(url);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // RuTube
  const rutubeRegex = /rutube\.ru\/video\/([a-zA-Z0-9_-]+)/;
  const rutubeMatch = rutubeRegex.exec(url);
  if (rutubeMatch) {
    return `https://rutube.ru/play/embed/${rutubeMatch[1]}`;
  }

  // VK Video - поддержка vkvideo.ru и vk.com
  const vkVideoRegex = /(?:vkvideo\.ru\/video|vk\.com\/video)(-?\d+_\d+)/;
  const vkVideoMatch = vkVideoRegex.exec(url);
  if (vkVideoMatch) {
    const videoId = vkVideoMatch[1];
    const parts = videoId.split("_");
    return `https://vk.com/video_ext.php?oid=${parts[0]}&id=${parts[1]}&hd=2`;
  }

  // Платформа - поддержка plvideo.ru
  const platformaRegex = /plvideo\.ru\/watch\?v=([a-zA-Z0-9_-]+)/;
  const platformaMatch = platformaRegex.exec(url);
  if (platformaMatch) {
    return `https://plvideo.ru/embed/${platformaMatch[1]}`;
  }

  // Smotrim.ru (Первый канал)
  const smotrimRegex = /smotrim\.ru\/.*?(\d+)/;
  const smotrimMatch = smotrimRegex.exec(url);
  if (smotrimMatch) {
    return url; // Smotrim использует прямые ссылки
  }

  // Dzen (бывший Яндекс.Дзен)
  const dzenRegex = /dzen\.ru\/video\/watch\/([a-zA-Z0-9_-]+)/;
  const dzenMatch = dzenRegex.exec(url);
  if (dzenMatch) {
    return `https://dzen.ru/embed/${dzenMatch[1]}`;
  }

  // Если ссылка уже является embed или iframe ссылкой
  if (url.includes("embed") || url.includes("iframe")) {
    return url;
  }

  return null;
}

// Кастомное Video расширение для Tiptap
const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: "100%",
      },
      height: {
        default: "315",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "iframe[src]",
        getAttrs: (element) => ({
          src: element.getAttribute("src"),
          width: element.getAttribute("width") || "100%",
          height: element.getAttribute("height") || "315",
        }),
      },
      {
        tag: "video[src]",
        getAttrs: (element) => ({
          src: element.getAttribute("src"),
          width: element.getAttribute("width") || "100%",
          height: element.getAttribute("height") || "315",
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src } = HTMLAttributes;
    
    // Если это локальный видео файл
    if (src && (src.includes(".mp4") || src.includes(".avi") || src.includes(".webm") || src.includes(".mov"))) {
      return ["video", mergeAttributes({
        controls: "true",
        style: "width: 100%; max-width: 560px; height: 315px; border-radius: 8px;",
      }, HTMLAttributes)];
    }
    
    // Для embed видео (YouTube, RuTube и т.д.)
    return ["iframe", mergeAttributes({
      frameborder: "0",
      allowfullscreen: "true",
      style: "width: 100%; max-width: 560px; height: 315px; border-radius: 8px;",
    }, HTMLAttributes)];
  },
});

interface TiptapEditorProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly height?: string;
}

export function TiptapEditor({ value, onChange, placeholder = "Начните писать...", height = "400px" }: TiptapEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isVideoUrlMode, setIsVideoUrlMode] = useState(true);
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [showImagePopover, setShowImagePopover] = useState(false);
  const [showVideoPopover, setShowVideoPopover] = useState(false);
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      TiptapImage.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Video,
      TextStyle,
      Color,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[${height}] p-4`,
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor || !linkUrl) return;
    
    const { from, to } = editor.state.selection;
    if (from === to) {
      // Если нет выделенного текста, создаем ссылку с URL как текстом
      editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkUrl}</a>`).run();
    } else {
      // Если есть выделенный текст, делаем его ссылкой
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    setLinkUrl("");
    setShowLinkPopover(false);
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return;
    
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
    setShowImagePopover(false);
  }, [editor, imageUrl]);

  const addVideo = useCallback(() => {
    if (!editor || !videoUrl) return;
    
    const embedUrl = getEmbedUrl(videoUrl);
    if (embedUrl) {
      editor.chain().focus().insertContent({
        type: "video",
        attrs: {
          src: embedUrl,
        },
      }).run();
    }
    setVideoUrl("");
    setShowVideoPopover(false);
  }, [editor, videoUrl]);

  const handleVideoFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    // Проверяем тип файла
    const allowedTypes = ["video/mp4", "video/avi", "video/webm", "video/mov", "video/quicktime"];
    if (!allowedTypes.includes(file.type)) {
      alert("Поддерживаются только видео файлы: MP4, AVI, WebM, MOV");
      return;
    }

    // Создаем URL для файла
    const videoObjectUrl = URL.createObjectURL(file);
    
    // Вставляем видео в редактор
    editor.chain().focus().insertContent({
      type: "video",
      attrs: {
        src: videoObjectUrl,
      },
    }).run();

    // Очищаем input
    event.target.value = "";
    setShowVideoPopover(false);
  }, [editor]);

  if (!editor) {
    return <div style={{ height, backgroundColor: "rgb(243 244 246)", borderRadius: "0.375rem" }} />;
  }

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-600">
        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive("bold") ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : ""}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive("italic") ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : ""}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive("strike") ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : ""}`}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive("code") ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : ""}`}
          title="Code"
        >
          <Code size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive("heading", { level: 1 }) ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : ""}`}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive("heading", { level: 2 }) ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : ""}`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive("heading", { level: 3 }) ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : ""}`}
          title="Heading 3"
        >
          <Heading2 size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive("bulletList") ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : ""}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive("orderedList") ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : ""}`}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive("blockquote") ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : ""}`}
          title="Blockquote"
        >
          <Quote size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Link Popover */}
        <div className="relative">
          <button
            onClick={() => setShowLinkPopover(!showLinkPopover)}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${editor.isActive("link") ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : ""}`}
            title="Add Link"
          >
            <LinkIcon size={16} />
          </button>
          {showLinkPopover && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 w-64">
              <p className="text-sm font-medium mb-2">Добавить ссылку</p>
              <input
                type="text"
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm mb-2"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <Button size="sm" onClick={setLink} className="w-full">
                Добавить ссылку
              </Button>
            </div>
          )}
        </div>

        {/* Image Popover */}
        <div className="relative">
          <button
            onClick={() => setShowImagePopover(!showImagePopover)}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Add Image"
          >
            <ImageIcon size={16} />
          </button>
          {showImagePopover && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 w-64">
              <p className="text-sm font-medium mb-2">Добавить изображение</p>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm mb-2"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Button size="sm" onClick={addImage} className="w-full">
                Добавить изображение
              </Button>
            </div>
          )}
        </div>

        {/* Video Popover */}
        <div className="relative">
          <button
            onClick={() => setShowVideoPopover(!showVideoPopover)}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Add Video"
          >
            <VideoIcon size={16} />
          </button>
          {showVideoPopover && (
            <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-50 w-80">
              <p className="text-sm font-medium mb-2">Добавить видео</p>
              
              {/* Переключатель между URL и файлом */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setIsVideoUrlMode(true)}
                  className={`flex-1 px-3 py-1 text-xs rounded ${isVideoUrlMode ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}
                >
                  По ссылке
                </button>
                <button
                  onClick={() => setIsVideoUrlMode(false)}
                  className={`flex-1 px-3 py-1 text-xs rounded ${isVideoUrlMode ? "bg-gray-200 dark:bg-gray-700" : "bg-blue-500 text-white"}`}
                >
                  Загрузить файл
                </button>
              </div>

              {isVideoUrlMode ? (
                <>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Поддерживаются: YouTube, RuTube, VK Video, Smotrim, Dzen, Платформа
                  </p>
                  <input
                    type="text"
                    placeholder="https://plvideo.ru/watch?v=... или https://vkvideo.ru/video..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm mb-2"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <Button size="sm" onClick={addVideo} className="w-full">
                    Добавить видео
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Поддерживаются: MP4, AVI, WebM, MOV (до 100MB)
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileUpload}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm"
                  />
                </>
              )}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* AI Assistant */}
        <AIAssistant
          mode="post"
          currentContent={editor.getText()}
          onGenerate={(content) => {
            if (content.trim()) {
              if (editor.state.selection.empty) {
                editor.chain().focus().insertContent(content).run();
              } else {
                editor.chain().focus().deleteSelection().insertContent(content).run();
              }
            }
          }}
          placeholder="Опишите какой пост вы хотите создать (тема, стиль, ключевые моменты)..."
        />

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>

      {/* Editor Content */}
      <div
        style={{ height, maxHeight: height }}
        className="p-4 bg-white dark:bg-gray-900 overflow-y-auto"
      >
        <style dangerouslySetInnerHTML={{__html: `
          .ProseMirror {
            outline: none;
            min-height: calc(${height} - 2rem);
            max-height: calc(${height} - 2rem);
            overflow-y: auto;
          }
          .ProseMirror p {
            margin: 0.5em 0;
          }
          .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
            margin-top: 1em;
            margin-bottom: 0.5em;
            font-weight: bold;
          }
          .ProseMirror h1 {
            font-size: 1.5em;
          }
          .ProseMirror h2 {
            font-size: 1.3em;
          }
          .ProseMirror h3 {
            font-size: 1.1em;
          }
          .ProseMirror ul, .ProseMirror ol {
            padding-left: 1.5em;
          }
          .ProseMirror blockquote {
            border-left: 4px solid #ddd;
            padding-left: 1em;
            font-style: italic;
            margin: 1em 0;
          }
          .ProseMirror code {
            background-color: #f3f4f6;
            padding: 0.2em 0.4em;
            border-radius: 0.25em;
            font-size: 0.9em;
          }
          .dark .ProseMirror code {
            background-color: #374151;
          }
          .ProseMirror a {
            color: #3b82f6;
            text-decoration: underline;
          }
          .ProseMirror img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5em;
            margin: 1em 0;
          }
          .ProseMirror iframe {
            width: 100%;
            max-width: 560px;
            height: 315px;
            border-radius: 0.5em;
            margin: 1em 0;
            border: none;
          }
          .ProseMirror video {
            width: 100%;
            max-width: 560px;
            height: auto;
            border-radius: 0.5em;
            margin: 1em 0;
            background-color: #000;
          }
        `}} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}