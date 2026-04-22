'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'message' | 'friend_activity' | 'system' | 'achievement';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock notifications data - Only welcome notification
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'system',
    title: 'Bem-vindo ao OursBook!',
    content: 'Obrigado por se juntar à nossa comunidade de leitores. Explore milhares de livros e comece sua jornada literária.',
    isRead: false,
    createdAt: new Date(),
    actionUrl: '/'
  }
];

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'friend_activity':
        return '👥';
      case 'system':
        return '📢';
      case 'message':
        return '💬';
      default:
        return '📱';
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m atrás`;
    } else if (hours < 24) {
      return `${hours}h atrás`;
    } else {
      return `${days}d atrás`;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notificações"
      size="md"
      className="max-h-[80vh]"
    >
      <div className="space-y-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Não lidas ({unreadCount})
            </Button>
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-4 rounded-netflix border transition-colors cursor-pointer',
                  notification.isRead
                    ? 'bg-netflix-medium-gray border-netflix-medium-gray'
                    : 'bg-netflix-dark-gray border-netflix-red'
                )}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead(notification.id);
                  }
                  if (notification.actionUrl) {
                    // TODO: Navigate to action URL
                    console.log('Navigate to:', notification.actionUrl);
                  }
                }}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className={cn(
                        'font-semibold text-sm',
                        notification.isRead ? 'text-netflix-light-gray' : 'text-white'
                      )}>
                        {notification.title}
                      </h4>
                      
                      {/* Unread indicator */}
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-netflix-red rounded-full flex-shrink-0 ml-2 mt-1" />
                      )}
                    </div>
                    
                    <p className="text-netflix-light-gray text-sm mt-1 line-clamp-2">
                      {notification.content}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-netflix-light-gray">
                        {getTimeAgo(notification.createdAt)}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-netflix-light-gray hover:text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-netflix-light-gray">
              <div className="text-4xl mb-4">🔔</div>
              <p className="text-lg mb-2">
                {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
              </p>
              <p className="text-sm">
                {filter === 'unread' 
                  ? 'Todas as suas notificações foram lidas'
                  : 'Você receberá notificações sobre atividades e atualizações aqui'
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-netflix-medium-gray pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => {
              // TODO: Navigate to notification settings
              console.log('Open notification settings');
            }}
          >
            Configurações de Notificação
          </Button>
        </div>
      </div>
    </Modal>
  );
}