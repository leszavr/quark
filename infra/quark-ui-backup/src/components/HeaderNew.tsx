import React, { useState } from 'react'
import { Button } from './ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Palette, User, Settings, LogOut } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  avatar: string
}

interface HeaderProps {
  user: User | null
  onLogin: () => void
  onLogout: () => void
  onThemeChange: (theme: string) => void
  currentTheme: string
}

const colorSchemes = [
  { name: 'default', label: 'Классический', color: '#030213' },
  { name: 'blue', label: 'Синий (Twitter)', color: '#1DA1F2' },
  { name: 'purple', label: 'Фиолетовый (Discord)', color: '#7C3AED' },
  { name: 'green', label: 'Зеленый (WhatsApp)', color: '#25D366' },
  { name: 'orange', label: 'Оранжевый (Reddit)', color: '#FF4500' },
  { name: 'indigo', label: 'Индиго (Telegram)', color: '#0088CC' }
]

export function Header({ user, onLogin, onLogout, onThemeChange, currentTheme }: HeaderProps) {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <header className="header sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Логотип и название */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-lg">
              Q
            </div>
            <span className="text-xl font-bold">Quark</span>
          </div>

          {/* Действия в шапке */}
          <div className="flex items-center gap-4">
            {/* Переключатель тем */}
            <DropdownMenu open={isThemeMenuOpen} onOpenChange={setIsThemeMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Palette className="w-4 h-4" />
                  Тема
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {colorSchemes.map((scheme) => (
                  <DropdownMenuItem
                    key={scheme.name}
                    onClick={() => {
                      onThemeChange(scheme.name)
                      setIsThemeMenuOpen(false)
                    }}
                    className="flex items-center gap-3"
                  >
                    <div 
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: scheme.color }}
                    />
                    <span>{scheme.label}</span>
                    {currentTheme === scheme.name && (
                      <span className="ml-auto text-xs text-muted-foreground">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Кнопки авторизации или профиль */}
            {!user ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={onLogin}>
                  Вход
                </Button>
                <Button onClick={onLogin}>
                  Регистрация
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline font-medium">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Профиль
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Настройки
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Выход
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
