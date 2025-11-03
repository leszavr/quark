"use client";

import { useState } from "react";
import { Card } from "@/shared/ui/card/Card";
import { Button } from "@/shared/ui/button/Button";
import { Input } from "@/shared/ui/input/Input";
import { Badge } from "@/shared/ui/badge/Badge";
import { Alert, AlertTitle, AlertDescription } from "@/shared/ui/alert/Alert";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/shared/ui/accordion/Accordion";
import { useToast } from "@/hooks/useToast";
import { 
  Send, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock
} from "lucide-react";

interface SupportTicket {
  subject: string;
  category: string;
  priority: string;
  description: string;
  email: string;
}

const categories = [
  { value: "technical", label: "Техническая проблема" },
  { value: "account", label: "Проблемы с аккаунтом" },
  { value: "feature", label: "Предложение улучшений" },
  { value: "billing", label: "Вопросы по оплате" },
  { value: "other", label: "Другое" },
];

const priorities = [
  { value: "low", label: "Низкий" },
  { value: "medium", label: "Средний" },
  { value: "high", label: "Высокий" },
  { value: "urgent", label: "Критический" },
];

const faqItems = [
  {
    question: "Как изменить пароль?",
    answer: "Перейдите в раздел \"Безопасность\" в настройках профиля и нажмите \"Изменить пароль\". Следуйте инструкциям на экране.",
  },
  {
    question: "Как загрузить аватар?",
    answer: "В разделе \"Основная информация\" нажмите на текущий аватар или кнопку \"Загрузить фото\". Выберите изображение размером не более 5 МБ.",
  },
  {
    question: "Почему я не получаю уведомления?",
    answer: "Проверьте настройки уведомлений в разделе \"Персонализация\". Убедитесь, что браузер не блокирует уведомления от сайта.",
  },
  {
    question: "Как удалить аккаунт?",
    answer: "Удаление аккаунта находится в разделе \"Danger Zone\". Это действие необратимо и требует подтверждения.",
  },
];

export function SupportTab() {
  const [ticket, setTicket] = useState<SupportTicket>({
    subject: "",
    category: "",
    priority: "medium",
    description: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticket.subject.trim() || !ticket.category || !ticket.description.trim() || !ticket.email.trim()) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        status: "error",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Имитируем отправку на сервер
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Сохраняем в localStorage для демонстрации
      const tickets = JSON.parse(localStorage.getItem("supportTickets") || "[]");
      const newTicket = {
        ...ticket,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      tickets.push(newTicket);
      localStorage.setItem("supportTickets", JSON.stringify(tickets));
      
      toast({
        title: "Обращение отправлено",
        description: "Мы получили ваше сообщение и ответим в ближайшее время",
        status: "success",
        duration: 5000,
      });
      
      // Очищаем форму
      setTicket({
        subject: "",
        category: "",
        priority: "medium",
        description: "",
        email: "",
      });
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Ошибка отправки",
        description: "Не удалось отправить обращение. Попробуйте позже.",
        status: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResponseTime = (category: string) => {
    if (category === "urgent") return "2-4 часа";
    if (category === "technical") return "1-2 дня";
    return "2-3 дня";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Контакты поддержки */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Контакты службы поддержки</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Mail size={20} className="text-blue-500" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">support@quark-ui.com</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Phone size={20} className="text-green-500" />
            <div>
              <p className="text-sm font-medium">Телефон</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">+7 (800) 555-0123</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-orange-500" />
            <div>
              <p className="text-sm font-medium">Время работы</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Пн-Пт: 9:00 - 18:00 (МСК)</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Форма обращения */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Новое обращение</h3>
          <Badge variant="secondary" className="flex items-center gap-1">
            <MessageCircle size={14} />
            Форма обратной связи
          </Badge>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email и тема */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="email-input" className="text-sm font-medium">
                Email для ответа <span className="text-red-500">*</span>
              </label>
              <Input
                id="email-input"
                type="email"
                placeholder="your@email.com"
                value={ticket.email}
                onChange={(e) => setTicket({ ...ticket, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="subject-input" className="text-sm font-medium">
                Тема обращения <span className="text-red-500">*</span>
              </label>
              <Input
                id="subject-input"
                placeholder="Кратко опишите проблему"
                value={ticket.subject}
                onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Категория и приоритет */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="category-select" className="text-sm font-medium">
                Категория <span className="text-red-500">*</span>
              </label>
              <select
                id="category-select"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
                value={ticket.category}
                onChange={(e) => setTicket({ ...ticket, category: e.target.value })}
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="priority-select" className="text-sm font-medium">Приоритет</label>
              <select
                id="priority-select"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
                value={ticket.priority}
                onChange={(e) => setTicket({ ...ticket, priority: e.target.value })}
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Описание проблемы */}
          <div className="space-y-2">
            <label htmlFor="description-textarea" className="text-sm font-medium">
              Подробное описание <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description-textarea"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm min-h-[120px] resize-y"
              placeholder="Детально опишите вашу проблему или вопрос..."
              value={ticket.description}
              onChange={(e) => setTicket({ ...ticket, description: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Чем подробнее описание, тем быстрее мы сможем помочь
            </p>
          </div>

          {/* Превью выбранной категории */}
          {ticket.category && (
            <Alert>
              <div>
                <AlertTitle className="text-sm">
                  {categories.find(c => c.value === ticket.category)?.label}
                </AlertTitle>
                <AlertDescription className="text-xs">
                  Среднее время ответа: {getResponseTime(ticket.category)}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Кнопка отправки */}
          <Button
            type="submit"
            variant="default"
            size="lg"
            className="self-start flex items-center gap-2"
            disabled={isSubmitting}
          >
            <Send size={16} />
            {isSubmitting ? "Отправка..." : "Отправить обращение"}
          </Button>
        </form>
      </Card>

      {/* FAQ */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Часто задаваемые вопросы</h3>
        <Accordion type="multiple" className="space-y-2">
          {faqItems.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
}