"use client";

import { Card } from "@/shared/ui/card/Card";
import { Button } from "@/shared/ui/button/Button";
import { Switch } from "@/shared/ui/switch/Switch";
import { Label } from "@/shared/ui/label/Label";
import { Alert } from "@/shared/ui/alert/Alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs/Tabs";
import { Slider } from "@/shared/ui/slider/Slider";
import { useToast } from "@/hooks/useToast";
import { useState, useEffect } from "react";
import { 
  Save, 
  Cpu, 
  Settings,
  Zap,
  Target,
  MessageSquare,
  RefreshCw
} from "lucide-react";

interface AISettings {
  // Основные настройки
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  
  // Персональность и стиль
  personality: string;
  writingStyle: string;
  tone: string;
  language: string;
  
  // Системные промпты
  systemPrompt: string;
  postPrompt: string;
  chatPrompt: string;
  
  // Дополнительные настройки
  useContext: boolean;
  maxContextLength: number;
  streaming: boolean;
  autoSuggestions: boolean;
  
  // Модерация
  contentFiltering: boolean;
  safetyLevel: string;
}

// ⚠️ MOCK DATA - Default configuration values (not test data, will persist to localStorage)
const defaultSettings: AISettings = {
  model: "gpt-4-turbo",
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  frequencyPenalty: 0,
  presencePenalty: 0,
  
  personality: "professional",
  writingStyle: "clear",
  tone: "friendly",
  language: "ru",
  
  systemPrompt: "Ты - полезный AI ассистент, который помогает создавать качественный контент.",
  postPrompt: "Помоги создать интересный и информативный пост на заданную тему.",
  chatPrompt: "Отвечай естественно и дружелюбно, как опытный собеседник.",
  
  useContext: true,
  maxContextLength: 4000,
  streaming: true,
  autoSuggestions: true,
  
  contentFiltering: true,
  safetyLevel: "moderate",
};
// ⚠️ END MOCK DATA

const models = [
  { value: "gpt-4-turbo", label: "GPT-4 Turbo (Recommended)", description: "Самая мощная модель" },
  { value: "gpt-4", label: "GPT-4", description: "Высокое качество" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", description: "Быстро и экономично" },
  { value: "claude-3-opus", label: "Claude 3 Opus", description: "Отлично для творчества" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet", description: "Сбалансированный выбор" },
];

const personalities = [
  { value: "professional", label: "Профессиональный", description: "Деловой и точный" },
  { value: "creative", label: "Творческий", description: "Креативный и вдохновляющий" },
  { value: "casual", label: "Неформальный", description: "Дружелюбный и простой" },
  { value: "expert", label: "Экспертный", description: "Глубокие знания и анализ" },
  { value: "humorous", label: "С юмором", description: "Легкий и остроумный" },
];

const writingStyles = [
  { value: "clear", label: "Ясный" },
  { value: "detailed", label: "Подробный" },
  { value: "concise", label: "Краткий" },
  { value: "academic", label: "Академический" },
  { value: "conversational", label: "Разговорный" },
];

const tones = [
  { value: "friendly", label: "Дружелюбный" },
  { value: "formal", label: "Формальный" },
  { value: "enthusiastic", label: "Восторженный" },
  { value: "calm", label: "Спокойный" },
  { value: "authoritative", label: "Авторитетный" },
];

const safetyLevels = [
  { value: "strict", label: "Строгий", description: "Максимальная фильтрация" },
  { value: "moderate", label: "Умеренный", description: "Сбалансированная фильтрация" },
  { value: "relaxed", label: "Свободный", description: "Минимальная фильтрация" },
];

export function AIAgentTab() {
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [isEditing, setIsEditing] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<AISettings>(defaultSettings);
  const { toast } = useToast();

  // Загружаем настройки из localStorage при монтировании
  useEffect(() => {
    const saved = localStorage.getItem("aiSettings");
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved);
        setSettings(parsedSettings);
        setOriginalSettings(parsedSettings);
      } catch (error) {
        console.error("Ошибка парсинга настроек AI:", error);
      }
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem("aiSettings", JSON.stringify(settings));
      setOriginalSettings(settings);
      setIsEditing(false);
      toast({
        title: "Настройки AI сохранены",
        description: "Новые параметры агента будут применены для следующих запросов",
      });
    } catch (error) {
      console.error("Failed to save AI settings:", error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить настройки AI",
      });
    }
  };

  const handleCancel = () => {
    setSettings(originalSettings);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setOriginalSettings(defaultSettings);
    localStorage.removeItem("aiSettings");
    toast({
      title: "Настройки сброшены",
      description: "Все параметры AI агента восстановлены по умолчанию",
    });
  };

  const getModelDescription = (modelValue: string) => {
    return models.find(m => m.value === modelValue)?.description || "";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Заголовок и действия */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Cpu size={20} className="text-blue-500" />
          <h2 className="text-lg font-semibold">
            Настройки AI Агента
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            disabled={isEditing}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Сбросить
          </Button>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
              >
                Отмена
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                Сохранить
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <Settings size={16} />
              Редактировать
            </Button>
          )}
        </div>
      </div>

      {/* Информация о текущих настройках */}
      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <Cpu size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Текущая конфигурация AI агента
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Модель: {models.find(m => m.value === settings.model)?.label} • 
              Температура: {settings.temperature} • 
              Стиль: {personalities.find(p => p.value === settings.personality)?.label}
            </p>
          </div>
        </div>
      </Alert>

      <Tabs defaultValue="model" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="model" className="flex items-center gap-2 text-sm">
            <Zap size={16} />
            <span>Модель и параметры</span>
          </TabsTrigger>
          <TabsTrigger value="personality" className="flex items-center gap-2 text-sm">
            <Target size={16} />
            <span>Персональность</span>
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2 text-sm">
            <MessageSquare size={16} />
            <span>Промпты</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2 text-sm">
            <Settings size={16} />
            <span>Дополнительно</span>
          </TabsTrigger>
        </TabsList>

        {/* Вкладка: Модель и параметры */}
        <TabsContent value="model">
          <div className="flex flex-col gap-4">
            {/* Модель AI */}
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold">Модель AI</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="ai-model">Выберите модель</Label>
                  <select
                    id="ai-model"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                    value={settings.model}
                    onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                    disabled={!isEditing}
                  >
                    {models.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getModelDescription(settings.model)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Температура */}
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold">Креативность (Температура)</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="px-3">
                    <Slider
                      value={[settings.temperature]}
                      onValueChange={(value: number[]) => setSettings({ ...settings, temperature: value[0] })}
                      min={0}
                      max={2}
                      step={0.1}
                      disabled={!isEditing}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span className="font-semibold text-blue-600">{settings.temperature}</span>
                      <span>2</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Низкие значения (0-0.3) - более предсказуемо, высокие (0.7-1.5) - более креативно
                  </p>
                </div>
              </div>
            </Card>

            {/* Максимальные токены */}
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold">Максимальная длина ответа</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="max-tokens">Токены</Label>
                  <input
                    id="max-tokens"
                    type="number"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                    value={settings.maxTokens}
                    onChange={(e) => setSettings({ ...settings, maxTokens: Number(e.target.value) })}
                    min={256}
                    max={8192}
                    step={256}
                    disabled={!isEditing}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Максимальное количество токенов в ответе (256-8192)
                  </p>
                </div>
              </div>
            </Card>

            {/* Top P */}
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold">Top P (Nucleus Sampling)</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="px-3">
                    <Slider
                      value={[settings.topP]}
                      onValueChange={(value: number[]) => setSettings({ ...settings, topP: value[0] })}
                      min={0.1}
                      max={1}
                      step={0.1}
                      disabled={!isEditing}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0.1</span>
                      <span className="font-semibold text-green-600">{settings.topP}</span>
                      <span>1.0</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Контролирует разнообразие ответов. Рекомендуется 0.9 для большинства задач
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Вкладка: Персональность */}
        <TabsContent value="personality">
          <div className="flex flex-col gap-4">
            {/* Тип личности */}
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold">Тип личности агента</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="personality">Выберите тип</Label>
                  <select
                    id="personality"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                    value={settings.personality}
                    onChange={(e) => setSettings({ ...settings, personality: e.target.value })}
                    disabled={!isEditing}
                  >
                    {personalities.map((personality) => (
                      <option key={personality.value} value={personality.value}>
                        {personality.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {personalities.find(p => p.value === settings.personality)?.description}
                  </p>
                </div>
              </div>
            </Card>

            {/* Стиль письма */}
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold">Стиль написания</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="writing-style">Выберите стиль</Label>
                  <select
                    id="writing-style"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                    value={settings.writingStyle}
                    onChange={(e) => setSettings({ ...settings, writingStyle: e.target.value })}
                    disabled={!isEditing}
                  >
                    {writingStyles.map((style) => (
                      <option key={style.value} value={style.value}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Тон общения */}
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold">Тон общения</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="tone">Выберите тон</Label>
                  <select
                    id="tone"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                    value={settings.tone}
                    onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
                    disabled={!isEditing}
                  >
                    {tones.map((tone) => (
                      <option key={tone.value} value={tone.value}>
                        {tone.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Язык */}
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold">Предпочитаемый язык</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="language">Выберите язык</Label>
                  <select
                    id="language"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    disabled={!isEditing}
                  >
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                    <option value="uk">Українська</option>
                    <option value="kz">Қазақша</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Вкладка: Промпты */}
        <TabsContent value="prompts">
          <div className="flex flex-col gap-4">
            {/* Системный промпт */}
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold">Системный промпт</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="system-prompt">Базовые инструкции</Label>
                  <textarea
                    id="system-prompt"
                    className={`px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md ${
                      isEditing ? "bg-white dark:bg-gray-800" : "bg-gray-100 dark:bg-gray-900"
                    }`}
                    value={settings.systemPrompt}
                    onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                    placeholder="Опишите роль и поведение AI агента..."
                    rows={4}
                    readOnly={!isEditing}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Базовые инструкции для AI агента, определяющие его роль и поведение
                  </p>
                </div>
              </div>
            </Card>

            {/* Промпт для постов */}
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold">Промпт для создания постов</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="post-prompt">Инструкции для постов</Label>
                  <textarea
                    id="post-prompt"
                    className={`px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md ${
                      isEditing ? "bg-white dark:bg-gray-800" : "bg-gray-100 dark:bg-gray-900"
                    }`}
                    value={settings.postPrompt}
                    onChange={(e) => setSettings({ ...settings, postPrompt: e.target.value })}
                    placeholder="Инструкции для создания постов..."
                    rows={3}
                    readOnly={!isEditing}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Специальные инструкции для генерации постов в социальных сетях
                  </p>
                </div>
              </div>
            </Card>

            {/* Промпт для чата */}
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold">Промпт для чата</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="chat-prompt">Инструкции для чата</Label>
                  <textarea
                    id="chat-prompt"
                    className={`px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md ${
                      isEditing ? "bg-white dark:bg-gray-800" : "bg-gray-100 dark:bg-gray-900"
                    }`}
                    value={settings.chatPrompt}
                    onChange={(e) => setSettings({ ...settings, chatPrompt: e.target.value })}
                    placeholder="Инструкции для общения в чате..."
                    rows={3}
                    readOnly={!isEditing}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Инструкции для ответов в чате и диалогах
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Вкладка: Дополнительные настройки */}
        <TabsContent value="advanced">
          <div className="flex flex-col gap-4">
            {/* Контекст и память */}
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold">Контекст и память</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="use-context" className="text-sm">Использовать контекст предыдущих сообщений</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        AI будет помнить предыдущие части диалога
                      </p>
                    </div>
                    <Switch
                      id="use-context"
                      checked={settings.useContext}
                      onCheckedChange={(checked) => setSettings({ ...settings, useContext: checked })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="max-context-length" className="text-sm">Максимальная длина контекста</Label>
                    <input
                      id="max-context-length"
                      type="number"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                      value={settings.maxContextLength}
                      onChange={(e) => setSettings({ ...settings, maxContextLength: Number(e.target.value) })}
                      min={1000}
                      max={8000}
                      step={500}
                      disabled={!isEditing || !settings.useContext}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Количество символов контекста для запоминания
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Поведение интерфейса */}
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold">Поведение интерфейса</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="streaming" className="text-sm">Потоковый вывод</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Показывать ответ по мере генерации
                      </p>
                    </div>
                    <Switch
                      id="streaming"
                      checked={settings.streaming}
                      onCheckedChange={(checked) => setSettings({ ...settings, streaming: checked })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="auto-suggestions" className="text-sm">Автоподсказки</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Предлагать варианты продолжения текста
                      </p>
                    </div>
                    <Switch
                      id="auto-suggestions"
                      checked={settings.autoSuggestions}
                      onCheckedChange={(checked) => setSettings({ ...settings, autoSuggestions: checked })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Безопасность и модерация */}
            <Card>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold">Безопасность и модерация</h3>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Label htmlFor="content-filtering" className="text-sm">Фильтрация контента</Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Автоматическая проверка на неподходящий контент
                      </p>
                    </div>
                    <Switch
                      id="content-filtering"
                      checked={settings.contentFiltering}
                      onCheckedChange={(checked) => setSettings({ ...settings, contentFiltering: checked })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="safety-level" className="text-sm">Уровень безопасности</Label>
                    <select
                      id="safety-level"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                      value={settings.safetyLevel}
                      onChange={(e) => setSettings({ ...settings, safetyLevel: e.target.value })}
                      disabled={!isEditing || !settings.contentFiltering}
                    >
                      {safetyLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {safetyLevels.find(l => l.value === settings.safetyLevel)?.description}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}