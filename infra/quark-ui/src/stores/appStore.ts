import { create } from 'zustand';

export type ViewMode = 'blog-only' | 'chat-only' | 'both' | 'home';

interface WindowState {
  isOpen: boolean;
  isMinimized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

interface AppState {
  // Режим отображения окон
  viewMode: ViewMode;
  
  // Состояние окон
  blogWindow: WindowState;
  chatWindow: WindowState;
  
  // UI настройки
  sidebarCollapsed: boolean;
  isAuthenticated: boolean;
  
  // ИИ настройки
  aiTemperature: number;
  aiEnabled: boolean;
  
  // Уведомления
  unreadChats: number;
  
  // Пропорции разделения окон (процент ширины левой панели)
  splitRatio: number;
  
  // Действия для режимов просмотра
  setViewMode: (mode: ViewMode) => void;
  
  // Действия для пропорций разделения
  setSplitRatio: (ratio: number) => void;
  
  // Действия для окон
  setBlogWindow: (state: Partial<WindowState>) => void;
  setChatWindow: (state: Partial<WindowState>) => void;
  toggleWindow: (window: 'blog' | 'chat') => void;
  minimizeWindow: (window: 'blog' | 'chat') => void;
  
  // UI действия
  toggleSidebar: () => void;
  setAuthenticated: (auth: boolean) => void;
  
  // ИИ действия
  setAiTemperature: (temperature: number) => void;
  toggleAi: () => void;
  
  // Уведомления
  setUnreadChats: (count: number) => void;
  
  // Сброс состояния
  reset: () => void;
}

const initialState = {
  viewMode: 'home' as ViewMode,
  
  blogWindow: {
    isOpen: true,
    isMinimized: false,
    position: { x: 100, y: 100 },
    size: { width: 800, height: 600 },
    zIndex: 1,
  },
  
  chatWindow: {
    isOpen: true,
    isMinimized: false,
    position: { x: 200, y: 200 },
    size: { width: 400, height: 500 },
    zIndex: 2,
  },
  
  sidebarCollapsed: false,
  isAuthenticated: false,
  aiTemperature: 0.7,
  aiEnabled: true,
  unreadChats: 0,
  splitRatio: 70, // 70% для блога, 30% для чата
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  
  // Действия для режимов просмотра
  setViewMode: (viewMode) => set({ viewMode }),
  
  // Действия для пропорций разделения
  setSplitRatio: (splitRatio) => set({ splitRatio }),
  
  // Действия для окон
  setBlogWindow: (state) =>
    set((prev) => ({
      blogWindow: { ...prev.blogWindow, ...state },
    })),
    
  setChatWindow: (state) =>
    set((prev) => ({
      chatWindow: { ...prev.chatWindow, ...state },
    })),
    
  toggleWindow: (window) =>
    set((state) => {
      if (window === 'blog') {
        return { blogWindow: { ...state.blogWindow, isOpen: !state.blogWindow.isOpen } };
      } else {
        return { chatWindow: { ...state.chatWindow, isOpen: !state.chatWindow.isOpen } };
      }
    }),
    
  minimizeWindow: (window) =>
    set((state) => {
      if (window === 'blog') {
        return { blogWindow: { ...state.blogWindow, isMinimized: !state.blogWindow.isMinimized } };
      } else {
        return { chatWindow: { ...state.chatWindow, isMinimized: !state.chatWindow.isMinimized } };
      }
    }),
    
  // UI действия
  toggleSidebar: () =>
    set((state) => ({
      sidebarCollapsed: !state.sidebarCollapsed,
    })),
    
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    
  // ИИ действия
  setAiTemperature: (aiTemperature) => set({ aiTemperature }),
  
  toggleAi: () =>
    set((state) => ({
      aiEnabled: !state.aiEnabled,
    })),
    
  // Уведомления
  setUnreadChats: (unreadChats) => set({ unreadChats }),
    
  // Сброс состояния
  reset: () => set(initialState),
}));
