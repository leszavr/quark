import { useState } from 'react';
import FullscreenChat from '../FullscreenChat';
import { Button } from '@/components/ui/button';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';

export default function FullscreenChatExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background p-4">
          <div className="text-center space-y-4">
            <Button onClick={() => setIsOpen(true)} data-testid="button-open-fullscreen-chat">
              Открыть полноэкранный чат
            </Button>
            <p className="text-muted-foreground">
              В режиме гостя - только просмотр общего канала
            </p>
            <p className="text-muted-foreground">
              В авторизованном режиме - полный функционал с контактами
            </p>
          </div>
          
          <FullscreenChat 
            isOpen={isOpen} 
            onClose={() => setIsOpen(false)} 
          />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}