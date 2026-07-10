import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

export async function POST(request) {
  try {
    const adminId = request.headers.get('x-user-id')
    const adminRole = request.headers.get('x-user-role')

    if (adminRole !== 'ADMIN_RT') {
      return NextResponse.json({ pesan: 'Hanya Ketua RT yang bisa mereset PIN' }, { status: 403 })
    }

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

    await logAudit('RESET_PIN', adminId, `Merest PIN untuk user ID ${userId}`)

    return NextResponse.json({ pesan: `PIN berhasil direset ke ${pinDefault}` })
  } catch (error) {
    console.error(error)
    if (error.code === 'P2025') {
      return NextResponse.json({ pesan: 'User tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ pesan: 'Gagal mereset PIN' }, { status: 500 })
  }
}
