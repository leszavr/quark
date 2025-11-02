"use client";

import { Shield, Puzzle } from "lucide-react";
import { getTranslation, DEFAULT_LANGUAGE, type Language } from "@/lib/i18n";
import { useState } from "react";

export default function OpenEcosystem() {
  const [language] = useState<Language>(DEFAULT_LANGUAGE);

  const ecosystemText = getTranslation(language, "ecosystem");

  const features = [
    {
      icon: Puzzle,
      title: ecosystemText.pluginHub,
      description: ecosystemText.pluginHubDesc,
      items: ["Пользовательские ИИ-агенты", "Интеграции третьих сторон", "Автоматизация рабочих процессов"],
    },
    {
      icon: Shield,
      title: ecosystemText.security,
      description: ecosystemText.securityDesc,
      items: ["Сквозное шифрование", "Сканирование уязвимостей", "Готовность к соответствию"],
    },
  ];

  return (
    <section id="ecosystem" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">{ecosystemText.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{ecosystemText.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-8 rounded-lg border border-border bg-background/50 hover:bg-background/80 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                style={{
                  animation: `slideUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                <Icon className="text-primary mb-4 size-8 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-4">{feature.description}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {feature.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
