import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPushToUser, sendPushToRole } from '@/lib/pushNotification'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const surat = await prisma.surat.findMany({
      where: userId ? { userId: parseInt(userId) } : undefined,
      include: {
        user: { select: { nama: true, noRumah: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ surat })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal mengambil data surat' }, { status: 500 })
  }
}

// POST /api/surat
// Warga mengajukan surat baru. Body: { userId, jenisSurat, keterangan }
export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, jenisSurat, keterangan } = body

    if (!userId || !jenisSurat) {
      return NextResponse.json({ pesan: 'Jenis surat wajib diisi' }, { status: 400 })
    }

    const suratBaru = await prisma.surat.create({
      data: {
        userId: parseInt(userId),
        jenisSurat,
        keterangan: keterangan || null,
        status: 'PENDING',
      },
    })

    // Kirim notifikasi push ke ADMIN_RT
    try {
      const user = await prisma.user.findUnique({ where: { id: parseInt(userId) }, select: { nama: true } })
      await sendPushToRole(prisma, 'ADMIN_RT', {
        title: '📄 Pengajuan Surat Baru',
        body: `${user?.nama || 'Warga'} mengajukan ${jenisSurat}`,
        url: '/admin/surat',
      })
    } catch {}

    return NextResponse.json({ pesan: 'Pengajuan surat terkirim', surat: suratBaru })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal mengajukan surat' }, { status: 500 })
  }
}

// PUT /api/surat
// Admin mengubah status/isi surat. Body: { id, status, filePdf (opsional), isiSurat (opsional) }
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, status, filePdf, isiSurat } = body

    const statusValid = ['PENDING', 'DIPROSES', 'SELESAI', 'DITOLAK']
    if (status && !statusValid.includes(status)) {
      return NextResponse.json({ pesan: 'Status tidak valid' }, { status: 400 })
    }

    const suratUpdate = await prisma.surat.update({
      where: { id: parseInt(id) },
      data: {
        ...(status ? { status } : {}),
        ...(filePdf !== undefined ? { filePdf } : {}),
        ...(isiSurat !== undefined ? { isiSurat } : {}),
      },
    })

    // Notifikasi ke warga jika status berubah
    if (status) {
      try {
        const suratData = await prisma.surat.findUnique({ where: { id: parseInt(id) }, select: { userId: true, jenisSurat: true } })
        const statusLabel = { DIPROSES: 'sedang diproses', SELESAI: 'sudah selesai', DITOLAK: 'ditolak' }
        if (suratData && statusLabel[status]) {
          await sendPushToUser(prisma, suratData.userId, {
            title: '📄 Update Surat',
            body: `${suratData.jenisSurat} Anda ${statusLabel[status]}`,
            url: '/warga/surat',
          })
        }
      } catch {}
    }

    return NextResponse.json({ success: true, surat: suratUpdate })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal memperbarui data surat' }, { status: 500 })
  }
}