'use client';

import { useEffect } from 'react';

export function ScrollManager() {
  useEffect(() => {
    // Disable history scroll restoration — this is the only thing needed
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  return null;
}
