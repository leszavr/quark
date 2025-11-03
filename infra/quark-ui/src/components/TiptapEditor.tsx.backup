"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Node, mergeAttributes } from "@tiptap/core";
import {
  Box,
  HStack,
  Button,
  IconButton,
  Divider,
  useColorMode,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  VStack,
  Text,
  Select,
} from "@chakra-ui/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { useCallback, useState } from "react";
import { AIAssistant } from "./ai/AIAssistant";

// Функция для получения embed URL из различных видео платформ
function getEmbedUrl(url: string): string | null {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // RuTube
  const rutubeMatch = url.match(/rutube\.ru\/video\/([a-zA-Z0-9_-]+)/);
  if (rutubeMatch) {
    return `https://rutube.ru/play/embed/${rutubeMatch[1]}`;
  }

  // VK Video - поддержка vkvideo.ru и vk.com
  const vkVideoMatch = url.match(/(?:vkvideo\.ru\/video|vk\.com\/video)(-?\d+_\d+)/);
  if (vkVideoMatch) {
    const videoId = vkVideoMatch[1];
    const parts = videoId.split("_");
    return `https://vk.com/video_ext.php?oid=${parts[0]}&id=${parts[1]}&hd=2`;
  }

  // Платформа - поддержка plvideo.ru
  const platformaMatch = url.match(/plvideo\.ru\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (platformaMatch) {
    return `https://plvideo.ru/embed/${platformaMatch[1]}`;
  }

  // Smotrim.ru (Первый канал)
  const smotrimMatch = url.match(/smotrim\.ru\/.*?(\d+)/);
  if (smotrimMatch) {
    return url; // Smotrim использует прямые ссылки
  }

  // Dzen (бывший Яндекс.Дзен)
  const dzenMatch = url.match(/dzen\.ru\/video\/watch\/([a-zA-Z0-9_-]+)/);
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
          src: (element as HTMLElement).getAttribute("src"),
          width: (element as HTMLElement).getAttribute("width") || "100%",
          height: (element as HTMLElement).getAttribute("height") || "315",
        }),
      },
      {
        tag: "video[src]",
        getAttrs: (element) => ({
          src: (element as HTMLElement).getAttribute("src"),
          width: (element as HTMLElement).getAttribute("width") || "100%",
          height: (element as HTMLElement).getAttribute("height") || "315",
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
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export function TiptapEditor({ value, onChange, placeholder = "Начните писать...", height = "400px" }: TiptapEditorProps) {
  const { colorMode } = useColorMode();
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isVideoUrlMode, setIsVideoUrlMode] = useState(true);
  
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
      Image.configure({
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
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return;
    
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
  }, [editor, imageUrl]);

  const addVideo = useCallback(() => {
    if (!editor || !videoUrl) return;
    
    // Используем команду напрямую через editor
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
  }, [editor]);

  if (!editor) {
    return <Box h={height} bg="gray.50" _dark={{ bg: "gray.800" }} borderRadius="md" />;
  }

  return (
    <Box
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      bg="white"
      _dark={{ borderColor: "gray.600", bg: "gray.900" }}
    >
      {/* Toolbar */}
      <HStack
        p={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        _dark={{ borderColor: "gray.600" }}
        wrap="wrap"
        spacing={1}
      >
        {/* Text Formatting */}
        <IconButton
          size="sm"
          icon={<Bold size={16} />}
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          variant={editor.isActive("bold") ? "solid" : "ghost"}
          colorScheme={editor.isActive("bold") ? "blue" : "gray"}
          aria-label="Bold"
        />
        <IconButton
          size="sm"
          icon={<Italic size={16} />}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          variant={editor.isActive("italic") ? "solid" : "ghost"}
          colorScheme={editor.isActive("italic") ? "blue" : "gray"}
          aria-label="Italic"
        />
        <IconButton
          size="sm"
          icon={<Strikethrough size={16} />}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          variant={editor.isActive("strike") ? "solid" : "ghost"}
          colorScheme={editor.isActive("strike") ? "blue" : "gray"}
          aria-label="Strikethrough"
        />
        <IconButton
          size="sm"
          icon={<Code size={16} />}
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          variant={editor.isActive("code") ? "solid" : "ghost"}
          colorScheme={editor.isActive("code") ? "blue" : "gray"}
          aria-label="Code"
        />

        <Divider orientation="vertical" h={6} />

        {/* Headings */}
        <IconButton
          size="sm"
          icon={<Heading1 size={16} />}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          variant={editor.isActive("heading", { level: 1 }) ? "solid" : "ghost"}
          colorScheme={editor.isActive("heading", { level: 1 }) ? "blue" : "gray"}
          aria-label="Heading 1"
        />
        <IconButton
          size="sm"
          icon={<Heading2 size={16} />}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          variant={editor.isActive("heading", { level: 2 }) ? "solid" : "ghost"}
          colorScheme={editor.isActive("heading", { level: 2 }) ? "blue" : "gray"}
          aria-label="Heading 2"
        />
        <IconButton
          size="sm"
          icon={<Heading3 size={16} />}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          variant={editor.isActive("heading", { level: 3 }) ? "solid" : "ghost"}
          colorScheme={editor.isActive("heading", { level: 3 }) ? "blue" : "gray"}
          aria-label="Heading 3"
        />

        <Divider orientation="vertical" h={6} />

        {/* Lists */}
        <IconButton
          size="sm"
          icon={<List size={16} />}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          variant={editor.isActive("bulletList") ? "solid" : "ghost"}
          colorScheme={editor.isActive("bulletList") ? "blue" : "gray"}
          aria-label="Bullet List"
        />
        <IconButton
          size="sm"
          icon={<ListOrdered size={16} />}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          variant={editor.isActive("orderedList") ? "solid" : "ghost"}
          colorScheme={editor.isActive("orderedList") ? "blue" : "gray"}
          aria-label="Ordered List"
        />
        <IconButton
          size="sm"
          icon={<Quote size={16} />}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          variant={editor.isActive("blockquote") ? "solid" : "ghost"}
          colorScheme={editor.isActive("blockquote") ? "blue" : "gray"}
          aria-label="Blockquote"
        />

        <Divider orientation="vertical" h={6} />

        {/* Link */}
        <Popover>
          <PopoverTrigger>
            <IconButton
              size="sm"
              icon={<LinkIcon size={16} />}
              isActive={editor.isActive("link")}
              variant={editor.isActive("link") ? "solid" : "ghost"}
              colorScheme={editor.isActive("link") ? "blue" : "gray"}
              aria-label="Add Link"
            />
          </PopoverTrigger>
          <PopoverContent>
            <PopoverBody>
              <VStack spacing={3}>
                <Text fontSize="sm" fontWeight="medium">Добавить ссылку</Text>
                <Input
                  placeholder="https://example.com"
                  size="sm"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
                <Button size="sm" colorScheme="blue" onClick={setLink} w="full">
                  Добавить ссылку
                </Button>
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>

        {/* Image */}
        <Popover>
          <PopoverTrigger>
            <IconButton
              size="sm"
              icon={<ImageIcon size={16} />}
              aria-label="Add Image"
              variant="ghost"
            />
          </PopoverTrigger>
          <PopoverContent>
            <PopoverBody>
              <VStack spacing={3}>
                <Text fontSize="sm" fontWeight="medium">Добавить изображение</Text>
                <Input
                  placeholder="https://example.com/image.jpg"
                  size="sm"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Button size="sm" colorScheme="blue" onClick={addImage} w="full">
                  Добавить изображение
                </Button>
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>

        {/* Video */}
        <Popover>
          <PopoverTrigger>
            <IconButton
              size="sm"
              icon={<VideoIcon size={16} />}
              aria-label="Add Video"
              variant="ghost"
            />
          </PopoverTrigger>
          <PopoverContent>
            <PopoverBody>
              <VStack spacing={3}>
                <Text fontSize="sm" fontWeight="medium">Добавить видео</Text>
                
                {/* Переключатель между URL и файлом */}
                <HStack spacing={2} w="full">
                  <Button
                    size="xs"
                    variant={isVideoUrlMode ? "solid" : "outline"}
                    colorScheme={isVideoUrlMode ? "blue" : "gray"}
                    onClick={() => setIsVideoUrlMode(true)}
                    flex={1}
                  >
                    По ссылке
                  </Button>
                  <Button
                    size="xs"
                    variant={!isVideoUrlMode ? "solid" : "outline"}
                    colorScheme={!isVideoUrlMode ? "blue" : "gray"}
                    onClick={() => setIsVideoUrlMode(false)}
                    flex={1}
                  >
                    Загрузить файл
                  </Button>
                </HStack>

                {isVideoUrlMode ? (
                  <>
                    <Text fontSize="xs" color="gray.500">
                      Поддерживаются: YouTube, RuTube, VK Video, Smotrim, Dzen, Платформа
                    </Text>
                    <Input
                      placeholder="https://plvideo.ru/watch?v=... или https://vkvideo.ru/video..."
                      size="sm"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    <Button size="sm" colorScheme="blue" onClick={addVideo} w="full">
                      Добавить видео
                    </Button>
                  </>
                ) : (
                  <>
                    <Text fontSize="xs" color="gray.500">
                      Поддерживаются: MP4, AVI, WebM, MOV (до 100MB)
                    </Text>
                    <Box w="full">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoFileUpload}
                        style={{
                          width: "100%",
                          padding: "8px",
                          border: "1px solid #ccc",
                          borderRadius: "6px",
                          fontSize: "14px",
                        }}
                      />
                    </Box>
                  </>
                )}
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>

        <Divider orientation="vertical" h={6} />

        {/* AI Assistant */}
        <AIAssistant
          mode="post"
          currentContent={editor.getText()}
          onGenerate={(content) => {
            if (content.trim()) {
              // Если есть выделение, заменяем его, иначе добавляем в конец
              if (editor.state.selection.empty) {
                editor.chain().focus().insertContent(content).run();
              } else {
                editor.chain().focus().deleteSelection().insertContent(content).run();
              }
            }
          }}
          placeholder="Опишите какой пост вы хотите создать (тема, стиль, ключевые моменты)..."
        />

        <Divider orientation="vertical" h={6} />

        {/* Undo/Redo */}
        <IconButton
          size="sm"
          icon={<Undo size={16} />}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          aria-label="Undo"
          variant="ghost"
        />
        <IconButton
          size="sm"
          icon={<Redo size={16} />}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          aria-label="Redo"
          variant="ghost"
        />
      </HStack>

      {/* Editor Content */}
      <Box
        h={height}
        maxH={height}
        p={4}
        bg="white"
        _dark={{ bg: "gray.900" }}
        overflowY="auto"
        sx={{
          ".ProseMirror": {
            outline: "none",
            minHeight: `calc(${height} - 2rem)`,
            maxHeight: `calc(${height} - 2rem)`,
            overflowY: "auto",
            "& p": {
              margin: "0.5em 0",
            },
            "& h1, & h2, & h3": {
              marginTop: "1em",
              marginBottom: "0.5em",
              fontWeight: "bold",
            },
            "& h1": {
              fontSize: "1.5em",
            },
            "& h2": {
              fontSize: "1.3em",
            },
            "& h3": {
              fontSize: "1.1em",
            },
            "& ul, & ol": {
              paddingLeft: "1.5em",
            },
            "& blockquote": {
              borderLeft: "4px solid #ddd",
              paddingLeft: "1em",
              fontStyle: "italic",
              margin: "1em 0",
            },
            "& code": {
              backgroundColor: colorMode === "dark" ? "#374151" : "#f3f4f6",
              padding: "0.2em 0.4em",
              borderRadius: "0.25em",
              fontSize: "0.9em",
            },
            "& a": {
              color: "#3b82f6",
              textDecoration: "underline",
            },
            "& img": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: "0.5em",
              margin: "1em 0",
            },
            "& iframe": {
              width: "100%",
              maxWidth: "560px",
              height: "315px",
              borderRadius: "0.5em",
              margin: "1em 0",
              border: "none",
            },
            "& video": {
              width: "100%",
              maxWidth: "560px",
              height: "auto",
              borderRadius: "0.5em",
              margin: "1em 0",
              backgroundColor: "#000",
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}