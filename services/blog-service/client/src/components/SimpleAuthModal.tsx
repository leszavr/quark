import { useState } from 'react';
import { SimpleModal } from '@/components/ui/simple-modal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

type AuthMode = 'login' | 'register';

interface SimpleAuthModalProps {
  children: React.ReactNode;
  defaultMode?: AuthMode;
}

export default function SimpleAuthModal({ children, defaultMode = 'login' }: SimpleAuthModalProps) {
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
    <>
      <div onClick={() => setOpen(true)} style={{ cursor: 'pointer' }}>
        {children}
      </div>
      
      <SimpleModal isOpen={open} onClose={handleClose} className="p-0">
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
      </SimpleModal>
    </>
  );
}