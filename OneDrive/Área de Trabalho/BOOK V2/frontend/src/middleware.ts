import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Simplified middleware - just pass through
  return NextResponse.next();
}

export const config = {
  // Only match specific routes that need middleware
  matcher: [
    '/profile/:path*',
    '/settings/:path*',
    '/admin/:path*',
  ],
};