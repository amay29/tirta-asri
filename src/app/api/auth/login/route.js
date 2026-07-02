import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { noRumah, pin } = await request.json()

    if (!noRumah || !pin) {
      return NextResponse.json({ pesan: 'Nomor rumah dan PIN wajib diisi' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({ where: { noRumah } })

    if (!user || !(await bcrypt.compare(pin, user.password))) {
      return NextResponse.json({ pesan: 'Nomor rumah atau PIN salah' }, { status: 401 })
    }

    // Jangan kirim password hash ke client
    const { password, ...userAman } = user

    return NextResponse.json({ pesan: 'Login berhasil', user: userAman })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ pesan: 'Terjadi kesalahan server' }, { status: 500 })
  }
}