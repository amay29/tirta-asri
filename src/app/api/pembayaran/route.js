import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const body = await request.json()
    const { tagihanId, metodeBayar } = body

    if (!tagihanId || !metodeBayar) {
      return NextResponse.json({ pesan: 'Data tidak lengkap' }, { status: 400 })
    }

    const tagihan = await prisma.tagihan.findUnique({
      where: { id: parseInt(tagihanId) },
      include: { pembayaran: true },
    })

    if (!tagihan) {
      return NextResponse.json({ pesan: 'Tagihan tidak ditemukan' }, { status: 404 })
    }
    if (tagihan.pembayaran) {
      return NextResponse.json({ pesan: 'Tagihan ini sudah memiliki pengajuan pembayaran' }, { status: 400 })
    }

    const pembayaranBaru = await prisma.pembayaran.create({
      data: {
        tagihanId: tagihan.id,
        jumlah: tagihan.jumlah,
        metodeBayar,
        status: 'PENDING',
        // midtransId sengaja dikosongkan (null) — field ini disiapkan
        // untuk integrasi Midtrans sungguhan nanti. Untuk sekarang,
        // alur pembayaran masih simulasi manual yang dikonfirmasi admin.
      },
    })

    return NextResponse.json({ pesan: 'Pengajuan pembayaran tercatat, menunggu konfirmasi RT', pembayaran: pembayaranBaru })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal memproses pembayaran' }, { status: 500 })
  }
}

// PUT /api/pembayaran
// Dipakai ADMIN untuk approve pembayaran (PENDING -> SUCCESS) sekaligus
// mengubah status Tagihan terkait jadi SUDAH_BAYAR.
// Body: { pembayaranId }
export async function PUT(request) {
  try {
    const body = await request.json()
    const { pembayaranId } = body

    const pembayaran = await prisma.pembayaran.findUnique({
      where: { id: parseInt(pembayaranId) },
    })

    if (!pembayaran) {
      return NextResponse.json({ pesan: 'Pembayaran tidak ditemukan' }, { status: 404 })
    }
    if (pembayaran.status === 'SUCCESS') {
      return NextResponse.json({ pesan: 'Pembayaran ini sudah disetujui sebelumnya' }, { status: 400 })
    }

    // Dua perubahan (status Pembayaran + status Tagihan) dibungkus dalam
    // satu transaction Prisma. Ini menjamin keduanya berhasil bersamaan,
    // atau gagal bersamaan — tidak mungkin ada keadaan "Pembayaran sudah
    // SUCCESS tapi Tagihan masih BELUM_BAYAR" akibat error di tengah jalan.
    const hasil = await prisma.$transaction([
      prisma.pembayaran.update({
        where: { id: pembayaran.id },
        data: { status: 'SUCCESS' },
      }),
      prisma.tagihan.update({
        where: { id: pembayaran.tagihanId },
        data: { status: 'SUDAH_BAYAR' },
      }),
    ])

    return NextResponse.json({ success: true, pembayaran: hasil[0] })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal menyetujui pembayaran' }, { status: 500 })
  }
}