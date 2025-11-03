"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Card } from "@/shared/ui/card/Card";
import { Button } from "@/shared/ui/button/Button";
import { Badge } from "@/shared/ui/badge/Badge";
import { Progress } from "@/shared/ui/progress/Progress";
import { Alert, AlertTitle, AlertDescription } from "@/shared/ui/alert/Alert";
import { 
  Brain, Settings, CheckCircle, XCircle, Clock, Target,
  TrendingUp, Activity, Palette, Shield, Code, AlertTriangle, X
} from "lucide-react";

interface Proposal {
  id: number;
  title: string;
  description: string;
  type: "feature" | "bugfix" | "optimization" | "refactor" | "performance" | "ui_ux" | "code_quality" | "security";
  priority: "low" | "medium" | "high" | "critical";
  author: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  estimatedTime: string;
  rejectionReason?: string;
  confidence?: number;
  impact?: string;
  suggestedChanges?: string;
}

// Helper functions for consistent label formatting
function getProposalTypeLabel(type: Proposal['type']): string {
  if (type === "performance") return "Производительность";
  if (type === "ui_ux") return "UI/UX";
  if (type === "security") return "Безопасность";
  return "Качество кода";
}

function getProposalImpactLabel(impact: string | undefined): string {
  if (!impact) return "Низкий";
  if (impact === "high") return "Высокий";
  if (impact === "medium") return "Средний";
  return "Низкий";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getProposalStatusColor(status: Proposal['status']): string {
  if (status === "approved") return "green";
  if (status === "pending") return "yellow";
  return "red";
}

function getProposalStatusLabel(status: Proposal['status']): string {
  if (status === "approved") return "Одобрено";
  if (status === "pending") return "На рассмотрении";
  return "Отклонено";
}

export function AIopsContent() {
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: 1,
      title: "Оптимизация API запросов",
      type: "performance",
      priority: "high",
      author: "ИИ-ассистент",
      status: "pending",
      confidence: 94,
      impact: "high",
      description: "Предлагаю кешировать результаты часто используемых API запросов для повышения производительности",
      suggestedChanges: `// Добавить кеширование
const cache = new Map();

function getCachedApiData(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = fetchApiData(key);
  cache.set(key, data);
  return data;
}`,
      createdAt: "2024-01-15T10:30:00Z",
      estimatedTime: "2 часа"
    },
    {
      id: 2,
      title: "Улучшение UX формы логина",
      type: "ui_ux",
      priority: "medium",
      author: "ИИ-ассистент",
      status: "approved",
      confidence: 87,
      impact: "medium",
      description: "Добавить индикатор силы пароля и автозаполнение для улучшения пользовательского опыта",
      suggestedChanges: `<FormControl>
  <FormLabel>Пароль</FormLabel>
  <Input 
    type="password" 
    autoComplete="current-password"
    onChange={handlePasswordChange}
  />
  <PasswordStrengthIndicator strength={passwordStrength} />
</FormControl>`,
      createdAt: "2024-01-15T09:15:00Z",
      estimatedTime: "1.5 часа"
    },
    {
      id: 3,
      title: "Рефакторинг компонента чата",
      type: "code_quality",
      priority: "low",
      author: "ИИ-ассистент",
      status: "rejected",
      confidence: 76,
      impact: "low",
      description: "Разбить большой компонент чата на более мелкие для лучшей поддерживаемости",
      suggestedChanges: `// Разделить на компоненты:
// - MessageList.tsx
// - MessageInput.tsx  
// - MessageItem.tsx
// - ChatHeader.tsx`,
      createdAt: "2024-01-15T08:45:00Z",
      estimatedTime: "4 часа",
      rejectionReason: "Слишком сложно для текущего спринта"
    }
  ]);

  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getTypeColorClass = (type: Proposal["type"] | undefined): string => {
    if (type === 'performance') return 'bg-blue-50 text-blue-500';
    if (type === 'ui_ux') return 'bg-purple-50 text-purple-500';
    if (type === 'security') return 'bg-red-50 text-red-500';
    if (type === 'code_quality') return 'bg-green-50 text-green-500';
    return 'bg-gray-50 text-gray-500';
  };

  const getBadgeVariant = (status: Proposal['status']): "default" | "secondary" | "destructive" => {
    if (status === "approved") return "default";
    if (status === "pending") return "secondary";
    return "destructive";
  };

  const getTypeIcon = (type: Proposal["type"] | undefined) => {
    switch (type) {
      case "performance": return Activity;
      case "ui_ux": return Palette;
      case "security": return Shield;
      case "code_quality": return Code;
      case "feature": return Brain;
      case "bugfix": return AlertTriangle;
      case "optimization": return TrendingUp;
      case "refactor": return Code;
      default: return AlertTriangle;
    }
  };

  const handleApproveProposal = (proposalId: number) => {
    setProposals(prev => prev.map(p => 
      p.id === proposalId ? { ...p, status: "approved" } : p
    ));
  };

  const handleRejectProposal = (proposalId: number, reason: string) => {
    setProposals(prev => prev.map(p => 
      p.id === proposalId ? { ...p, status: "rejected", rejectionReason: reason } : p
    ));
  };

  const approvedCount = proposals.filter(p => p.status === "approved").length;
  const pendingCount = proposals.filter(p => p.status === "pending").length;

  const openProposalDialog = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold font-space-grotesk">AI Ops Console</h1>
          <p className="text-gray-500">Управление предложениями искусственного интеллекта</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline">
            <Brain className="w-4 h-4 mr-2" />
            Запустить анализ
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Настройки ИИ
          </Button>
        </div>
      </div>

      {/* Статистика предложений */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Brain size={32} className="text-purple-500" />
            <div>
              <div className="text-3xl font-bold">{proposals.length}</div>
              <div className="text-sm text-gray-500">Всего предложений</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <CheckCircle size={32} className="text-green-500" />
            <div>
              <div className="text-3xl font-bold">{approvedCount}</div>
              <div className="text-sm text-gray-500">Одобрено</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Clock size={32} className="text-orange-500" />
            <div>
              <div className="text-3xl font-bold">{pendingCount}</div>
              <div className="text-sm text-gray-500">На рассмотрении</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <TrendingUp size={32} className="text-blue-500" />
            <div>
              <div className="text-3xl font-bold">87%</div>
              <div className="text-sm text-gray-500">Ср. точность</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Список предложений */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Предложения ИИ</h2>
            <div className="flex gap-2">
              <Badge variant="default" className="bg-orange-100 text-orange-700">{pendingCount} ожидает</Badge>
              <Badge variant="default" className="bg-green-100 text-green-700">{approvedCount} одобрено</Badge>
            </div>
          </div>
        </div>
        <div className="divide-y">
          {proposals.map((proposal) => {
            const TypeIcon = getTypeIcon(proposal.type);
            const typeColorClass = getTypeColorClass(proposal.type);
            
            return (
              <button 
                key={proposal.id} 
                type="button"
                className="w-full text-left p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-0 bg-transparent"
                onClick={() => openProposalDialog(proposal)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${typeColorClass}`}>
                      <TypeIcon size={20} />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <h3 className="font-semibold text-lg">
                          {proposal.title}
                        </h3>
                        <Badge variant="secondary">
                          {getProposalTypeLabel(proposal.type)}
                        </Badge>
                        <Badge variant="outline">
                          {getProposalImpactLabel(proposal.impact)} приоритет
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        {proposal.description}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Target size={14} />
                          <span>Точность: {proposal.confidence}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>~{proposal.estimatedTime}</span>
                        </div>
                        <span>{new Date(proposal.createdAt).toLocaleDateString("ru-RU")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant={getBadgeVariant(proposal.status)}>
                      {getProposalStatusLabel(proposal.status)}
                    </Badge>
                    {proposal.status === "pending" && (
                      <div className="flex gap-1">
                        <button
                          className="p-1 text-green-500 hover:bg-green-50 rounded"
                          title="Одобрить"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveProposal(proposal.id);
                          }}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="Отклонить"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectProposal(proposal.id, "Отклонено администратором");
                          }}
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Модальное окно с деталями предложения */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full overflow-hidden flex flex-col z-50">
            <div className="p-6 border-b">
              <div className="flex items-start gap-3">
                <Brain size={24} className="text-purple-500" />
                <div className="flex flex-col gap-2 flex-1">
                  <Dialog.Title className="text-xl font-semibold">
                    {selectedProposal?.title}
                  </Dialog.Title>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {getProposalTypeLabel(selectedProposal?.type ?? 'code_quality')}
                    </Badge>
                    <Badge variant="outline">
                      {getProposalImpactLabel(selectedProposal?.impact)}
                    </Badge>
                  </div>
                </div>
                <Dialog.Close className="rounded-sm opacity-70 hover:opacity-100">
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {selectedProposal && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Описание</h3>
                    <p>{selectedProposal.description}</p>
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Уверенность ИИ</h3>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={selectedProposal.confidence || 0} 
                        className={`flex-1 h-3 ${(selectedProposal.confidence || 0) > 80 ? 'bg-green-200' : 'bg-yellow-200'}`}
                      />
                      <span className="font-bold">{selectedProposal.confidence || 0}%</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Время реализации</h3>
                    <p>{selectedProposal.estimatedTime}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Создано</h3>
                    <p>{new Date(selectedProposal.createdAt).toLocaleString("ru-RU")}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Предлагаемые изменения</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-600">
                    <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {selectedProposal.suggestedChanges}
                    </pre>
                  </div>
                </div>

                {selectedProposal.status === "rejected" && selectedProposal.rejectionReason && (
                  <Alert variant="warning">
                    <AlertTriangle className="w-4 h-4" />
                    <div>
                      <AlertTitle>Причина отклонения:</AlertTitle>
                      <AlertDescription>{selectedProposal.rejectionReason}</AlertDescription>
                    </div>
                  </Alert>
                )}
              </div>
            )}
          </div>
          <div className="p-6 border-t flex justify-end gap-3">
            {selectedProposal?.status === "pending" && (
              <>
                <Button 
                  variant="default"
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => {
                    handleApproveProposal(selectedProposal.id);
                    setIsDialogOpen(false);
                  }}
                >
                  <CheckCircle size={16} className="mr-2" />
                  Одобрить
                </Button>
                <Button 
                  variant="outline"
                  className="text-red-500 border-red-500 hover:bg-red-50"
                  onClick={() => {
                    const reason = prompt("Причина отклонения:");
                    if (reason) {
                      handleRejectProposal(selectedProposal.id, reason);
                      setIsDialogOpen(false);
                    }
                  }}
                >
                  <XCircle size={16} className="mr-2" />
                  Отклонить
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Закрыть
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}