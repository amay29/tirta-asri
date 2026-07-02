import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// POST /api/auth/reset-pin — Admin reset PIN warga ke default 123456
export async function POST(request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ pesan: 'userId wajib diisi' }, { status: 400 })
    }

    const pinDefault = '123456'
    const hash = await bcrypt.hash(pinDefault, 10)

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { password: hash },
    })

    return NextResponse.json({ pesan: `PIN berhasil direset ke ${pinDefault}` })
  } catch (error) {
    console.error(error)
    if (error.code === 'P2025') {
      return NextResponse.json({ pesan: 'User tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ pesan: 'Gagal mereset PIN' }, { status: 500 })
  }
}
