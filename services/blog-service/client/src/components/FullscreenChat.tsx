import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { X, Send, Search, Users, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface FullscreenChatProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastMessage?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  type?: 'text' | 'image' | 'file';
}

export default function FullscreenChat({ isOpen, onClose }: FullscreenChatProps) {
  const { isAuthenticated } = useAuth();
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // todo: remove mock functionality - demo contacts
  const mockContacts: Contact[] = [
    {
      id: 'general',
      name: 'Общий канал',
      avatar: '/assets/general-chat.jpg',
      status: 'online',
      lastMessage: 'Кто-нибудь пробовал новую версию NextJS?',
      unreadCount: 3
    },
    {
      id: '1',
      name: 'Анна Волкова',
      avatar: '/assets/avatar-anna.jpg',
      status: 'online',
      lastMessage: 'Отличная статья про React!',
      unreadCount: 1
    },
    {
      id: '2',
      name: 'Игорь Петров',
      avatar: '/assets/avatar-igor.jpg',
      status: 'away',
      lastMessage: 'Увидимся завтра на встрече'
    },
    {
      id: '3',
      name: 'Команда разработки',
      avatar: '/assets/team-avatar.jpg',
      status: 'online',
      lastMessage: 'Обновили документацию API',
      unreadCount: 5
    }
  ];

  // todo: remove mock functionality - demo messages
  const mockMessages: Message[] = [
    {
      id: '1',
      author: 'Анна Волкова',
      avatar: '/assets/avatar-anna.jpg',
      content: 'Привет! Как дела с новым проектом?',
      timestamp: '14:20',
      isOwn: false
    },
    {
      id: '2',
      author: 'Вы',
      avatar: '/assets/avatar-you.jpg',
      content: 'Привет! Всё идёт по плану, сегодня закончили основной функционал',
      timestamp: '14:22',
      isOwn: true
    },
    {
      id: '3',
      author: 'Анна Волкова',
      avatar: '/assets/avatar-anna.jpg',
      content: 'Отлично! Могу помочь с тестированием, если нужно',
      timestamp: '14:23',
      isOwn: false
    },
    {
      id: '4',
      author: 'Вы',
      avatar: '/assets/avatar-you.jpg',
      content: 'Было бы здорово! Пришлю ссылку на тестовую версию',
      timestamp: '14:25',
      isOwn: true
    }
  ];

  const currentContact = mockContacts.find(c => c.id === selectedContact);
  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    console.log('Message sent:', newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 bg-white !opacity-100 text-gray-900">
        <div className="flex h-full">
          {/* Left sidebar - Contacts/Channels */}
          {isAuthenticated ? (
            <div className="w-80 border-r flex flex-col bg-muted/30">
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Чаты</h2>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      data-testid="button-close-fullscreen-chat"
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск чатов..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-chats"
                  />
                </div>
              </div>

              {/* Contacts list */}
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {filteredContacts.map(contact => (
                    <Card
                      key={contact.id}
                      className={`mb-2 cursor-pointer hover-elevate transition-all duration-200 ${
                        selectedContact === contact.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedContact(contact.id)}
                      data-testid={`contact-${contact.id}`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={contact.avatar} alt={contact.name} />
                              <AvatarFallback>{contact.name[0]}</AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(contact.status)}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium truncate">{contact.name}</h3>
                              {contact.unreadCount && (
                                <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[1.5rem] text-center">
                                  {contact.unreadCount}
                                </span>
                              )}
                            </div>
                            {contact.lastMessage && (
                              <p className="text-sm text-muted-foreground truncate">
                                {contact.lastMessage}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            /* Guest mode - just header with close button */
            <div className="absolute top-4 left-4 z-10">
              <Button
                variant="secondary"
                onClick={onClose}
                data-testid="button-close-fullscreen-chat-guest"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Закрыть
              </Button>
            </div>
          )}

          {/* Right side - Chat area */}
          <div className="flex-1 flex flex-col">
            {isAuthenticated && currentContact ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={currentContact.avatar} alt={currentContact.name} />
                        <AvatarFallback>{currentContact.name[0]}</AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(currentContact.status)}`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{currentContact.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{currentContact.status}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {mockMessages.map(message => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.isOwn ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={message.avatar} alt={message.author} />
                          <AvatarFallback>{message.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className={`flex flex-col ${message.isOwn ? 'items-end' : ''} max-w-[70%]`}>
                          <div className={`px-4 py-2 rounded-lg ${
                            message.isOwn 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <p>{message.content}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{message.author}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Введите сообщение..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      data-testid="input-fullscreen-message"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      data-testid="button-send-fullscreen-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* No chat selected or guest mode */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {isAuthenticated ? 'Выберите чат' : 'Общий канал'}
                    </h3>
                    <p className="text-muted-foreground">
                      {isAuthenticated 
                        ? 'Выберите контакт или канал из списка слева для начала общения'
                        : 'Просматривайте сообщения в общем канале'
                      }
                    </p>
                  </div>
                  {!isAuthenticated && (
                    <div className="space-y-4 p-6 bg-muted/50 rounded-lg max-w-md">
                      <p className="text-sm text-muted-foreground">
                        Демонстрация общего канала для гостей
                      </p>
                      <ScrollArea className="h-40 border rounded p-4 bg-background">
                        <div className="space-y-3">
                          {mockMessages.slice(0, 3).map(message => (
                            <div key={message.id} className="text-sm">
                              <span className="font-medium">{message.author}:</span> {message.content}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}