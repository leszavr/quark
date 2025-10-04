import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Palette, User, LogOut, UserPlus, LogIn } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import TestModal from './TestModal';

interface HeaderProps {
  onThemeModalOpen: () => void;
  onProfileModalOpen: () => void;
}

export default function Header({ onThemeModalOpen, onProfileModalOpen }: HeaderProps) {
  const { theme } = useTheme();
  const { user, isAuthenticated, logout, toggleDemoMode } = useAuth() as any;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left side - Logo and title */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MessageCircle className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold">BlogChat</h1>
        </div>

        {/* Right side - Theme button and auth */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onThemeModalOpen}
            data-testid="button-theme"
            className="gap-2"
          >
            <Palette className="h-4 w-4" />
            Тема
          </Button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onProfileModalOpen}
                data-testid="button-profile"
                className="gap-2"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar} alt={user.firstName} />
                  <AvatarFallback>{user.firstName[0]}{user.lastName[0]}</AvatarFallback>
                </Avatar>
                {user.firstName}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDemoMode}
                data-testid="button-logout"
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Выход
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Демо режим для тестирования */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDemoMode}
                data-testid="button-demo"
                className="gap-2"
              >
                <User className="h-4 w-4" />
                Демо
              </Button>
              
              {/* Реальная аутентификация */}
              <TestModal>
                <Button
                  variant="default"
                  size="sm"
                  data-testid="button-login"
                  className="gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Тест Модал
                </Button>
              </TestModal>
              
              <Button
                variant="ghost"
                size="sm"
                data-testid="button-register"
                className="gap-2"
                onClick={() => alert('Старая кнопка для сравнения')}
              >
                <UserPlus className="h-4 w-4" />
                Старая кнопка
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}