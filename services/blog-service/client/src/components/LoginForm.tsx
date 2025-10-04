import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onClose: () => void;
}

export default function LoginForm({ onSwitchToRegister, onClose }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Заменить на реальный API вызов
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Ошибка входа');
      }

      const data = await response.json();
      console.log('Login response:', data);

      // TODO: Обработать реальный ответ от API
      // Пока используем демо данные
      login({
        id: data.user?.id || '1',
        username: data.user?.username || email.split('@')[0],
        email: email,
        firstName: data.user?.firstName || 'Пользователь',
        lastName: data.user?.lastName || '',
        avatar: data.user?.avatar || '/assets/default-avatar.png'
      });

      toast({
        title: "Успешный вход",
        description: "Добро пожаловать!",
      });

      onClose();
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Ошибка входа",
        description: error instanceof Error ? error.message : 'Проверьте ваши данные',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', color: 'black' }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: 'black', marginBottom: '8px' }}>Вход</h2>
        <p style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
          Введите ваши данные для входа
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Входим...
              </>
            ) : (
              'Войти'
            )}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Нет аккаунта? </span>
          <Button 
            variant="ghost" 
            className="p-0 h-auto font-normal text-primary" 
            onClick={onSwitchToRegister}
            disabled={isLoading}
          >
            Зарегистрироваться
          </Button>
        </div>
    </div>
  );
}