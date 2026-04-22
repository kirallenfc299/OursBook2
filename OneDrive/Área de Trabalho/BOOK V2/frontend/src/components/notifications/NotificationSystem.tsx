'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';

interface NotificationSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatTime(ts: Date) {
  const diff = Date.now() - ts.getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  return `${d}d`;
}

export function NotificationSystem({ isOpen, onClose }: NotificationSystemProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4">
      <div className="fixed inset-0 bg-black/25" onClick={onClose} />

      <div
        ref={panelRef}
        className="relative w-96 max-w-[calc(100vw-2rem)] bg-theme-dark-gray border border-theme-medium-gray rounded-oursbook shadow-2xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-theme-medium-gray">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Notificações</h3>
            <button onClick={onClose} className="text-theme-light-gray hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex space-x-1 bg-theme-black rounded p-1">
            {(['all', 'unread'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'flex-1 px-3 py-1 text-sm rounded transition-colors',
                  filter === f
                    ? 'bg-theme-primary text-white'
                    : 'text-theme-light-gray hover:text-white'
                )}
              >
                {f === 'all' ? `Todas (${notifications.length})` : `Não lidas (${unreadCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-b border-theme-medium-gray flex gap-3">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-theme-primary hover:underline">
                Marcar todas como lidas
              </button>
            )}
            <button onClick={clearAll} className="text-xs text-theme-light-gray hover:text-white">
              Limpar todas
            </button>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">🔔</div>
              <p className="text-theme-light-gray text-sm">
                {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-theme-medium-gray">
              {filtered.map(n => (
                <div
                  key={n.id}
                  className={cn(
                    'p-4 hover:bg-theme-medium-gray/50 transition-colors cursor-pointer group flex items-start gap-3',
                    !n.read && 'bg-theme-medium-gray/20'
                  )}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-theme-black flex items-center justify-center text-lg flex-shrink-0">
                    {n.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium truncate', n.read ? 'text-theme-light-gray' : 'text-white')}>
                          {n.title}
                        </p>
                        <p className="text-xs text-theme-light-gray mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className="text-xs text-theme-light-gray">{formatTime(n.timestamp)}</span>
                        {!n.read && <div className="w-2 h-2 bg-theme-primary rounded-full" />}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); removeNotification(n.id); }}
                    className="opacity-0 group-hover:opacity-100 text-theme-light-gray hover:text-white transition-all p-1 flex-shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
