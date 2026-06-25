import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// =====================================================================
// /api/tagihan — menggantikan /api/iuran versi lama (yang pakai model
// Transaksi buatan saya sendiri). Sekarang pakai skema yang sudah ada:
// Tagihan (per bulan, per warga) yang terhubung ke User, dan opsional
// punya satu Pembayaran terkait.
// =====================================================================

// GET /api/tagihan?userId=3          -> tagihan milik 1 warga (untuk dashboard warga)
// GET /api/tagihan                   -> semua tagihan semua warga (untuk dashboard admin)
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

// POST /api/tagihan
// Dipakai ADMIN untuk membuat tagihan baru ke seorang warga (misal generate
// tagihan bulanan). Body: { userId, bulan, tahun, jumlah }
export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, bulan, tahun, jumlah } = body

    if (!userId || !bulan || !tahun || !jumlah) {
      return NextResponse.json({ pesan: 'Data tidak lengkap' }, { status: 400 })
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