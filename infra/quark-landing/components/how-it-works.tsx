"use client";

import { MessageSquare, BookOpen, Zap } from "lucide-react";
import { getTranslation, DEFAULT_LANGUAGE, type Language } from "@/lib/i18n";

type FeaturesTextType = {
  howItWorks: string
  howItWorksDesc: string
  multiBlog: string
  multiBlogDesc: string
  messenger: string
  messengerDesc: string
  aiModules: string
  aiModulesDesc: string
}
import { useState } from "react";

export default function HowItWorks() {
  const [language] = useState<Language>(DEFAULT_LANGUAGE);

  const featuresText = getTranslation(language, "features") as FeaturesTextType;

  const features = featuresText ? [
    {
      icon: BookOpen,
      title: featuresText.multiBlog,
      description: featuresText.multiBlogDesc,
    },
    {
      icon: MessageSquare,
      title: featuresText.messenger,
      description: featuresText.messengerDesc,
    },
    {
      icon: Zap,
      title: featuresText.aiModules,
      description: featuresText.aiModulesDesc,
    },
  ] : [];

  return (
    <section id="how-it-works" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Маска с градиентом: #0A0A1A, прозрачность 100% сверху, 0% снизу */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: "linear-gradient(180deg, rgba(10,10,26,0) 0%, rgba(10,10,26,1) 100%)"
        }}
      />
      <div className="max-w-6xl mx-auto relative z-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">{featuresText.howItWorks}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{featuresText.howItWorksDesc}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
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
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
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
