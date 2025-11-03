"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Card } from "@/shared/ui/card/Card";
import { Button } from "@/shared/ui/button/Button";
import { Input } from "@/shared/ui/input/Input";
import { Label } from "@/shared/ui/label/Label";
import { Badge } from "@/shared/ui/badge/Badge";
import { Alert, AlertTitle, AlertDescription } from "@/shared/ui/alert/Alert";
import { Progress } from "@/shared/ui/progress/Progress";
import { useToast } from "@/hooks/useToast";
import { 
  Trash2, 
  AlertTriangle,
  Database,
  MessageSquare,
  Image as ImageIcon,
  Download,
  XCircle,
  CheckCircle,
  X,
  type LucideIcon
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface DeletionStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: LucideIcon;
}

const CONFIRMATION_TEXT = "DELETE MY ACCOUNT";

export function DangerZoneTab() {
  const [confirmationText, setConfirmationText] = useState("");
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isDataExported, setIsDataExported] = useState(false);
  const [understandingChecks, setUnderstandingChecks] = useState({
    permanent: false,
    dataLoss: false,
    noRecovery: false,
    contactSupport: false,
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Проверка готовности к удалению
  const isReadyToDelete = 
    confirmationText === CONFIRMATION_TEXT &&
    password.length >= 8 &&
    Object.values(understandingChecks).every(Boolean) &&
    isDataExported;

  // Экспорт данных (имитация)
  const handleDataExport = async () => {
    try {
      // Имитируем экспорт данных
      const userData = {
        profile: JSON.parse(localStorage.getItem("profileData") || "{}"),
        personalization: JSON.parse(localStorage.getItem("personalizationData") || "{}"),
        security: JSON.parse(localStorage.getItem("securitySettings") || "{}"),
        support: JSON.parse(localStorage.getItem("supportTickets") || "[]"),
        exportDate: new Date().toISOString(),
      };

      // Создаем и скачиваем файл
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quark-ui-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setIsDataExported(true);
      toast({
        title: "Данные экспортированы",
        description: "Файл с вашими данными загружен",
        status: "success",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные",
        status: "error",
      });
    }
  };

  // Начало процедуры удаления
  const startDeletion = () => {
    if (!isReadyToDelete) {
      toast({
        title: "Не все требования выполнены",
        description: "Пожалуйста, выполните все необходимые шаги",
        status: "warning",
      });
      return;
    }
    setIsDialogOpen(true);
  };

  // Финальное подтверждение удаления
  const confirmDeletion = async () => {
    setIsDeleting(true);
    setCountdown(10);

    // Обратный отсчет
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          executeDeletion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Выполнение удаления
  const executeDeletion = async () => {
    try {
      // Имитируем удаление аккаунта
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Очищаем все данные из localStorage
      localStorage.clear();
      
      toast({
        title: "Аккаунт удален",
        description: "Ваш аккаунт был безвозвратно удален",
        status: "success",
        duration: 5000,
      });

      // В реальном приложении здесь был бы редирект на главную страницу
      setIsDialogOpen(false);
      
      // Имитируем выход из системы
      setTimeout(() => {
        globalThis.location.href = "/";
      }, 2000);
      
    } catch (error) {
      console.error("Deletion error:", error);
      toast({
        title: "Ошибка удаления",
        description: "Не удалось удалить аккаунт",
        status: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Отмена удаления
  const cancelDeletion = () => {
    setIsDeleting(false);
    setCountdown(0);
    setIsDialogOpen(false);
  };
  
  return (
    <div className="flex flex-col gap-6">
      {/* Предупреждение */}
      <Alert variant="destructive">
        <AlertTriangle className="w-4 h-4" />
        <div>
          <AlertTitle className="text-sm">Опасная зона</AlertTitle>
          <AlertDescription className="text-xs">
            Действия в этом разделе необратимы. Будьте очень осторожны.
          </AlertDescription>
        </div>
      </Alert>

      {/* Информация о последствиях */}
      <Card className="border-red-200 dark:border-red-800 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-red-600 dark:text-red-400">
            Что произойдет при удалении аккаунта
          </h3>
          <Badge variant="destructive">Необратимо</Badge>
        </div>
        <ul className="space-y-2">
          <li className="text-sm flex items-center gap-2">
            <Database size={16} className="text-red-500" />
            Все ваши данные будут безвозвратно удалены
          </li>
          <li className="text-sm flex items-center gap-2">
            <MessageSquare size={16} className="text-red-500" />
            История сообщений и обращений будет утеряна
          </li>
          <li className="text-sm flex items-center gap-2">
            <ImageIcon size={16} className="text-red-500" />
            Загруженные файлы и изображения будут удалены
          </li>
          <li className="text-sm flex items-center gap-2">
            <XCircle size={16} className="text-red-500" />
            Восстановление аккаунта будет невозможно
          </li>
        </ul>
      </Card>

      {/* Шаги подготовки к удалению */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Подготовка к удалению</h3>
        <div className="flex flex-col gap-4">
          {/* Экспорт данных */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Download size={16} className={isDataExported ? "text-green-500" : "text-gray-500"} />
                <span className="text-sm font-medium">1. Экспорт ваших данных</span>
                {isDataExported && <CheckCircle size={16} className="text-green-500" />}
              </div>
              <Button
                size="sm"
                variant={isDataExported ? "default" : "outline"}
                className={isDataExported ? "bg-green-500 hover:bg-green-600" : ""}
                onClick={handleDataExport}
                disabled={isDataExported}
              >
                <Download size={14} className="mr-2" />
                {isDataExported ? "Экспортировано" : "Экспортировать"}
              </Button>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              Скачайте все ваши данные в формате JSON
            </p>
          </div>

          <hr className="my-2" />

          {/* Понимание последствий */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={16} className="text-orange-500" />
              <span className="text-sm font-medium">2. Подтверждение понимания</span>
            </div>
            <div className="flex flex-col gap-2 ml-6">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={understandingChecks.permanent}
                  onChange={(e) => setUnderstandingChecks({
                    ...understandingChecks,
                    permanent: e.target.checked
                  })}
                  className="rounded"
                />
                <span>Я понимаю, что удаление аккаунта необратимо</span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={understandingChecks.dataLoss}
                  onChange={(e) => setUnderstandingChecks({
                    ...understandingChecks,
                    dataLoss: e.target.checked
                  })}
                  className="rounded"
                />
                <span>Я понимаю, что все данные будут потеряны</span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={understandingChecks.noRecovery}
                  onChange={(e) => setUnderstandingChecks({
                    ...understandingChecks,
                    noRecovery: e.target.checked
                  })}
                  className="rounded"
                />
                <span>Я понимаю, что восстановление невозможно</span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={understandingChecks.contactSupport}
                  onChange={(e) => setUnderstandingChecks({
                    ...understandingChecks,
                    contactSupport: e.target.checked
                  })}
                  className="rounded"
                />
                <span>Я связался с поддержкой, если у меня были вопросы</span>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Форма удаления */}
      <Card className="border-red-300 dark:border-red-700 overflow-hidden">
        <div className="bg-red-50 dark:bg-red-900 p-4 flex items-center gap-2">
          <Trash2 size={16} className="text-red-500" />
          <h3 className="font-semibold text-red-600 dark:text-red-400">
            Удаление аккаунта
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-4">
            {/* Текстовое подтверждение */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Введите <code className="bg-red-100 dark:bg-red-900 text-red-600 px-2 py-1 rounded">{CONFIRMATION_TEXT}</code> для подтверждения
              </Label>
              <Input
                placeholder={CONFIRMATION_TEXT}
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className={`border-2 ${
                  confirmationText === CONFIRMATION_TEXT 
                    ? "border-green-300 focus:border-green-500" 
                    : "border-red-300 focus:border-red-500"
                }`}
              />
            </div>

            {/* Пароль для подтверждения */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Введите ваш пароль для подтверждения
              </Label>
              <Input
                type="password"
                placeholder="Ваш пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`border-2 ${
                  password.length >= 8 
                    ? "border-green-300" 
                    : "border-red-300"
                }`}
              />
            </div>

            {/* Индикатор готовности */}
            <div>
              <p className="text-sm font-medium mb-2">Готовность к удалению</p>
              <Progress 
                value={isReadyToDelete ? 100 : 0}
                className={`h-2 ${isReadyToDelete ? "bg-red-200" : "bg-gray-200"}`}
              />
            </div>

            {/* Кнопка удаления */}
            <Button
              variant="default"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={startDeletion}
              disabled={!isReadyToDelete}
              size="lg"
            >
              <Trash2 size={16} className="mr-2" />
              Удалить аккаунт навсегда
            </Button>

            {!isReadyToDelete && (
              <p className="text-xs text-gray-500 text-center">
                Выполните все требования выше для активации кнопки удаления
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Модальное окно финального подтверждения */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 z-50">
            <Dialog.Title className="text-xl font-semibold text-red-500 flex items-center gap-2 mb-4">
              <AlertTriangle size={20} />
              Последнее предупреждение
            </Dialog.Title>
            
            {!isDeleting && (
              <Dialog.Close className="absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100">
                <X className="h-4 w-4" />
              </Dialog.Close>
            )}
            
            <div className="flex flex-col gap-4">
              {countdown > 0 && (
                <>
                  <p className="text-center">Удаление аккаунта начнется через:</p>
                  <p className="text-3xl font-bold text-center text-red-500">
                    {countdown}
                  </p>
                  <p className="text-sm text-gray-500 text-center">
                    Закройте это окно для отмены
                  </p>
                </>
              )}
              
              {isDeleting && (
                <>
                  <p className="text-center font-medium">Удаляем ваш аккаунт...</p>
                  <Progress value={50} className="h-2 bg-red-200 animate-pulse" />
                </>
              )}
              
              {countdown === 0 && !isDeleting && (
                <>
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      Это действие нельзя отменить. Ваш аккаунт и все данные будут безвозвратно удалены.
                    </AlertDescription>
                  </Alert>
                  <p className="text-sm text-center">
                    Вы уверены, что хотите продолжить?
                  </p>
                </>
              )}
            </div>

            {countdown === 0 && !isDeleting && (
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={cancelDeletion}>
                  Отмена
                </Button>
                <Button 
                  variant="default"
                  className="bg-red-500 hover:bg-red-600"
                  onClick={confirmDeletion}
                >
                  <Trash2 size={16} className="mr-2" />
                  Да, удалить аккаунт
                </Button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}