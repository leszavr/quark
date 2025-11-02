"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSelector from "@/components/language-selector";
import type { Language } from "@/lib/i18n";

interface HeaderProps {
  onAuthClick: () => void
}

export default function Header({ onAuthClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("ru");

  const navLabels = {
    ru: { howItWorks: "Как это работает", aiFeatures: "Возможности ИИ", ecosystem: "Экосистема" },
    en: { howItWorks: "How it works", aiFeatures: "AI Features", ecosystem: "Ecosystem" },
    es: { howItWorks: "Cómo funciona", aiFeatures: "Características de IA", ecosystem: "Ecosistema" },
    fr: { howItWorks: "Comment ça marche", aiFeatures: "Fonctionnalités IA", ecosystem: "Écosystème" },
  };

  const navLinks = [
    { href: "#how-it-works", label: navLabels[language].howItWorks },
    { href: "#ai-center", label: navLabels[language].aiFeatures },
    { href: "#ecosystem", label: navLabels[language].ecosystem },
  ];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const getSignInLabel = () => {
    switch (language) {
      case "ru":
        return "Вход";
      case "es":
        return "Iniciar sesión";
      case "fr":
        return "Se connecter";
      default:
        return "Sign In";
    }
  };


  return (
  <header className="fixed top-0 w-full z-50 bg-background/50 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">Q</span>
          </div>
          <span className="font-bold text-xl hidden sm:inline">Quark</span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Section - Theme, Language, Auth */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onAuthClick}>
            {getSignInLabel()}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-muted rounded-lg transition"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col gap-4 p-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className="text-sm hover:text-primary transition-colors duration-200 py-2"
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-2 pt-4 border-t border-border">
              <ThemeToggle />
              <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={onAuthClick}>
                {getSignInLabel()}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
