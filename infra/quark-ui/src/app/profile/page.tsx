"use client";

import React, { useState } from "react";
// Chakra UI удалён, используем стандартные элементы и Tailwind
import {
  User,
  Palette,
  MessageSquare,
  Shield,
  AlertTriangle,
  Bot,
} from "lucide-react";
import { Header } from "@/components/layout/Header";

// Импортируем компоненты табов
import { BasicInfoTab } from "../../components/profile/BasicInfoTab";
import { PersonalizationTab } from "../../components/profile/PersonalizationTab";
import { AIAgentTab } from "../../components/profile/AIAgentTab";
import { SupportTab } from "../../components/profile/SupportTab";
import { SecurityTab } from "../../components/profile/SecurityTab";
import { DangerZoneTab } from "../../components/profile/DangerZoneTab";

export default function ProfilePage() {
  const [tabIndex, setTabIndex] = useState(0);

  const tabs = [
    {
      id: "basic",
      label: "Основная информация",
      icon: User,
      color: "blue",
    },
    {
      id: "personalization",
      label: "Персонализация",
      icon: Palette,
      color: "purple",
    },
    {
      id: "ai-agent",
      label: "AI Агент",
      icon: Bot,
      color: "cyan",
    },
    {
      id: "support",
      label: "Поддержка",
      icon: MessageSquare,
      color: "green",
    },
    {
      id: "security",
      label: "Безопасность",
      icon: Shield,
      color: "orange",
    },
    {
      id: "danger",
      label: "Danger Zone",
      icon: AlertTriangle,
      color: "red",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header showHomeButton />
      <div className="max-w-6xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Настройки профиля</h1>
          <p className="text-gray-600 dark:text-gray-400">Управляйте своим аккаунтом и персональными настройками</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 mb-6 overflow-x-auto flex flex-wrap md:flex-nowrap gap-2">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              className={`min-w-[200px] px-4 py-3 rounded-md transition-all text-sm font-medium flex items-center gap-2 ${tabIndex === index ? `bg-${tab.color}-500 text-white dark:bg-${tab.color}-600` : `bg-${tab.color}-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-${tab.color}-100 dark:hover:bg-gray-600`}`}
              onClick={() => setTabIndex(index)}
            >
              {React.createElement(tab.icon, { size: 16 })}
              {tab.label}
            </button>
          ))}
        </div>
        <div>
          {tabIndex === 0 && <BasicInfoTab />}
          {tabIndex === 1 && <PersonalizationTab />}
          {tabIndex === 2 && <AIAgentTab />}
          {tabIndex === 3 && <SupportTab />}
          {tabIndex === 4 && <SecurityTab />}
          {tabIndex === 5 && <DangerZoneTab />}
        </div>
      </div>
    </div>
  );
}