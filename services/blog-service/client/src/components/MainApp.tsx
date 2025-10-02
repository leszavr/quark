import { useState } from 'react';
import Header from './Header';
import BlogFeed from './BlogFeed';
import MessengerSidebar from './MessengerSidebar';
import ThemeModal from './ThemeModal';
import ProfileModal from './ProfileModal';
import FullscreenChat from './FullscreenChat';
import Footer from './Footer';

export default function MainApp() {
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFullscreenChatOpen, setIsFullscreenChatOpen] = useState(false);
  const [messengerState, setMessengerState] = useState<'normal' | 'collapsed' | 'hidden'>('normal');

  const handleMessengerToggle = () => {
    setMessengerState(prev => prev === 'collapsed' ? 'normal' : 'collapsed');
  };

  const handleMessengerClose = () => {
    setMessengerState('hidden');
  };

  const handleMessengerFullscreen = () => {
    setIsFullscreenChatOpen(true);
  };

  const showMessenger = () => {
    setMessengerState('normal');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-200">
      <Header
        onThemeModalOpen={() => setIsThemeModalOpen(true)}
        onProfileModalOpen={() => setIsProfileModalOpen(true)}
      />

      <div className="flex-1 flex">
        {/* Main content area */}
        <main className={`flex-1 transition-all duration-300 ${
          messengerState === 'normal' ? 'pr-84' : ''
        } md:pr-4`}>
          <div className="container max-w-2xl mx-auto px-4 py-6">
            {/* Quick messenger toggle for hidden state */}
            {messengerState === 'hidden' && (
              <div className="fixed bottom-4 right-4 z-30">
                <button
                  onClick={showMessenger}
                  data-testid="button-show-messenger"
                  className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover-elevate transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              </div>
            )}

            <BlogFeed />
          </div>
        </main>
      </div>

      <Footer />

      {/* Messenger Sidebar */}
      {messengerState !== 'hidden' && (
        <MessengerSidebar
          isCollapsed={messengerState === 'collapsed'}
          onToggleCollapse={handleMessengerToggle}
          onFullscreen={handleMessengerFullscreen}
          onClose={handleMessengerClose}
        />
      )}

      {/* Modals */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <FullscreenChat
        isOpen={isFullscreenChatOpen}
        onClose={() => setIsFullscreenChatOpen(false)}
      />
    </div>
  );
}