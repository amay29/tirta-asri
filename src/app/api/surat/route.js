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
// Admin mengubah status/isi surat. Atau Warga mengubah jenisSurat/keterangan (jika PENDING).
// Body: { id, status, filePdf, isiSurat, jenisSurat, keterangan }
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, status, filePdf, isiSurat, jenisSurat, keterangan } = body

    const statusValid = ['PENDING', 'DIPROSES', 'SELESAI', 'DITOLAK']
    if (status && !statusValid.includes(status)) {
      return NextResponse.json({ pesan: 'Status tidak valid' }, { status: 400 })
    }

    // Cek surat saat ini
    const currentSurat = await prisma.surat.findUnique({ where: { id: parseInt(id) } })
    if (!currentSurat) return NextResponse.json({ pesan: 'Surat tidak ditemukan' }, { status: 404 })

    // Jika warga mencoba mengedit, pastikan status masih PENDING
    if ((jenisSurat || keterangan !== undefined) && currentSurat.status !== 'PENDING') {
      return NextResponse.json({ pesan: 'Surat yang sudah diproses tidak bisa diedit' }, { status: 403 })
    }

    const suratUpdate = await prisma.surat.update({
      where: { id: parseInt(id) },
      data: {
        ...(status ? { status } : {}),
        ...(filePdf !== undefined ? { filePdf } : {}),
        ...(isiSurat !== undefined ? { isiSurat } : {}),
        ...(jenisSurat ? { jenisSurat } : {}),
        ...(keterangan !== undefined ? { keterangan } : {}),
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

// DELETE /api/surat
// Warga membatalkan/menghapus pengajuan surat yang masih PENDING. Body: { id, userId }
export async function DELETE(request) {
  try {
    const body = await request.json()
    const { id, userId } = body

    if (!id || !userId) {
      return NextResponse.json({ pesan: 'Data tidak lengkap' }, { status: 400 })
    }

    const currentSurat = await prisma.surat.findUnique({ where: { id: parseInt(id) } })
    if (!currentSurat) return NextResponse.json({ pesan: 'Surat tidak ditemukan' }, { status: 404 })

    if (currentSurat.userId !== parseInt(userId)) {
      return NextResponse.json({ pesan: 'Tidak memiliki akses' }, { status: 403 })
    }

    if (currentSurat.status !== 'PENDING') {
      return NextResponse.json({ pesan: 'Hanya surat dengan status Menunggu yang bisa dibatalkan' }, { status: 403 })
    }

    await prisma.surat.delete({ where: { id: parseInt(id) } })

    return NextResponse.json({ pesan: 'Pengajuan surat dibatalkan' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal membatalkan surat' }, { status: 500 })
  }
}