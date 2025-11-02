"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { getTranslation, DEFAULT_LANGUAGE, type Language } from "@/lib/i18n";

type HeroTextType = {
  badge: string
  title: string
  description: string
  startFree: string
  learnMore: string
}

interface HeroProps {
  onGetStarted: () => void
}

export default function Hero({ onGetStarted }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [language] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768);
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (isMobile || !containerRef.current) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    if (typeof window !== "undefined") {
      containerRef.current.addEventListener("mousemove", handleMouseMove);
      return () => containerRef.current?.removeEventListener("mousemove", handleMouseMove);
    }
  }, [isMobile]);

  const heroText = getTranslation(language, "hero") as HeroTextType;

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >

      {/* Animated Background - fallback for mobile */}
      {isMobile && (
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating modules - animated geometric shapes */}
          <div
            className="absolute w-32 h-32 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl"
            style={{
              left: `${20 + mousePosition.x * 10}%`,
              top: `${20 + mousePosition.y * 10}%`,
              animation: "float 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-accent/15 to-primary/15 blur-3xl"
            style={{
              right: `${15 + mousePosition.x * 8}%`,
              bottom: `${25 + mousePosition.y * 8}%`,
              animation: "float 8s ease-in-out infinite 1s",
            }}
          />
          <div
            className="absolute w-28 h-28 rounded-lg bg-gradient-to-br from-secondary/20 to-primary/20 blur-3xl"
            style={{
              left: `${60 + mousePosition.x * 5}%`,
              top: `${60 + mousePosition.y * 5}%`,
              animation: "float 7s ease-in-out infinite 2s",
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance leading-tight">{heroText.title}</h1>

        <p className="text-lg sm:text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
          {heroText.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" onClick={onGetStarted} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {heroText.startFree}
          </Button>
          <Button size="lg" variant="outline">
            {heroText.learnMore}
          </Button>
        </div>

      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  );
}
