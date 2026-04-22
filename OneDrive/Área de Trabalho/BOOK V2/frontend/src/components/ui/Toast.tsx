'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps extends Toast {
  onClose: (id: string) => void;
}

function ToastItem({ id, type, title, message, duration = 5000, action, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📱';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'border-green-500 bg-green-900/20';
      case 'error':
        return 'border-red-500 bg-red-900/20';
      case 'warning':
        return 'border-yellow-500 bg-yellow-900/20';
      case 'info':
        return 'border-blue-500 bg-blue-900/20';
      default:
        return 'border-oursbook-medium-gray bg-oursbook-dark-gray';
    }
  };

  return (
    <div
      className={cn(
        'transform transition-all duration-300 ease-out',
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className={cn(
        'max-w-sm w-full bg-oursbook-dark-gray shadow-oursbook rounded-oursbook border-l-4 p-4',
        getColors()
      )}>
        <div className="flex items-start">
          <div className="flex-shrink-0 text-lg mr-3">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">
              {title}
            </p>
            {message && (
              <p className="mt-1 text-sm text-oursbook-light-gray">
                {message}
              </p>
            )}
            
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className="text-sm font-medium text-oursbook-secondary hover:text-oursbook-secondary-dark transition-colors"
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-4 text-oursbook-light-gray hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  const content = (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      <div className="space-y-2 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            {...toast}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    const toastRoot = document.getElementById('modal-root');
    if (toastRoot) {
      return createPortal(content, toastRoot);
    }
  }

  return content;
}

// Toast Hook
let toastId = 0;
const toastListeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

function updateToasts() {
  toastListeners.forEach(listener => listener([...toasts]));
}

export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.push(setCurrentToasts);
    setCurrentToasts([...toasts]);

    return () => {
      const index = toastListeners.indexOf(setCurrentToasts);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, []);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const newToast: Toast = {
      ...toast,
      id: `toast-${++toastId}`
    };
    
    toasts.push(newToast);
    updateToasts();
    
    return newToast.id;
  };

  const removeToast = (id: string) => {
    toasts = toasts.filter(toast => toast.id !== id);
    updateToasts();
  };

  const toast = {
    success: (title: string, message?: string, options?: Partial<Toast>) =>
      addToast({ type: 'success', title, message, ...options }),
    
    error: (title: string, message?: string, options?: Partial<Toast>) =>
      addToast({ type: 'error', title, message, ...options }),
    
    warning: (title: string, message?: string, options?: Partial<Toast>) =>
      addToast({ type: 'warning', title, message, ...options }),
    
    info: (title: string, message?: string, options?: Partial<Toast>) =>
      addToast({ type: 'info', title, message, ...options }),
  };

  return {
    toast,
    toasts: currentToasts,
    removeToast
  };
}

// Toast Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}