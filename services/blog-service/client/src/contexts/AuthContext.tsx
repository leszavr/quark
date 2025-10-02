import { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // todo: remove mock functionality - demo mode toggle
  const demoUser: User = {
    id: '1',
    username: 'alexey_user',
    email: 'alexey@example.com',
    firstName: 'Алексей',
    lastName: 'Иванов',
    middleName: 'Сергеевич',
    phone: '+7 (999) 123-45-67',
    avatar: '/src/assets/avatars/male-developer.png'
  };

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  // demo toggle function
  const toggleDemoMode = () => {
    if (user) {
      logout();
    } else {
      login(demoUser);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        login, 
        logout, 
        updateProfile,
        toggleDemoMode // todo: remove mock functionality
      } as any}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}