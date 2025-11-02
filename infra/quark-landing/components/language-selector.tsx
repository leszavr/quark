"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/i18n";

interface LanguageSelectorProps {
  onLanguageChange: (language: Language) => void
  currentLanguage: Language
}

export default function LanguageSelector({ onLanguageChange, currentLanguage }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const languages: { code: Language; label: string }[] = [
    { code: "ru", label: "Русский" },
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
  ];

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)} className="gap-2 rounded-lg">
        <Globe size={16} />
        <span className="hidden sm:inline">{currentLanguage.toUpperCase()}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg z-50">
           {languages.map(({ code, label }) => (
             <button
               key={code}
               onClick={() => {
                 onLanguageChange(code);
                 setIsOpen(false);
               }}
               className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
                 currentLanguage === code ? "bg-primary/10 text-primary font-semibold" : ""
               }`}
             >
               {label}
             </button>
           ))}
        </div>
      )}
    </div>
  );
}
