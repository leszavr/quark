import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Send, MinusCircle, PlusCircle, X } from "lucide-react"

interface Message {
  id: string
  text: string
  author: string
  timestamp: string
  isOwn: boolean
}

interface MessengerProps {
  messages: Message[]
  onSendMessage: (text: string) => void
  isLoggedIn: boolean
  isVisible: boolean
  onToggleVisibility: () => void
}

export function Messenger({ messages, onSendMessage, isLoggedIn, isVisible, onToggleVisibility }: MessengerProps) {
  const [newMessage, setNewMessage] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)

  const handleSendMessage = () => {
    if (newMessage.trim() && isLoggedIn) {
      onSendMessage(newMessage.trim())
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isVisible) {
    return (
      <Button
        onClick={onToggleVisibility}
        className="fixed bottom-4 right-4 z-50"
        size="lg"
      >
        <PlusCircle className="h-5 w-5 mr-2" />
        Чат
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 z-50">
      <Card className="h-full flex flex-col shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Общий чат</CardTitle>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleVisibility}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Область сообщений */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-64">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-2 rounded-lg text-sm ${
                      message.isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {!message.isOwn && (
                      <div className="font-semibold text-xs mb-1">{message.author}</div>
                    )}
                    <div>{message.text}</div>
                    <div className="text-xs opacity-70 mt-1">{message.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Поле ввода */}
            <div className="p-4 border-t">
              {isLoggedIn ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Введите сообщение..."
                    className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  Войдите, чтобы отправлять сообщения
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
