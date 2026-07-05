import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { nama: true, role: true } }
      }
    })
    return NextResponse.json({ logs })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal mengambil histori aktivitas' }, { status: 500 })
  }
}
