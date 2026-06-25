import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// =====================================================================
// /api/surat
// =====================================================================
// Alur: warga mengajukan surat (misal Surat Keterangan Domisili) ->
// status PENDING -> admin ubah jadi DIPROSES selagi dikerjakan -> admin
// ubah jadi SELESAI (dan idealnya upload file PDF hasil suratnya) atau
// DITOLAK kalau memang tidak bisa diproses.
// =====================================================================

// GET /api/surat?userId=3   -> surat milik 1 warga
// GET /api/surat            -> semua pengajuan surat (untuk admin)
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

    return NextResponse.json({ pesan: 'Pengajuan surat terkirim', surat: suratBaru })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal mengajukan surat' }, { status: 500 })
  }
}

// PUT /api/surat
// Admin mengubah status surat. Body: { id, status, filePdf (opsional) }
// status harus salah satu dari: PENDING, DIPROSES, SELESAI, DITOLAK
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, status, filePdf } = body

    const statusValid = ['PENDING', 'DIPROSES', 'SELESAI', 'DITOLAK']
    if (!statusValid.includes(status)) {
      return NextResponse.json({ pesan: 'Status tidak valid' }, { status: 400 })
    }

    const suratUpdate = await prisma.surat.update({
      where: { id: parseInt(id) },
      data: {
        status,
        ...(filePdf ? { filePdf } : {}),
      },
    })

    return NextResponse.json({ success: true, surat: suratUpdate })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal memperbarui status surat' }, { status: 500 })
  }
}