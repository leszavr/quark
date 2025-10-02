import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Send, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import MessageInput from './MessageInput';
import { useChannelChat } from '@/hooks/use-channel-chat';

// Удалено: используем типы из хука useChannelChat

interface MessengerSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onFullscreen: () => void;
  onClose: () => void;
}

export default function MessengerSidebar({ 
  isCollapsed, 
  onToggleCollapse, 
  onFullscreen, 
  onClose 
}: MessengerSidebarProps) {
  const { isAuthenticated, user } = useAuth();
  
  // Используем общий канал для мессенджера
  const { messages, isLoading, sendMessage, isSending } = useChannelChat({
    channelId: 'general',
    enableWebSocket: false
  });


  if (isCollapsed) {
    return (
      <div className="fixed right-4 bottom-4 z-40">
        <Button
          variant="default"
          size="icon"
          onClick={onToggleCollapse}
          data-testid="button-expand-messenger"
          className="h-12 w-12 rounded-full shadow-lg"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed right-4 top-20 bottom-4 w-80 z-40 flex flex-col shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">
          {isAuthenticated ? 'Сообщения' : 'Общий чат'}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onFullscreen}
            data-testid="button-fullscreen-messenger"
            className="h-8 w-8"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            data-testid="button-collapse-messenger"
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="button-close-messenger"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 p-4 pt-2">
        {/* Messages */}
        <ScrollArea className="flex-1 mb-4">
          <div className="space-y-3">
{isLoading ? (
              <div className="text-center py-4">
                <span className="text-sm text-muted-foreground">Загрузка сообщений...</span>
              </div>
            ) : (
              messages.map(message => {
                const isOwn = user && message.authorId === user.id;
                const authorName = message.author ? 
                  `${message.author.firstName || ''} ${message.author.lastName || ''}`.trim() || message.author.username 
                  : 'Неизвестный пользователь';
                const timestamp = new Date(message.createdAt).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.author?.avatar || undefined} alt={authorName} />
                      <AvatarFallback>{authorName[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col ${isOwn ? 'items-end' : ''}`}>
                      <div className={`px-3 py-2 rounded-lg max-w-[200px] ${
                        isOwn 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{authorName}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Message input */}
        {isAuthenticated && user ? (
          <MessageInput
            onSendMessage={(content, attachments) => {
              if (content || (attachments && attachments.length > 0)) {
                sendMessage(
                  content || `${attachments?.length} прикрепленных файлов`,
                  user.id,
                  attachments?.map(a => a.name) || undefined
                );
              }
            }}
            placeholder="Введите сообщение..."
            compact={true}
          />
        ) : (
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Войдите, чтобы отправлять сообщения
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}