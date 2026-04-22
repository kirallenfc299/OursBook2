import React from 'react';
import { Header } from './Header';

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-theme-black">
      <Header />
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
