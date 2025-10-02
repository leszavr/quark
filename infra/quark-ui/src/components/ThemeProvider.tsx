import React from 'react'

interface ThemeProviderProps {
  children: React.ReactNode
  theme: string
}

export function ThemeProvider({ children, theme }: ThemeProviderProps) {
  React.useEffect(() => {
    // Применяем CSS класс темы к body
    document.body.className = theme !== 'default' ? `theme-${theme}` : ''
  }, [theme])

  return <>{children}</>
}
