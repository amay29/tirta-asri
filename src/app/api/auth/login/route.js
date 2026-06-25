import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { noRumah, noHp } = await request.json()

    if (!noRumah || !noHp) {
      return NextResponse.json({ pesan: 'Nomor rumah dan nomor HP wajib diisi' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({ where: { noRumah } })

    if (!user || !(await bcrypt.compare(noHp, user.password))) {
      return NextResponse.json({ pesan: 'Nomor rumah atau password salah' }, { status: 401 })
    }

    const { password, ...userAman } = user

    return NextResponse.json({ pesan: 'Login berhasil', user: userAman })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ pesan: 'Terjadi kesalahan server' }, { status: 500 })
  }
}