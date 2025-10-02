import Header from '../Header';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';

export default function HeaderExample() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Header 
            onThemeModalOpen={() => console.log('Theme modal open triggered')}
            onProfileModalOpen={() => console.log('Profile modal open triggered')}
          />
          <div className="p-4">
            <p className="text-muted-foreground">Кликните "Вход/Регистрация" чтобы переключиться в режим авторизованного пользователя</p>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}