import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

export async function POST(request) {
  try {
    const requesterId = request.headers.get('x-user-id')
    const { userId, oldPin, newPin } = await request.json()

    if (!userId || !oldPin || !newPin) {
      return NextResponse.json({ pesan: 'Semua field wajib diisi' }, { status: 400 })
    }

    if (requesterId !== userId?.toString()) {
      return NextResponse.json({ pesan: 'Tidak berhak mengubah PIN orang lain' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!user) {
      return NextResponse.json({ pesan: 'User tidak ditemukan' }, { status: 404 })
    }

    const isValid = await bcrypt.compare(oldPin, user.password)
    if (!isValid) {
      return NextResponse.json({ pesan: 'PIN lama salah' }, { status: 400 })
    }

    const hash = await bcrypt.hash(newPin, 10)

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { password: hash },
    })

    await logAudit('CHANGE_PIN', requesterId, 'User mengubah PIN secara mandiri')

    return NextResponse.json({ pesan: 'PIN berhasil diubah' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal mengubah PIN' }, { status: 500 })
  }
}
