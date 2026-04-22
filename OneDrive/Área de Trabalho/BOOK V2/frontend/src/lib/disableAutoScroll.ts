'use client';

// Disable auto-scroll behavior completely
export function disableAutoScroll() {
  if (typeof window !== 'undefined') {
    // Override scroll behavior
    const originalScrollTo = window.scrollTo;
    const originalScrollBy = window.scrollBy;
    
    // Disable automatic scrolling
    window.scrollTo = function(x?: number | ScrollToOptions, y?: number) {
      // Only allow manual scrolling, not automatic
      if (typeof x === 'object' && x?.behavior === 'smooth') {
        return;
      }
      return originalScrollTo.call(this, x as number, y as number);
    };
    
    window.scrollBy = function(x?: number | ScrollToOptions, y?: number) {
      // Only allow manual scrolling, not automatic
      if (typeof x === 'object' && x?.behavior === 'smooth') {
        return;
      }
      return originalScrollBy.call(this, x as number, y as number);
    };

    // Set scroll behavior to auto on all elements
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
    
    // Add class to prevent auto-scroll
    document.documentElement.classList.add('no-scroll-behavior');
    document.body.classList.add('no-scroll-behavior');
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  disableAutoScroll();
}