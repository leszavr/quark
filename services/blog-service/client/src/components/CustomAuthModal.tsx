import { useState } from 'react';
import { CustomModal } from '@/components/ui/simple-modal';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

type AuthMode = 'login' | 'register';

interface CustomAuthModalProps {
  children: React.ReactNode;
  defaultMode?: AuthMode;
}

export default function CustomAuthModal({ children, defaultMode = 'login' }: CustomAuthModalProps) {
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
      <div onClick={() => setOpen(true)} style={{ cursor: 'pointer', display: 'inline-block' }}>
        {children}
      </div>
      
      <CustomModal isOpen={open} onClose={handleClose} maxWidth="max-w-md">
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
      </CustomModal>
    </>
  );
}