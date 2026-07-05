import { NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/jwt'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Rute API yang tidak perlu diproteksi
  if (
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/register') ||
    pathname.startsWith('/api/upload')
  ) {
    return NextResponse.next()
  }

  // Rute yang perlu diproteksi
  const isApiRoute = pathname.startsWith('/api/')
  const isAdminRoute = pathname.startsWith('/admin')
  const isWargaRoute = pathname.startsWith('/warga')

  if (isApiRoute || isAdminRoute || isWargaRoute) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      if (isApiRoute) {
        return NextResponse.json({ pesan: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const payload = await verifyJwt(token)

    if (!payload) {
      if (isApiRoute) {
        return NextResponse.json({ pesan: 'Invalid token' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Role check untuk rute admin
    if (isAdminRoute && !['ADMIN_RT', 'ADMIN_IURAN'].includes(payload.role)) {
      return NextResponse.redirect(new URL('/warga', request.url))
    }

    // Teruskan informasi user ke headers untuk bisa dibaca di route handlers API
    if (isApiRoute) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', payload.id.toString())
      requestHeaders.set('x-user-role', payload.role)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*', '/warga/:path*'],
}
