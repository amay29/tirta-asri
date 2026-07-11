import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signJwt } from '@/lib/jwt'

export async function POST(request) {
  try {
    const { noRumah, pin } = await request.json()

    if (!noRumah || !pin) {
      return NextResponse.json({ pesan: 'Nomor rumah dan PIN wajib diisi' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        noRumah: {
          equals: noRumah,
          mode: 'insensitive'
        }
      }
    })

    if (!user || !(await bcrypt.compare(pin, user.password))) {
      return NextResponse.json({ pesan: 'Nomor rumah atau PIN salah' }, { status: 401 })
    }

    const { password, ...userAman } = user

    const token = await signJwt({ id: user.id, role: user.role })

    const response = NextResponse.json({ pesan: 'Login berhasil', user: userAman })

    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && request.headers.get('x-forwarded-proto') === 'https',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 hari
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ pesan: 'Terjadi kesalahan server' }, { status: 500 })
  }
}