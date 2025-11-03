"use client";

import { Card } from "@/shared/ui/card/Card";
import { Button } from "@/shared/ui/button/Button";
import { Switch } from "@/shared/ui/switch/Switch";
import { Label } from "@/shared/ui/label/Label";
import { Alert } from "@/shared/ui/alert/Alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs/Tabs";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import { 
  Settings, Database, Mail, Zap,
  Save, Upload, Download, Code,
  FileText, Archive
} from "lucide-react";

export function SettingsContent() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // ⚠️ MOCK DATA - Configuration values (not test data, will be loaded from backend)
  // API endpoint: GET /api/admin/settings - Expected format: SettingsConfig
  
  // Общие настройки
  const [siteName, setSiteName] = useState("Quark UI Platform");
  const [siteDescription, setSiteDescription] = useState("Платформа для разработки и развертывания AI-приложений");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);

  // Настройки уведомлений
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [newsletterEnabled, setNewsletterEnabled] = useState(true);
  const [notificationRetention, setNotificationRetention] = useState(30);

  // Настройки производительности
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [cacheTimeout, setCacheTimeout] = useState(3600);
  const [compressionEnabled, setCompressionEnabled] = useState(true);
  const [maxFileSize, setMaxFileSize] = useState(50);

  // Email настройки
  const [smtpHost, setSmtpHost] = useState("smtp.example.com");
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState("noreply@example.com");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [emailFrom, setEmailFrom] = useState("Quark UI <noreply@example.com>");

  // API настройки
  const [apiRateLimit, setApiRateLimit] = useState(1000);
  const [apiTimeout, setApiTimeout] = useState(30);
  const [corsEnabled, setCorsEnabled] = useState(true);
  const [allowedOrigins, setAllowedOrigins] = useState("https://example.com, https://app.example.com");

  // База данных
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupInterval, setBackupInterval] = useState(24);
  const [maxBackups, setMaxBackups] = useState(7);
  const [dbOptimization, setDbOptimization] = useState(false);

  // ⚠️ END MOCK DATA

  const handleSave = async (section: string) => {
    setIsLoading(true);
    try {
      // ⚠️ MOCK: Replace with actual API call
      // await fetch('/api/admin/settings', { method: 'PUT', body: JSON.stringify(settings) });
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Настройки сохранены",
        description: `Раздел "${section}" успешно обновлен`,
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить настройки",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold font-['Space_Grotesk']">Настройки системы</h1>
          <p className="text-gray-500 dark:text-gray-400">Конфигурация и управление параметрами платформы</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload size={18} />
            Импорт настроек
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={18} />
            Экспорт настроек
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings size={16} />
            <span>Общие</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Mail size={16} />
            <span>Уведомления</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap size={16} />
            <span>Производительность</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code size={16} />
            <span>API</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database size={16} />
            <span>База данных</span>
          </TabsTrigger>
        </TabsList>

        {/* Общие настройки */}
        <TabsContent value="general">
          <div className="flex flex-col gap-6">
            <Card>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold">Основная информация</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="site-name">Название сайта</Label>
                    <input
                      id="site-name"
                      type="text"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="Название вашего сайта"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="site-description">Описание</Label>
                    <textarea
                      id="site-description"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                      value={siteDescription}
                      onChange={(e) => setSiteDescription(e.target.value)}
                      placeholder="Краткое описание платформы"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="maintenance-mode">Режим обслуживания</Label>
                      <Switch
                        id="maintenance-mode"
                        checked={maintenanceMode}
                        onCheckedChange={setMaintenanceMode}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="registration-enabled">Регистрация новых пользователей</Label>
                      <Switch
                        id="registration-enabled"
                        checked={registrationEnabled}
                        onCheckedChange={setRegistrationEnabled}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {maintenanceMode && (
              <Alert variant="destructive">
                <p className="text-sm font-semibold">
                  Внимание! Режим обслуживания активен. Пользователи не смогут получить доступ к системе.
                </p>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => handleSave("Общие настройки")}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save size={18} />
                Сохранить изменения
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Уведомления */}
        <TabsContent value="notifications">
          <div className="flex flex-col gap-6">
            <Card>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold">Email настройки</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="smtp-host">SMTP хост</Label>
                      <input
                        id="smtp-host"
                        type="text"
                        className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="smtp-port">SMTP порт</Label>
                      <input
                        id="smtp-port"
                        type="number"
                        className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="smtp-user">SMTP пользователь</Label>
                      <input
                        id="smtp-user"
                        type="text"
                        className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="smtp-password">SMTP пароль</Label>
                      <input
                        id="smtp-password"
                        type="password"
                        className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email-from">От кого (From)</Label>
                    <input
                      id="email-from"
                      type="text"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                      value={emailFrom}
                      onChange={(e) => setEmailFrom(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold">Настройки уведомлений</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">Email уведомления</Label>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications">Push уведомления</Label>
                      <Switch
                        id="push-notifications"
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="newsletter">Рассылка новостей</Label>
                    <Switch
                      id="newsletter"
                      checked={newsletterEnabled}
                      onCheckedChange={setNewsletterEnabled}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="notification-retention">Хранение уведомлений (дни)</Label>
                    <input
                      id="notification-retention"
                      type="number"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                      value={notificationRetention}
                      onChange={(e) => setNotificationRetention(Number(e.target.value))}
                      min={1}
                      max={365}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={() => handleSave("Уведомления")}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save size={18} />
                Сохранить изменения
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Производительность */}
        <TabsContent value="performance">
          <div className="flex flex-col gap-6">
            <Card>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold">Кеширование</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cache-enabled">Включить кеширование</Label>
                    <Switch
                      id="cache-enabled"
                      checked={cacheEnabled}
                      onCheckedChange={setCacheEnabled}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="cache-timeout">Время жизни кеша (секунды)</Label>
                    <input
                      id="cache-timeout"
                      type="number"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                      value={cacheTimeout}
                      onChange={(e) => setCacheTimeout(Number(e.target.value))}
                      min={60}
                      max={86400}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold">Оптимизация</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compression">Сжатие данных (gzip)</Label>
                    <Switch
                      id="compression"
                      checked={compressionEnabled}
                      onCheckedChange={setCompressionEnabled}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="max-file-size">Максимальный размер файла (МБ)</Label>
                    <input
                      id="max-file-size"
                      type="number"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                      value={maxFileSize}
                      onChange={(e) => setMaxFileSize(Number(e.target.value))}
                      min={1}
                      max={1000}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={() => handleSave("Производительность")}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save size={18} />
                Сохранить изменения
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* API настройки */}
        <TabsContent value="api">
          <div className="flex flex-col gap-6">
            <Card>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold">Ограничения API</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="api-rate-limit">Лимит запросов в час</Label>
                    <input
                      id="api-rate-limit"
                      type="number"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                      value={apiRateLimit}
                      onChange={(e) => setApiRateLimit(Number(e.target.value))}
                      min={100}
                      max={10000}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="api-timeout">Таймаут запроса (секунды)</Label>
                    <input
                      id="api-timeout"
                      type="number"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                      value={apiTimeout}
                      onChange={(e) => setApiTimeout(Number(e.target.value))}
                      min={5}
                      max={120}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold">CORS настройки</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cors-enabled">Включить CORS</Label>
                    <Switch
                      id="cors-enabled"
                      checked={corsEnabled}
                      onCheckedChange={setCorsEnabled}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="allowed-origins">Разрешенные домены</Label>
                    <textarea
                      id="allowed-origins"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                      value={allowedOrigins}
                      onChange={(e) => setAllowedOrigins(e.target.value)}
                      placeholder="https://example.com, https://app.example.com"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={() => handleSave("API")}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save size={18} />
                Сохранить изменения
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* База данных */}
        <TabsContent value="database">
          <div className="flex flex-col gap-6">
            <Card>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold">Резервное копирование</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-backup">Автоматическое резервное копирование</Label>
                    <Switch
                      id="auto-backup"
                      checked={autoBackup}
                      onCheckedChange={setAutoBackup}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="backup-interval">Интервал копирования (часы)</Label>
                      <input
                        id="backup-interval"
                        type="number"
                        className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                        value={backupInterval}
                        onChange={(e) => setBackupInterval(Number(e.target.value))}
                        min={1}
                        max={168}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="max-backups">Максимум копий</Label>
                      <input
                        id="max-backups"
                        type="number"
                        className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                        value={maxBackups}
                        onChange={(e) => setMaxBackups(Number(e.target.value))}
                        min={1}
                        max={30}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold">Обслуживание БД</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="db-optimization">Автоматическая оптимизация</Label>
                    <Switch
                      id="db-optimization"
                      checked={dbOptimization}
                      onCheckedChange={setDbOptimization}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Database size={18} />
                      Оптимизировать сейчас
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Archive size={18} />
                      Создать резервную копию
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <FileText size={18} />
                      Просмотреть логи
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={() => handleSave("База данных")}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save size={18} />
                Сохранить изменения
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
