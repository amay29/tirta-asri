import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const tagihan = await prisma.tagihan.findMany({
      where: userId ? { userId: parseInt(userId) } : undefined,
      include: {
        user: { select: { nama: true, noRumah: true } },
        pembayaran: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ tagihan })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal mengambil data tagihan' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, bulan, tahun, jumlah } = body

    if (!userId || !bulan || !tahun || !jumlah) {
      return NextResponse.json({ pesan: 'Data tidak lengkap' }, { status: 400 })
    }

    // Cek apakah tagihan bulan+tahun sudah ada untuk user ini
    const sudahAda = await prisma.tagihan.findFirst({
      where: {
        userId: parseInt(userId),
        bulan,
        tahun: parseInt(tahun),
      },
    })

    if (sudahAda) {
      return NextResponse.json(
        { pesan: `Tagihan ${bulan} ${tahun} untuk warga ini sudah ada` },
        { status: 409 }
      )
    }

    const tagihanBaru = await prisma.tagihan.create({
      data: {
        userId: parseInt(userId),
        bulan,
        tahun: parseInt(tahun),
        jumlah: parseInt(jumlah),
        status: 'BELUM_BAYAR',
      },
    })

    return NextResponse.json({ pesan: 'Tagihan dibuat', tagihan: tagihanBaru })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal membuat tagihan' }, { status: 500 })
  }
}