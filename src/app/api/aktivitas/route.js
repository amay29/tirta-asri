import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const userRole = request.headers.get('x-user-role')
    if (userRole !== 'ADMIN_RT') {
      return NextResponse.json({ pesan: 'Forbidden' }, { status: 403 })
    }

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
