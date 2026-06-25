import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const warga = await prisma.user.findMany({
      where: { role: 'WARGA' },
      select: {
        id: true,
        nama: true,
        noRumah: true,
        createdAt: true,
        tagihan: {
          include: { pembayaran: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { noRumah: 'asc' },
    })
    return NextResponse.json({ warga })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal mengambil data warga' }, { status: 500 })
  }
}
