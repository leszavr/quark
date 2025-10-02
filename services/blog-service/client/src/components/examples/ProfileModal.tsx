import { useState } from 'react';
import ProfileModal from '../ProfileModal';
import { Button } from '@/components/ui/button';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';

export default function ProfileModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background p-4">
          <div className="text-center space-y-4">
            <Button onClick={() => setIsOpen(true)} data-testid="button-open-profile-modal">
              Открыть профиль
            </Button>
            <p className="text-muted-foreground">
              Попробуйте редактировать поля профиля и сменить пароль
            </p>
            <p className="text-sm text-muted-foreground">
              Примечание: Сначала войдите в систему, используя демо-режим
            </p>
          </div>
          
          <ProfileModal 
            isOpen={isOpen} 
            onClose={() => setIsOpen(false)} 
          />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}