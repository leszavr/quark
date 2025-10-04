import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

type AuthMode = 'login' | 'register';

interface AuthModalProps {
  children: React.ReactNode;
  defaultMode?: AuthMode;
}

export default function AuthModal({ children, defaultMode = 'login' }: AuthModalProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>(defaultMode);

  const handleClose = () => {
    setOpen(false);
  };

  const switchToLogin = () => {
    setMode('login');
  };

  const switchToRegister = () => {
    setMode('register');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-white !opacity-100 border shadow-lg">
        {mode === 'login' ? (
          <LoginForm 
            onSwitchToRegister={switchToRegister}
            onClose={handleClose}
          />
        ) : (
          <RegisterForm 
            onSwitchToLogin={switchToLogin}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}