import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/surat/[id] — ambil satu surat dengan data user
export async function GET(request, { params }) {
  try {
    const { id } = await params

    const surat = await prisma.surat.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { nama: true, noRumah: true } },
      },
    })

    if (!surat) {
      return NextResponse.json({ pesan: 'Surat tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ surat })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal mengambil data surat' }, { status: 500 })
  }
}
