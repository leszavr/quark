"use client";

import { useState, useEffect } from "react";
import { Card } from "@/shared/ui/card/Card";
import { Button } from "@/shared/ui/button/Button";
import { Switch } from "@/shared/ui/switch/Switch";
import { Badge } from "@/shared/ui/badge/Badge";
import { useToast } from "@/hooks/useToast";
import { Edit2, Save, X, RefreshCw } from "lucide-react";

interface PersonalizationData {
  signature: string;
  displayOnlineStatus: boolean;
  showLastSeen: boolean;
  showReadReceipts: boolean;
  language: string;
  timezone: string;
  theme: string;
  notifications: {
    email: boolean;
    push: boolean;
    mentions: boolean;
    replies: boolean;
  };
}

const defaultData: PersonalizationData = {
  signature: "",
  displayOnlineStatus: true,
  showLastSeen: true,
  showReadReceipts: true,
  language: "ru",
  timezone: "Europe/Moscow",
  theme: "system",
  notifications: {
    email: true,
    push: true,
    mentions: true,
    replies: true,
  },
};

const languages = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
  { value: "uk", label: "Українська" },
  { value: "kz", label: "Қазақша" },
];

const timezones = [
  { value: "Europe/Moscow", label: "Москва (UTC+3)" },
  { value: "Europe/Kiev", label: "Киев (UTC+2)" },
  { value: "Asia/Almaty", label: "Алматы (UTC+6)" },
  { value: "Europe/London", label: "Лондон (UTC+0)" },
  { value: "America/New_York", label: "Нью-Йорк (UTC-5)" },
];

const themes = [
  { value: "system", label: "Системная" },
  { value: "light", label: "Светлая" },
  { value: "dark", label: "Тёмная" },
];

export function PersonalizationTab() {
  const [data, setData] = useState<PersonalizationData>(defaultData);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState<PersonalizationData>(defaultData);
  const { toast } = useToast();

  // Загружаем данные из localStorage при монтировании
  useEffect(() => {
    const saved = localStorage.getItem("personalizationData");
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setData(parsedData);
        setOriginalData(parsedData);
      } catch (error) {
        console.error("Ошибка парсинга данных персонализации:", error);
      }
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem("personalizationData", JSON.stringify(data));
      setOriginalData(data);
      setIsEditing(false);
      toast({
        title: "Настройки сохранены",
        description: "Настройки персонализации успешно обновлены",
        status: "success",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        status: "error",
      });
    }
  };

  const handleCancel = () => {
    setData(originalData);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleReset = () => {
    setData(defaultData);
    setOriginalData(defaultData);
    localStorage.removeItem("personalizationData");
    toast({
      title: "Настройки сброшены",
      description: "Все настройки персонализации сброшены к значениям по умолчанию",
      status: "info",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Заголовок и действия */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Персонализация</h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            disabled={isEditing}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Сбросить
          </Button>
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <X size={16} />
                Отмена
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={handleSave}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                Сохранить
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <Edit2 size={16} />
              Редактировать
            </Button>
          )}
        </div>
      </div>

      {/* Подпись */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Подпись</h3>
        <div className="space-y-2">
          <label htmlFor="signature-textarea" className="text-sm font-medium">Автоматическая подпись в сообщениях</label>
          <textarea
            id="signature-textarea"
            value={data.signature}
            onChange={(e) => setData({ ...data, signature: e.target.value })}
            placeholder="Введите вашу подпись..."
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm min-h-[100px] resize-y ${
              isEditing ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
            }`}
            readOnly={!isEditing}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Максимум 500 символов. Подпись будет автоматически добавляться к вашим сообщениям.
          </p>
        </div>
      </Card>

      {/* Приватность и отображение */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Приватность и отображение</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Показывать статус «онлайн»</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Другие пользователи смогут видеть, когда вы находитесь в сети
              </p>
            </div>
            <Switch
              checked={data.displayOnlineStatus}
              onCheckedChange={(checked) => setData({ ...data, displayOnlineStatus: checked })}
              disabled={!isEditing}
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800" />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Показывать время последнего входа</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Отображение времени вашего последнего посещения
              </p>
            </div>
            <Switch
              checked={data.showLastSeen}
              onCheckedChange={(checked) => setData({ ...data, showLastSeen: checked })}
              disabled={!isEditing}
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800" />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Уведомления о прочтении</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Отправлять и получать уведомления о прочтении сообщений
              </p>
            </div>
            <Switch
              checked={data.showReadReceipts}
              onCheckedChange={(checked) => setData({ ...data, showReadReceipts: checked })}
              disabled={!isEditing}
            />
          </div>
        </div>
      </Card>

      {/* Язык и регион */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-semibold">Язык и регион</h3>
          <Badge variant="secondary" className="text-xs">Требует перезагрузки</Badge>
        </div>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <label htmlFor="language-select" className="text-sm font-medium">Язык интерфейса</label>
            <select
              id="language-select"
              value={data.language}
              onChange={(e) => setData({ ...data, language: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm disabled:opacity-50"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="timezone-select" className="text-sm font-medium">Часовой пояс</label>
            <select
              id="timezone-select"
              value={data.timezone}
              onChange={(e) => setData({ ...data, timezone: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm disabled:opacity-50"
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="theme-select" className="text-sm font-medium">Тема оформления</label>
            <select
              id="theme-select"
              value={data.theme}
              onChange={(e) => setData({ ...data, theme: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm disabled:opacity-50"
            >
              {themes.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Уведомления */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Уведомления</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Email уведомления</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Получать уведомления на электронную почту
              </p>
            </div>
            <Switch
              checked={data.notifications.email}
              onCheckedChange={(checked) => setData({ 
                ...data, 
                notifications: { ...data.notifications, email: checked }
              })}
              disabled={!isEditing}
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800" />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Push уведомления</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Получать push-уведомления в браузере
              </p>
            </div>
            <Switch
              checked={data.notifications.push}
              onCheckedChange={(checked) => setData({ 
                ...data, 
                notifications: { ...data.notifications, push: checked }
              })}
              disabled={!isEditing}
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800" />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Упоминания</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Уведомления при упоминании в сообщениях
              </p>
            </div>
            <Switch
              checked={data.notifications.mentions}
              onCheckedChange={(checked) => setData({ 
                ...data, 
                notifications: { ...data.notifications, mentions: checked }
              })}
              disabled={!isEditing}
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800" />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Ответы на сообщения</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Уведомления при ответах на ваши сообщения
              </p>
            </div>
            <Switch
              checked={data.notifications.replies}
              onCheckedChange={(checked) => setData({ 
                ...data, 
                notifications: { ...data.notifications, replies: checked }
              })}
              disabled={!isEditing}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}