'use client';

import { useEffect } from 'react';

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Completely disable Next.js scroll restoration
    if (typeof window !== 'undefined') {
      // Override scroll restoration
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }

      // Prevent automatic scrolling on route changes
      const handleRouteChange = () => {
        // Do nothing - prevent automatic scroll
      };

      // Override any existing scroll behavior
      window.addEventListener('beforeunload', handleRouteChange);
      
      return () => {
        window.removeEventListener('beforeunload', handleRouteChange);
      };
    }
  }, []);

  return <>{children}</>;
}