import { useState } from 'react';
import MessengerSidebar from '../MessengerSidebar';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';

export default function MessengerSidebarExample() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background p-4">
          <div className="text-center mb-4">
            <p className="text-muted-foreground">
              Попробуйте сворачивать, разворачивать и отправлять сообщения в чат
            </p>
          </div>
          
          <MessengerSidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            onFullscreen={() => console.log('Fullscreen triggered')}
            onClose={() => console.log('Close triggered')}
          />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}