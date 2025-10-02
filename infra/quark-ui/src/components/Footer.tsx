import React from 'react'

export function Footer() {
  return (
    <footer className="bg-muted border-t mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Левая часть - логотип и название */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">Q</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">Quark</h3>
              <p className="text-sm text-muted-foreground">Платформа для творчества и общения</p>
            </div>
          </div>

          {/* Правая часть - контактная информация */}
          <div className="text-center md:text-right">
            <div className="text-sm text-muted-foreground space-y-1">
              <div>© 2025 Quark Platform</div>
              <div>
                <a href="mailto:info@quark.dev" className="hover:text-primary transition-colors">
                  info@quark.dev
                </a>
              </div>
              <div className="flex items-center justify-center md:justify-end space-x-4 mt-2">
                <a href="#" className="hover:text-primary transition-colors">
                  О проекте
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  Конфиденциальность
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  Поддержка
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
