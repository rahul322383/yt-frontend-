
import { NextResponse } from 'next/server'

export function middleware(req) {
  const path = req.nextUrl.pathname
  const isPublicPath = ['/login', '/register', '/home', '/verifyemail'].includes(path)
  const token = req.cookies.get('token')?.value || ''
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/home', req.url))
  }
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return NextResponse.next()
}
export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/home',
    '/verifyemail',
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/playlists/:path*',
    '/analytics/:path*',
    '/history',
    '/liked',
  ],
}
