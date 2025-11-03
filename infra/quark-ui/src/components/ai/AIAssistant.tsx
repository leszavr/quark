"use client";

import { Button } from "@/shared/ui/button/Button";
import { Badge } from "@/shared/ui/badge/Badge";
import { Dialog } from "@/shared/ui/dialog/Dialog";
import { Progress } from "@/shared/ui/progress/Progress";
import { Alert } from "@/shared/ui/alert/Alert";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/shared/ui/dropdown-menu/DropdownMenu";
import { useToast } from "@/hooks/useToast";
import { useState, useEffect } from "react";
import { 
  Cpu, 
  ChevronDown,
  Settings,
  Zap,
  Edit3,
  MessageSquare,
  FileText,
  Loader2
} from "lucide-react";

interface AIAssistantProps {
  readonly mode: "post" | "chat" | "message";
  readonly onGenerate: (content: string) => void;
  readonly currentContent?: string;
  readonly placeholder?: string;
  readonly disabled?: boolean;
}

interface AISettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  postPrompt: string;
  chatPrompt: string;
  streaming: boolean;
}

const defaultSettings: AISettings = {
  model: "gpt-4-turbo",
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: "Ты - полезный AI ассистент, который помогает создавать качественный контент.",
  postPrompt: "Помоги создать интересный и информативный пост на заданную тему.",
  chatPrompt: "Отвечай естественно и дружелюбно, как опытный собеседник.",
  streaming: true,
};

const quickActions = [
  {
    id: "improve",
    label: "Улучшить текст",
    icon: Edit3,
    prompt: "Улучши этот текст, сделай его более читаемым и интересным:"
  },
  {
    id: "shorten",
    label: "Сократить",
    icon: Zap,
    prompt: "Сократи этот текст, оставив только самое важное:"
  },
  {
    id: "expand",
    label: "Расширить",
    icon: FileText,
    prompt: "Расширь этот текст, добавь больше деталей и примеров:"
  },
  {
    id: "tone",
    label: "Изменить тон",
    icon: MessageSquare,
    prompt: "Перепиши этот текст в более дружелюбном и позитивном тоне:"
  },
];

export function AIAssistant({ 
  mode, 
  onGenerate, 
  currentContent = "", 
  placeholder = "Опишите что вы хотите создать...",
  disabled = false 
}: AIAssistantProps) {
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [progress, setProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Загружаем настройки AI из localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("aiSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error("Ошибка загрузки настроек AI:", error);
      }
    }
  }, []);

  // Имитация генерации контента AI
  const generateContent = async (customPrompt?: string) => {
    setIsGenerating(true);
    setProgress(0);
    setGeneratedContent("");
    
    try {
      // Имитируем процесс генерации с прогрессом
      const words = [
        "Анализирую запрос...",
        "Генерирую идеи...",
        "Структурирую контент...",
        "Проверяю качество...",
        "Финализирую текст..."
      ];

      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(((i + 1) / words.length) * 100);
      }

      // Имитируем сгенерированный контент (в реальности здесь был бы API вызов)
      const mockContent = getMockContent(customPrompt, currentContent, mode, prompt);

      setGeneratedContent(mockContent);

      toast({
        title: "Контент сгенерирован",
        description: `AI создал ${mode === "post" ? "пост" : "сообщение"} на основе ваших настроек`,
      });

    } catch (error) {
      console.error("Ошибка генерации AI:", error);
      toast({
        title: "Ошибка генерации",
        description: "Не удалось сгенерировать контент. Попробуйте еще раз.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Вспомогательная функция для получения базового промпта
  function getBasePrompt(mode: string, settings: AISettings): string {
    if (mode === "post") return settings.postPrompt;
    if (mode === "chat") return settings.chatPrompt;
    return settings.systemPrompt;
  }

  // Вспомогательная функция для генерации mock контента
  function getMockContent(customPrompt: string | undefined, content: string, mode: string, userPrompt: string): string {
    if (customPrompt?.includes("Улучши")) {
      return `Улучшенная версия:\n\n${content}\n\nДобавлены улучшения: более четкая структура, живые примеры и эмоциональная окраска текста.`;
    }
    if (customPrompt?.includes("Сократи")) {
      return `Краткая версия: ${content.slice(0, Math.floor(content.length / 2))}...`;
    }
    if (customPrompt?.includes("Расширь")) {
      return `${content}\n\nДополнительные детали:\n• Интересные факты по теме\n• Практические примеры\n• Рекомендации для читателей`;
    }
    if (customPrompt?.includes("тон")) {
      return `✨ ${content.replaceAll(".", "! 😊").replaceAll(",", ", и это здорово,")} ✨`;
    }
    
    if (mode === "post") {
      return `🚀 Интересный пост по теме "${userPrompt}"\n\nВведение с крючком для привлечения внимания...\n\nОсновная часть с ценной информацией:\n• Ключевой момент 1\n• Ключевой момент 2\n• Ключевой момент 3\n\nЗаключение с призывом к действию. 💡`;
    }
    if (mode === "chat") {
      return `Привет! 👋 Отвечаю на твой вопрос: "${userPrompt}"\n\nВот подробный и полезный ответ с практическими советами и рекомендациями...`;
    }
    return `Ответ по теме "${userPrompt}":\n\nСтруктурированная информация с примерами и объяснениями...`;
  }

  // Быстрое действие
  const handleQuickAction = (action: typeof quickActions[0]) => {
    if (!currentContent.trim()) {
      toast({
        title: "Нет контента",
        description: "Сначала введите текст для обработки",
      });
      return;
    }
    generateContent(action.prompt);
  };

  // Использование сгенерированного контента
  const useGeneratedContent = () => {
    onGenerate(generatedContent);
    setGeneratedContent("");
    setPrompt("");
    setIsOpen(false);
  };

  // Открытие настроек AI
  const openAISettings = () => {
    window.open("/profile?tab=ai-agent", "_blank");
  };

  const hasAISettings = localStorage.getItem("aiSettings") !== null;

  return (
    <>
      <div className="flex items-center gap-0 border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden">
        <Button
          onClick={() => setIsOpen(true)}
          disabled={disabled}
          className="rounded-none border-0 flex items-center gap-2"
        >
          <Cpu size={16} />
          AI Ассистент
          {!hasAISettings && <Badge className="ml-2 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Настроить</Badge>}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              disabled={disabled}
              className="rounded-none border-0 border-l border-gray-300 dark:border-gray-700 px-2"
            >
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {currentContent && (
              <>
                <div className="px-2 py-1.5 text-sm text-gray-500 font-semibold">
                  Быстрые действия
                </div>
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <DropdownMenuItem
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                    >
                      <Icon size={16} className="mr-2" />
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={openAISettings}>
              <Settings size={16} className="mr-2" />
              Настройки AI
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Модальное окно AI ассистента */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Cpu size={20} />
                <h2 className="text-lg font-semibold">AI Ассистент</h2>
                <Badge variant="secondary">{settings.model}</Badge>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              {!hasAISettings && (
                <Alert variant="default" className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                  <div>
                    <p className="text-sm">
                      AI агент не настроен.{" "}
                      <button
                        type="button"
                        className="cursor-pointer text-blue-500 hover:underline ml-1"
                        onClick={openAISettings}
                      >
                        Перейти к настройкам →
                      </button>
                    </p>
                  </div>
                </Alert>
              )}

              <div>
                <label htmlFor="ai-prompt-input" className="text-sm font-medium mb-2 block">
                  Что вы хотите создать?
                </label>
                <textarea
                  id="ai-prompt-input"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={placeholder}
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 resize-y"
                />
              </div>

              {isGenerating && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-blue-500" />
                      <p className="text-sm">Генерирую контент...</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {Math.round(progress)}%
                    </p>
                  </div>
                  <Progress value={progress} className="bg-blue-500" />
                </div>
              )}

              {generatedContent && (
                <div>
                  <label htmlFor="ai-result-textarea" className="text-sm font-medium mb-2 block">
                    Результат:
                  </label>
                  <textarea
                    id="ai-result-textarea"
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    className="w-full min-h-[150px] px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-blue-50 dark:bg-blue-900 resize-y"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Отмена
              </Button>
              
              {generatedContent ? (
                <Button onClick={useGeneratedContent}>
                  Использовать
                </Button>
              ) : (
                <Button 
                  onClick={() => generateContent()}
                  disabled={!prompt.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Генерирую...
                    </>
                  ) : (
                    "Генерировать"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}