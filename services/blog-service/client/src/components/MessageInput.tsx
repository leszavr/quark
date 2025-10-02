import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Smile, 
  Paperclip, 
  Image, 
  FileText, 
  BarChart3, 
  MapPin, 
  User, 
  Mic, 
  Video,
  X,
  Camera,
  Upload
} from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string, attachments?: any[]) => void;
  placeholder?: string;
  compact?: boolean;
}

const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
  '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '👏',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'
];

export default function MessageInput({ onSendMessage, placeholder = "Введите сообщение...", compact = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<'audio' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;
    onSendMessage(message, attachments);
    setMessage('');
    setAttachments([]);
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  const handleFileAttachment = (type: string) => {
    console.log(`Attach ${type} triggered`);
    // В реальном приложении здесь был бы file picker
    const mockAttachment = {
      id: Date.now(),
      type,
      name: `${type}_file.${type === 'image' ? 'jpg' : type === 'video' ? 'mp4' : 'pdf'}`,
      size: Math.floor(Math.random() * 1000000)
    };
    setAttachments(prev => [...prev, mockAttachment]);
    setShowAttachmentMenu(false);
  };

  const handleSpecialAttachment = (type: 'poll' | 'location' | 'contact') => {
    console.log(`Create ${type} triggered`);
    const mockAttachment = {
      id: Date.now(),
      type,
      title: type === 'poll' ? 'Новый опрос' : type === 'location' ? 'Моя геопозиция' : 'Контакт'
    };
    setAttachments(prev => [...prev, mockAttachment]);
    setShowAttachmentMenu(false);
  };

  const handleRecording = (type: 'audio' | 'video') => {
    if (isRecording) {
      // Остановить запись
      setIsRecording(false);
      setRecordingType(null);
      console.log(`${type} recording stopped`);
      // В реальном приложении здесь была бы обработка записи
      const mockRecording = {
        id: Date.now(),
        type,
        duration: '00:15',
        size: Math.floor(Math.random() * 500000)
      };
      setAttachments(prev => [...prev, mockRecording]);
    } else {
      // Начать запись
      setIsRecording(true);
      setRecordingType(type);
      console.log(`${type} recording started`);
    }
  };

  const removeAttachment = (id: number) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'poll': return <BarChart3 className="h-4 w-4" />;
      case 'location': return <MapPin className="h-4 w-4" />;
      case 'contact': return <User className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      default: return <Paperclip className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-2 relative">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map(attachment => (
            <div key={attachment.id} className="flex items-center gap-2 bg-muted px-2 py-1 rounded-md text-sm">
              {getAttachmentIcon(attachment.type)}
              <span className="truncate max-w-20">
                {attachment.name || attachment.title || `${attachment.type}_recording`}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeAttachment(attachment.id)}
                className="h-4 w-4 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Emoji picker */}
      {showEmojiPicker && (
        <Card className="absolute bottom-full left-0 mb-2 w-full max-w-xs z-50 bg-background border shadow-lg">
          <CardContent className="p-3">
            <div className="grid grid-cols-10 gap-1 max-h-40 overflow-y-auto">
              {EMOJI_LIST.map((emoji, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEmojiSelect(emoji)}
                  className="h-8 w-8 p-0 text-base hover-elevate"
                  data-testid={`emoji-${index}`}
                  type="button"
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attachment menu */}
      {showAttachmentMenu && (
        <Card className="absolute bottom-full left-0 mb-2 w-full max-w-xs z-50 bg-background border shadow-lg">
          <CardContent className="p-2">
            <div className="space-y-1">
              <Button
                variant="ghost"
                onClick={() => handleFileAttachment('image')}
                className="w-full justify-start gap-2 hover-elevate"
                data-testid="attach-image"
                type="button"
              >
                <Image className="h-4 w-4" />
                Фото/Видео
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleFileAttachment('document')}
                className="w-full justify-start gap-2 hover-elevate"
                data-testid="attach-document"
                type="button"
              >
                <FileText className="h-4 w-4" />
                Документ
              </Button>
              <Separator />
              <Button
                variant="ghost"
                onClick={() => handleSpecialAttachment('poll')}
                className="w-full justify-start gap-2 hover-elevate"
                data-testid="attach-poll"
                type="button"
              >
                <BarChart3 className="h-4 w-4" />
                Опрос
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleSpecialAttachment('location')}
                className="w-full justify-start gap-2 hover-elevate"
                data-testid="attach-location"
                type="button"
              >
                <MapPin className="h-4 w-4" />
                Геопозиция
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleSpecialAttachment('contact')}
                className="w-full justify-start gap-2 hover-elevate"
                data-testid="attach-contact"
                type="button"
              >
                <User className="h-4 w-4" />
                Контакт
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message input */}
      {compact ? (
        /* Компактная версия: поле ввода на всю ширину, кнопка отправки в одной строке */
        <div className="space-y-2">
          {/* Основная строка: поле ввода + кнопка отправки */}
          <div className="flex gap-2">
            <Input
              placeholder={placeholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              data-testid="input-message"
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() && attachments.length === 0}
              data-testid="button-send-message"
              size="icon"
              type="button"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Вторая строка: управляющие кнопки в горизонтальном ряду */}
          <div className="flex justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              data-testid="button-emoji"
              className={`h-7 px-2 ${showEmojiPicker ? 'bg-muted' : ''}`}
              type="button"
            >
              <Smile className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              data-testid="button-attachment"
              className={`h-7 px-2 ${showAttachmentMenu ? 'bg-muted' : ''}`}
              type="button"
            >
              <Paperclip className="h-3 w-3" />
            </Button>

            <Button
              variant={isRecording && recordingType === 'audio' ? 'destructive' : 'ghost'}
              size="sm"
              onClick={() => handleRecording('audio')}
              data-testid="button-record-audio"
              className={`h-7 px-2 ${isRecording && recordingType === 'audio' ? 'animate-pulse' : ''}`}
              type="button"
            >
              <Mic className="h-3 w-3" />
            </Button>

            <Button
              variant={isRecording && recordingType === 'video' ? 'destructive' : 'ghost'}
              size="sm"
              onClick={() => handleRecording('video')}
              data-testid="button-record-video"
              className={`h-7 px-2 ${isRecording && recordingType === 'video' ? 'animate-pulse' : ''}`}
              type="button"
            >
              <Camera className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        /* Полная версия: прежняя компоновка */
        <div className="flex gap-2">
          <Textarea
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            data-testid="textarea-message"
            className="flex-1 min-h-[40px] max-h-32 resize-none"
            rows={1}
          />

          <div className="flex items-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              data-testid="button-emoji"
              className={showEmojiPicker ? 'bg-muted' : ''}
              type="button"
            >
              <Smile className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              data-testid="button-attachment"
              className={showAttachmentMenu ? 'bg-muted' : ''}
              type="button"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Button
              variant={isRecording && recordingType === 'audio' ? 'destructive' : 'ghost'}
              size="icon"
              onClick={() => handleRecording('audio')}
              data-testid="button-record-audio"
              className={isRecording && recordingType === 'audio' ? 'animate-pulse' : ''}
              type="button"
            >
              <Mic className="h-4 w-4" />
            </Button>

            <Button
              variant={isRecording && recordingType === 'video' ? 'destructive' : 'ghost'}
              size="icon"
              onClick={() => handleRecording('video')}
              data-testid="button-record-video"
              className={isRecording && recordingType === 'video' ? 'animate-pulse' : ''}
              type="button"
            >
              <Camera className="h-4 w-4" />
            </Button>

            <Button
              onClick={handleSend}
              disabled={!message.trim() && attachments.length === 0}
              data-testid="button-send-message"
              size="icon"
              type="button"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          Запись {recordingType === 'audio' ? 'аудио' : 'видео'}... Нажмите еще раз для остановки
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          // Обработка выбранных файлов
          console.log('Files selected:', e.target.files);
        }}
      />
    </div>
  );
}