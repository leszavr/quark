// Simple toast hook - can be replaced with sonner or react-hot-toast later
import { useState, useCallback } from "react";

interface ToastOptions {
  title: string;
  description?: string;
  status?: "success" | "error" | "warning" | "info";
  duration?: number;
  isClosable?: boolean;
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<ToastOptions & { id: number }>>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = Date.now();
    const newToast = { ...options, id };
    
    setToasts((prev) => [...prev, newToast]);
    
    // Auto-remove after duration
    const shouldAutoRemove = options.duration !== Infinity;
    if (shouldAutoRemove) {
      const duration = options.duration || 5000;
      setTimeout(() => removeToast(id), duration);
    }
    
    // Simple console log for now
    console.log(`[Toast ${options.status}]`, options.title, options.description);
  }, [removeToast]);

  return { toast, toasts };
}
