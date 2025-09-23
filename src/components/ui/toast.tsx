// components/ui/Toast.tsx

'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// No changes needed here - purely for logic
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss after duration (default 5 seconds)
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// No changes needed here - purely for logic
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// No changes needed here - purely for layout
function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

// --- ALL THEME CHANGES ARE IN THIS COMPONENT ---
function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300); // Wait for animation to finish
  };

  // THEME: Replaced hardcoded icon colors with semantic theme colors.
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        // Using 'primary' for success for theme consistency.
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'info':
        return <Info className="w-5 h-5 text-accent-foreground" />;
    }
  };

  // THEME: Replaced hardcoded background/border/text colors with theme-aware classes
  // that use opacity modifiers for a modern, consistent look.
  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-primary/10 border-primary/20 text-primary';
      case 'error':
        return 'bg-destructive/10 border-destructive/20 text-destructive';
      case 'info':
        return 'bg-accent border-accent/20 text-accent-foreground';
    }
  };

  return (
    <div
      className={cn(
        // THEME: The base styles are now simpler. The colored styles are applied by getStyles().
        'min-w-80 max-w-md p-4 rounded-lg border bg-background shadow-lg transition-all duration-300 transform',
        getStyles(),
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          {/* The text color is inherited from the parent, which is now theme-aware */}
          <h4 className="font-semibold text-sm">{toast.title}</h4>
          {toast.message && (
            <p className="text-sm mt-1 opacity-90">{toast.message}</p>
          )}
        </div>
        <button
          onClick={handleRemove}
          // THEME: Replaced 'hover:bg-black hover:bg-opacity-10' with 'hover:bg-accent'
          // for a close button that works in both light and dark modes.
          className="flex-shrink-0 p-1 hover:bg-accent rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}