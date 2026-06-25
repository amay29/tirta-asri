import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const dataRaw = await prisma.pengeluaran.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ riwayatPengeluaran: dataRaw })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal mengambil data pengeluaran' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { keperluan, nominal, sumber } = body

    if (!keperluan || !nominal || !sumber) {
      return NextResponse.json({ pesan: 'Data tidak lengkap' }, { status: 400 })
    }

    const pengeluaranBaru = await prisma.pengeluaran.create({
      data: { keperluan, nominal: parseInt(nominal), sumber },
    })

    return NextResponse.json({ pesan: 'Pengeluaran tercatat', pengeluaran: pengeluaranBaru })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal mencatat pengeluaran' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json()
    const { id } = body

    await prisma.pengeluaran.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    if (error.code === 'P2025') {
      return NextResponse.json({ pesan: 'Pengeluaran tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json({ pesan: 'Gagal membatalkan pengeluaran' }, { status: 500 })
  }
}
