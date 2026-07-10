import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPushToUser } from '@/lib/pushNotification'

export async function PUT(request, { params }) {
  try {
    const role = request.headers.get('x-user-role')
    const userId = request.headers.get('x-user-id')

    const pembayaranId = parseInt(params.id)
    if (isNaN(pembayaranId)) return NextResponse.json({ pesan: 'ID tidak valid' }, { status: 400 })

    const body = await request.json()
    const { alasan } = body

    const pembayaran = await prisma.pembayaran.findUnique({
      where: { id: pembayaranId },
      include: { tagihan: { include: { user: true } } }
    })

    if (!pembayaran) {
      return NextResponse.json({ pesan: 'Pembayaran tidak ditemukan' }, { status: 404 })
    }

    const wasSuccess = pembayaran.status === 'SUCCESS'

    if (wasSuccess && !alasan) {
      return NextResponse.json({ pesan: 'Alasan pembatalan wajib diisi untuk pembayaran yang sudah disetujui' }, { status: 400 })
    }

    const hasil = await prisma.$transaction([
      prisma.pembayaran.update({
        where: { id: pembayaranId },
        data: { status: 'FAILED' },
      }),
      prisma.tagihan.update({
        where: { id: pembayaran.tagihanId },
        data: { status: 'BELUM_BAYAR' },
      }),
    ])

    if (userId) {
      try {
        await prisma.auditLog.create({
          data: {
            action: wasSuccess ? 'CANCEL_PEMBAYARAN' : 'REJECT_PEMBAYARAN',
            userId: parseInt(userId),
            details: `${wasSuccess ? 'Membatalkan' : 'Menolak'} pembayaran iuran ${pembayaran.tagihan.bulan} ${pembayaran.tagihan.tahun} dari ${pembayaran.tagihan.user.nama}${alasan ? ` (Alasan: ${alasan})` : ''}`,
          }
        })
      } catch (e) {
        console.error('AuditLog error:', e)
      }
    }

    try {
      await sendPushToUser(prisma, pembayaran.tagihan.userId, {
        title: wasSuccess ? '❌ Pembayaran Dibatalkan' : '❌ Pembayaran Ditolak',
        body: `Pembayaran iuran ${pembayaran.tagihan.bulan} ${pembayaran.tagihan.tahun} Anda ${wasSuccess ? 'dibatalkan' : 'ditolak'}${alasan ? `: ${alasan}` : '. Silakan unggah ulang bukti yang benar.'}`,
        url: '/warga',
      })
    } catch {}

    return NextResponse.json({ success: true, pembayaran: hasil[0] })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal membatalkan pembayaran' }, { status: 500 })
  }
}
