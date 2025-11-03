"use client";

import Link from "next/link";
import { Card } from "@/shared/ui/card/Card";
import { Button } from "@/shared/ui/button/Button";
import { Input } from "@/shared/ui/input/Input";
import { Label } from "@/shared/ui/label/Label";
import { Switch } from "@/shared/ui/switch/Switch";
import { Progress } from "@/shared/ui/progress/Progress";
import { Badge } from "@/shared/ui/badge/Badge";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert/Alert";
import { useToast } from "@/hooks/useToast";
import { useState, useEffect } from "react";
import { 
  Eye, 
  EyeOff, 
  Save, 
  Shield, 
  Lock,
  X,
  AlertTriangle,
  Smartphone,
  Clock,
  Activity
} from "lucide-react";

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: string;
  loginNotifications: boolean;
  suspiciousActivityAlerts: boolean;
  deviceTracking: boolean;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
  label: string;
}

const defaultSettings: SecuritySettings = {
  twoFactorEnabled: false,
  sessionTimeout: "24",
  loginNotifications: true,
  suspiciousActivityAlerts: true,
  deviceTracking: true,
};

const sessionTimeoutOptions = [
  { value: "1", label: "1 час" },
  { value: "8", label: "8 часов" },
  { value: "24", label: "24 часа" },
  { value: "168", label: "1 неделя" },
  { value: "720", label: "1 месяц" },
];

// Helper: convert color to Tailwind text class
const getTextColorClass = (color: string): string => {
  if (color === 'green') return 'text-green-600';
  if (color === 'yellow') return 'text-yellow-600';
  if (color === 'orange') return 'text-orange-600';
  return 'text-red-600';
};

// Helper: convert color to Tailwind bg class
const getBgColorClass = (color: string): string => {
  if (color === 'green') return 'bg-green-200';
  if (color === 'yellow') return 'bg-yellow-200';
  if (color === 'orange') return 'bg-orange-200';
  return 'bg-red-200';
};

export function SecurityTab() {
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [settings, setSettings] = useState<SecuritySettings>(defaultSettings);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: "gray",
    label: "Слабый",
  });
  
  const { toast } = useToast();

  // Загружаем настройки из localStorage при монтировании
  useEffect(() => {
    const savedSettings = localStorage.getItem("securitySettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Ошибка загрузки настроек безопасности:", error);
      }
    }
  }, []);

  // Анализ силы пароля
  const analyzePasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return { score: 0, feedback: [], color: "gray", label: "Слабый" };
    }

    let score = 0;
    const feedback: string[] = [];

    // Проверка длины
    if (password.length >= 8) {
      score += 20;
    } else {
      feedback.push("Минимум 8 символов");
    }

    // Проверка на прописные буквы
    if (/[A-Z]/.test(password)) {
      score += 20;
    } else {
      feedback.push("Добавьте заглавные буквы");
    }

    // Проверка на строчные буквы
    if (/[a-z]/.test(password)) {
      score += 20;
    } else {
      feedback.push("Добавьте строчные буквы");
    }

    // Проверка на цифры
    if (/\d/.test(password)) {
      score += 20;
    } else {
      feedback.push("Добавьте цифры");
    }

    // Проверка на специальные символы
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      score += 20;
    } else {
      feedback.push("Добавьте спецсимволы");
    }

    let color = "red";
    let label = "Слабый";
    if (score >= 80) {
      color = "green";
      label = "Отличный";
    } else if (score >= 60) {
      color = "yellow";
      label = "Хороший";
    } else if (score >= 40) {
      color = "orange";
      label = "Средний";
    }

    return { score, feedback, color, label };
  };

  // Обновление анализа пароля
  useEffect(() => {
    setPasswordStrength(analyzePasswordStrength(passwordData.newPassword));
  }, [passwordData.newPassword]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Новые пароли не совпадают",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (passwordStrength.score < 60) {
      toast({
        title: "Слабый пароль",
        description: "Пожалуйста, выберите более надежный пароль",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setIsChangingPassword(true);
    
    try {
      // Имитируем смену пароля
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Сохраняем информацию о смене пароля
      const passwordHistory = JSON.parse(localStorage.getItem("passwordHistory") || "[]");
      passwordHistory.push({
        changedAt: new Date().toISOString(),
        strength: passwordStrength.score,
      });
      localStorage.setItem("passwordHistory", JSON.stringify(passwordHistory));
      
      toast({
        title: "Пароль изменен",
        description: "Ваш пароль успешно обновлен",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Очищаем поля
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("[Password Change] Error changing password:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить пароль",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSettingsChange = (key: keyof SecuritySettings, value: boolean | string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("securitySettings", JSON.stringify(newSettings));
    
    toast({
      title: "Настройки обновлены",
      description: "Изменения настроек безопасности сохранены",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Смена пароля */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Смена пароля</h3>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Защищено
          </Badge>
        </div>
        <form onSubmit={handlePasswordChange}>
          <div className="flex flex-col gap-4">
            {/* Текущий пароль */}
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-sm">
                Текущий пароль <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPasswords.current ? "text" : "password"}
                  placeholder="Введите текущий пароль"
                  value={passwordData.currentPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ 
                    ...passwordData, 
                    currentPassword: e.target.value 
                  })}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Показать пароль"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Новый пароль */}
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm">
                Новый пароль <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="Введите новый пароль"
                  value={passwordData.newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ 
                    ...passwordData, 
                    newPassword: e.target.value 
                  })}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Показать пароль"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Индикатор силы пароля */}
              {passwordData.newPassword && (
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Надежность пароля</span>
                    <span className={`text-xs ${getTextColorClass(passwordStrength.color)}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <Progress 
                    value={passwordStrength.score} 
                    className={`h-2 ${getBgColorClass(passwordStrength.color)}`}
                  />
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="space-y-1 mt-2">
                      {passwordStrength.feedback.map((item) => (
                        <li key={item} className="text-xs text-gray-500 flex items-center gap-1">
                          <X className="w-3 h-3 text-red-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Подтверждение пароля */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm">
                Подтвердите новый пароль <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Подтвердите новый пароль"
                  value={passwordData.confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ 
                    ...passwordData, 
                    confirmPassword: e.target.value 
                  })}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Показать пароль"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordData.confirmPassword && passwordData.newPassword && 
               passwordData.confirmPassword !== passwordData.newPassword && (
                <p className="text-xs text-red-500 mt-1">
                  Пароли не совпадают
                </p>
              )}
            </div>

            {/* Кнопка смены пароля */}
            <Button
              type="submit"
              disabled={isChangingPassword}
              className="self-start flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isChangingPassword ? "Изменение пароля..." : "Изменить пароль"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Двухфакторная аутентификация */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold">Двухфакторная аутентификация</h3>
          <Badge variant={settings.twoFactorEnabled ? "default" : "secondary"}>
            {settings.twoFactorEnabled ? "Включена" : "Отключена"}
          </Badge>
        </div>
        <div className="flex flex-col gap-4">
          <Alert variant={settings.twoFactorEnabled ? "success" : "warning"}>
            {settings.twoFactorEnabled ? (
              <Shield className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <div>
              <AlertTitle>
                {settings.twoFactorEnabled ? "Аккаунт защищен" : "Повысьте безопасность"}
              </AlertTitle>
              <AlertDescription>
                {settings.twoFactorEnabled 
                  ? "Двухфакторная аутентификация активна"
                  : "Включите 2FA для дополнительной защиты аккаунта"
                }
              </AlertDescription>
            </div>
          </Alert>

          <div className="flex items-center">
            <Label htmlFor="2fa" className="flex-1 flex items-start gap-2 cursor-pointer">
              <Smartphone className="w-4 h-4 text-blue-500 mt-0.5" />
              <div>
                <div className="text-sm">Включить 2FA</div>
                <div className="text-xs text-gray-500">
                  Дополнительный код из мобильного приложения
                </div>
              </div>
            </Label>
            <Switch
              id="2fa"
              checked={settings.twoFactorEnabled}
              onCheckedChange={(checked: boolean) => handleSettingsChange("twoFactorEnabled", checked)}
            />
          </div>
        </div>
      </Card>

      {/* Настройки безопасности */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Настройки безопасности</h3>
        <div className="flex flex-col gap-4">
          {/* Уведомления о входах */}
          <div className="flex items-center">
            <Label htmlFor="login-notifications" className="flex-1 flex items-start gap-2 cursor-pointer">
              <Activity className="w-4 h-4 text-green-500 mt-0.5" />
              <div>
                <div className="text-sm">Уведомления о входах</div>
                <div className="text-xs text-gray-500">
                  Получать email при входе с нового устройства
                </div>
              </div>
            </Label>
            <Switch
              id="login-notifications"
              checked={settings.loginNotifications}
              onCheckedChange={(checked: boolean) => handleSettingsChange("loginNotifications", checked)}
            />
          </div>

          <hr className="my-2" />

          {/* ВРЕМЕННО: Ссылка на админку для разработки */}
          <div className="p-4 rounded-md bg-orange-50 border border-orange-200 dark:bg-orange-900 dark:border-orange-700">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-orange-700 dark:text-orange-200">
                  🚧 Режим разработки
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-300">
                  Доступ к административной панели
                </div>
              </div>
              <Link href="/admin" passHref>
                <Button
                  size="sm"
                  variant="default"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>

          <hr className="my-2" />

          {/* Оповещения о подозрительной активности */}
          <div className="flex items-center">
            <Label htmlFor="suspicious-alerts" className="flex-1 flex items-start gap-2 cursor-pointer">
              <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
              <div>
                <div className="text-sm">Оповещения о подозрительной активности</div>
                <div className="text-xs text-gray-500">
                  Уведомления о необычных действиях в аккаунте
                </div>
              </div>
            </Label>
            <Switch
              id="suspicious-alerts"
              checked={settings.suspiciousActivityAlerts}
              onCheckedChange={(checked: boolean) => handleSettingsChange("suspiciousActivityAlerts", checked)}
            />
          </div>

          <hr className="my-2" />

          {/* Отслеживание устройств */}
          <div className="flex items-center">
            <Label htmlFor="device-tracking" className="flex-1 flex items-start gap-2 cursor-pointer">
              <Smartphone className="w-4 h-4 text-purple-500 mt-0.5" />
              <div>
                <div className="text-sm">Отслеживание устройств</div>
                <div className="text-xs text-gray-500">
                  Запоминать информацию об используемых устройствах
                </div>
              </div>
            </Label>
            <Switch
              id="device-tracking"
              checked={settings.deviceTracking}
              onCheckedChange={(checked: boolean) => handleSettingsChange("deviceTracking", checked)}
            />
          </div>

          <hr className="my-2" />

          {/* Автовыход */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Автоматический выход из системы</span>
            </Label>
            <div className="flex gap-4">
              {sessionTimeoutOptions.map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={settings.sessionTimeout === option.value ? "default" : "outline"}
                  onClick={() => handleSettingsChange("sessionTimeout", option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Автоматический выход при бездействии
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}