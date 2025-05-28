import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow all API routes for mock authentication
  // In production, this would be replaced with proper auth middleware
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*']
} 