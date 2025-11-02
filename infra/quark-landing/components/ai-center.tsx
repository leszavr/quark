"use client";

import { Brain, Sparkles, TrendingUp } from "lucide-react";
import { getTranslation, DEFAULT_LANGUAGE, type Language } from "@/lib/i18n";
import { useState } from "react";

export default function AICenter() {
  const [language] = useState<Language>(DEFAULT_LANGUAGE);

  const aiText = getTranslation(language, "ai");

  const capabilities = [
    {
      icon: Sparkles,
      title: aiText.smartWriting,
      description: aiText.smartWritingDesc,
    },
    {
      icon: Brain,
      title: aiText.personalization,
      description: aiText.personalizationDesc,
    },
    {
      icon: TrendingUp,
      title: aiText.insights,
      description: aiText.insightsDesc,
    },
  ];

  return (
    <section id="ai-center" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-balance">{aiText.title}</h2>
            <p className="text-lg text-muted-foreground mb-8">{aiText.description}</p>
            <div className="space-y-4">
              {capabilities.map((cap, index) => {
                const Icon = cap.icon;
                return (
                  <div key={index} className="flex gap-4 group">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                      <Icon className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{cap.title}</h3>
                      <p className="text-sm text-muted-foreground">{cap.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative h-96 rounded-lg border border-border bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
              <div
                className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-pulse"
                style={{ animationDelay: "1s" }}
              />
            </div>
            <div className="relative text-center">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-muted-foreground">AI-powered features</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
