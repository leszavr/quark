import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Palette, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const themes = [
  { id: 'classic', name: 'Классическая', color: 'hsl(220, 15%, 25%)', description: 'Минималистичный серый дизайн' },
  { id: 'blue', name: 'Синяя', color: 'hsl(215, 85%, 55%)', description: 'Динамичная голубая схема (Twitter/X)' },
  { id: 'purple', name: 'Фиолетовая', color: 'hsl(270, 75%, 60%)', description: 'Креативная фиолетовая тема (Discord)' },
  { id: 'green', name: 'Зеленая', color: 'hsl(145, 70%, 45%)', description: 'Свежая зеленая палитра (WhatsApp)' },
  { id: 'orange', name: 'Оранжевая', color: 'hsl(25, 85%, 55%)', description: 'Энергичная оранжевая схема (Reddit)' },
  { id: 'indigo', name: 'Индиго', color: 'hsl(235, 80%, 50%)', description: 'Технологичная сине-серая тема (Telegram)' }
] as const;

export default function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
  const { theme, setTheme, isDark, setIsDark } = useTheme();

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId as any);
    console.log(`Theme changed to: ${themeId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Выбор цветовой темы
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dark/Light mode toggle */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="font-medium">Темный режим</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDark(!isDark)}
              data-testid="button-toggle-dark"
              className="gap-2"
            >
              {isDark ? (
                <>
                  <Moon className="h-4 w-4" />
                  Темный
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4" />
                  Светлый
                </>
              )}
            </Button>
          </div>

          {/* Theme selection */}
          <div className="space-y-3">
            <h3 className="font-medium">Цветовые схемы</h3>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((themeOption) => (
                <Card
                  key={themeOption.id}
                  className={`p-3 cursor-pointer transition-all duration-200 hover-elevate ${
                    theme === themeOption.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleThemeSelect(themeOption.id)}
                  data-testid={`button-theme-${themeOption.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: themeOption.color }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{themeOption.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {themeOption.description}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <Button
              variant="default"
              onClick={onClose}
              data-testid="button-close-theme-modal"
            >
              Готово
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}