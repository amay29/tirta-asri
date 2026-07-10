import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPushToUser } from '@/lib/pushNotification'

export async function GET() {
  try {
    const now = new Date()
    const d3 = new Date(now)
    d3.setDate(d3.getDate() + 3)
    d3.setHours(23, 59, 59, 999)

    const d1 = new Date(now)
    d1.setDate(d1.getDate() + 1)
    d1.setHours(23, 59, 59, 999)

    const tagihanDeadline = await prisma.tagihan.findMany({
      where: {
        deadline: { lte: d3, gte: now },
        status: 'BELUM_BAYAR',
        pembayaran: null,
      },
      include: {
        user: { select: { id: true, nama: true } },
      },
    })

    let totalNotif = 0

    for (const t of tagihanDeadline) {
      const deadlineDate = new Date(t.deadline)
      const diffMs = deadlineDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

      let urgency = ''
      if (diffDays <= 1) {
        urgency = '⚠️ BESOK terakhir!'
      } else if (diffDays <= 3) {
        urgency = `⏰ ${diffDays} hari lagi`
      }

      if (urgency) {
        const sent = await sendPushToUser(prisma, t.userId, {
          title: `Deadline Iuran ${urgency}`,
          body: `Iuran ${t.bulan} ${t.tahun} (Rp ${t.jumlah.toLocaleString('id-ID')}) harus dibayar sebelum ${deadlineDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}`,
          url: '/warga',
        })
        totalNotif += sent
      }
    }

    return NextResponse.json({
      pesan: `Notifikasi deadline terkirim: ${totalNotif}`,
      tagihanDicek: tagihanDeadline.length,
    })
  } catch (error) {
    console.error('Check deadline error:', error)
    return NextResponse.json({ pesan: 'Gagal cek deadline' }, { status: 500 })
  }
}
