"use client";

import { Button } from "../../shared/ui/button/Button";

import { useState } from "react";
import { Eye, Code, Edit3 } from "lucide-react";
import dynamic from "next/dynamic";
import { MarkdownRenderer } from "./MarkdownRenderer";
import type { ICommand } from "@uiw/react-md-editor";

// Динамический импорт MD Editor для избежания SSR проблем
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface VisualEditorProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly height?: string;
}

export function VisualEditor({ value, onChange, placeholder, height = "400px" }: VisualEditorProps) {
  // Цветовая схема теперь через Tailwind dark: классы
  const colorMode = globalThis.window !== undefined && globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const [mode, setMode] = useState<"visual" | "code" | "preview">("visual");

  // Стили для темной темы
  const editorProps = {
    "data-color-mode": colorMode,
    style: {
      backgroundColor: colorMode === "dark" ? "#1A202C" : "#FFFFFF",
      border: `1px solid ${colorMode === "dark" ? "#4A5568" : "#E2E8F0"}`,
      borderRadius: "12px",
    }
  };

  const toolbarButtons = [
    "bold", "italic", "strikethrough", "|",
    "title", "quote", "unordered-list", "ordered-list", "|",
    "link", "code", "codeBlock", "|",
    "table", "divider", "|",
    "preview"
  ];

  return (
  <div>
      {/* Переключатель режимов */}
  <div className="flex flex-row gap-1 mb-3">
        <Button
          size="sm"
          variant={mode === "visual" ? "default" : "ghost"}
          className={mode === "visual" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}
          onClick={() => setMode("visual")}
        >
          <Edit3 size={14} className="mr-2" />Визуальный
        </Button>
        <Button
          size="sm"
          variant={mode === "code" ? "default" : "ghost"}
          className={mode === "code" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}
          onClick={() => setMode("code")}
        >
          <Code size={14} className="mr-2" />Код
        </Button>
        <Button
          size="sm"
          variant={mode === "preview" ? "default" : "ghost"}
          className={mode === "preview" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}
          onClick={() => setMode("preview")}
        >
          <Eye size={14} className="mr-2" />Превью
        </Button>
  </div>

      {/* Редактор */}
      <div
        className={`rounded-xl overflow-hidden border ${colorMode === "dark" ? "border-gray-600" : "border-gray-300"}`}
      >
        {mode === "visual" && (
          <div {...editorProps}>
            <MDEditor
              value={value}
              onChange={(val: string | undefined) => onChange(val || "")}
              preview="edit"
              hideToolbar={false}
              visibleDragbar={false}
              textareaProps={{
                placeholder: placeholder || "Начните писать ваш пост...",
                style: {
                  fontSize: 14,
                  lineHeight: 1.6,
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  minHeight: height,
                }
              }}
              height={Number.parseInt(height.replace("px", ""))}
              toolbarBottom={false}
              commands={toolbarButtons as unknown as ICommand[]}
            />
          </div>
        )}

        {mode === "code" && (
          <textarea
            className={`w-full h-[${height}] p-4 resize-vertical border-none outline-none ${colorMode === "dark" ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"} font-mono text-sm leading-6`}
            placeholder={placeholder || "Напишите Markdown код..."}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
            style={{ fontFamily: "'JetBrains Mono', Monaco, Menlo, 'Ubuntu Mono', monospace", minHeight: height }}
          />
        )}

        {mode === "preview" && (
          <div
            className={`p-6 min-h-[${height}] ${colorMode === "dark" ? "bg-gray-800" : "bg-white"} overflow-y-auto`}
          >
            {value ? (
              <MarkdownRenderer>{value}</MarkdownRenderer>
            ) : (
              <p className="text-gray-500 italic">
                Превью появится здесь...
              </p>
            )}
          </div>
        )}
  </div>

      {/* Подсказки */}
  <div className="mt-2">
        {mode === "visual" && (
          <span className="text-xs text-gray-500">
            💡 Используйте панель инструментов для форматирования или переключитесь в режим &quot;Код&quot; для прямого редактирования Markdown
          </span>
        )}
        {mode === "code" && (
          <span className="text-xs text-gray-500">
            💡 Поддерживается полный синтаксис Markdown: **жирный**, *курсив*, `код`, [ссылки](url), заголовки #, списки, и многое другое
          </span>
        )}
        {mode === "preview" && (
          <span className="text-xs text-gray-500">
            👀 Так будет выглядеть ваш пост после публикации
          </span>
        )}
  </div>
  </div>
  );
}