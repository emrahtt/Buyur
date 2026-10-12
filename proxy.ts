import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse, type NextRequest } from 'next/server'

// Optimistic redirect only. Every protected page and action re-validates the session on the server.
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next()
  const url = new URL('/giris', request.url)
  url.searchParams.set('next', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/panel/:path*', '/veren/:path*', '/admin/:path*'],
}
