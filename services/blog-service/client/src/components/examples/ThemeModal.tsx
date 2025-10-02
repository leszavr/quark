import { useState } from 'react';
import ThemeModal from '../ThemeModal';
import { Button } from '@/components/ui/button';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function ThemeModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background p-4 transition-colors duration-200">
        <div className="text-center space-y-4">
          <Button onClick={() => setIsOpen(true)} data-testid="button-open-theme-modal">
            Открыть выбор темы
          </Button>
          <p className="text-muted-foreground">
            Попробуйте разные цветовые схемы и переключите темный/светлый режим
          </p>
        </div>
        
        <ThemeModal 
          isOpen={isOpen} 
          onClose={() => setIsOpen(false)} 
        />
      </div>
    </ThemeProvider>
  );
}