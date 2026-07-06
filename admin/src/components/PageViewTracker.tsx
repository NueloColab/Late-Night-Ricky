'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin pages
    if (pathname.startsWith('/admin')) return;

    // Debounce: only track after a short delay to avoid double-fires
    const timer = setTimeout(() => {
      fetch('/api/public/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pathname }),
      }).catch(() => {
        // Silent fail - don't break anything
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}