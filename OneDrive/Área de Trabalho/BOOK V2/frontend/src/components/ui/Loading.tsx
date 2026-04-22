import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'skeleton';
  className?: string;
  text?: string;
}

export function Loading({ 
  size = 'md', 
  variant = 'spinner', 
  className,
  text 
}: LoadingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  if (variant === 'spinner') {
    return (
      <div className={cn('flex flex-col items-center justify-center', className)}>
        <div className={cn(
          'animate-spin rounded-full border-2 border-oursbook-medium-gray border-t-oursbook-primary',
          sizes[size]
        )} />
        {text && (
          <p className="mt-2 text-oursbook-light-gray text-sm">{text}</p>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex flex-col items-center justify-center', className)}>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-oursbook-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-oursbook-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-oursbook-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        {text && (
          <p className="mt-2 text-oursbook-light-gray text-sm">{text}</p>
        )}
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-4 w-5/6" />
      </div>
    );
  }

  return null;
}

// Skeleton components for specific use cases
export function BookCardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton aspect-[2/3] w-full rounded-oursbook" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  );
}

export function CarouselSkeleton() {
  return (
    <div className="carousel-spacing">
      <div className="skeleton h-8 w-48 mb-4" />
      <div className="flex space-x-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[250px]">
            <BookCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}