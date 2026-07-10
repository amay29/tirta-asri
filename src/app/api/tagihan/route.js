import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPushToUser } from '@/lib/pushNotification'

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
    const { userId, bulan, tahun, jumlah, deadline } = body

    if (!userId || !bulan || !tahun || !jumlah) {
      return NextResponse.json({ pesan: 'Data tidak lengkap' }, { status: 400 })
    }

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
        deadline: deadline ? new Date(deadline) : null,
        status: 'BELUM_BAYAR',
      },
    })

    try {
      const user = await prisma.user.findUnique({ where: { id: parseInt(userId) }, select: { nama: true } })
      const deadlineStr = deadline ? ` (deadline: ${new Date(deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })})` : ''
      await sendPushToUser(prisma, parseInt(userId), {
        title: '💰 Tagihan Iuran Baru',
        body: `Iuran ${bulan} ${tahun} sebesar Rp ${parseInt(jumlah).toLocaleString('id-ID')}${deadlineStr}`,
        url: '/warga',
      })
    } catch {}

    return NextResponse.json({ pesan: 'Tagihan dibuat', tagihan: tagihanBaru })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal membuat tagihan' }, { status: 500 })
  }
}