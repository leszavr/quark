import React, { useState } from 'react'
import { Button } from "./ui/button"
import { User, LogOut, Settings, Menu } from "lucide-react"

interface HeaderProps {
  user: any
  onLogin: () => void
  onLogout: () => void
  onThemeChange: (theme: string) => void
  currentTheme: string
}

export function Header({ user, onLogin, onLogout, onThemeChange, currentTheme }: HeaderProps) {
  const themes = [
    { id: 'default', name: 'Классический', class: '' },
    { id: 'twitter', name: 'Twitter', class: 'theme-twitter' },
    { id: 'discord', name: 'Discord', class: 'theme-discord' },
    { id: 'whatsapp', name: 'WhatsApp', class: 'theme-whatsapp' },
    { id: 'reddit', name: 'Reddit', class: 'theme-reddit' },
    { id: 'telegram', name: 'Telegram', class: 'theme-telegram' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Логотип и название */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">Q</span>
            </div>
            <h1 className="text-xl font-bold">Quark</h1>
          </div>
        </div>

        {/* Правая часть */}
        <div className="flex items-center space-x-4">
          {/* Переключатель тем */}
          <select 
            value={currentTheme}
            onChange={(e) => onThemeChange(e.target.value)}
            className="px-3 py-2 rounded-md border bg-background text-sm"
          >
            {themes.map(theme => (
              <option key={theme.id} value={theme.id}>{theme.name}</option>
            ))}
          </select>

          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.firstName} {user.lastName}
              </span>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Профиль
              </Button>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={onLogin}>
              Вход / Регистрация
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
