'use client';

import { useRouter } from 'next/navigation';

// Simple wrapper — just use the router directly
export function useCustomNavigation() {
  const router = useRouter();
  return { replace: router.replace.bind(router), push: router.push.bind(router) };
}
