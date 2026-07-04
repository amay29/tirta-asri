import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPushToRole } from '@/lib/pushNotification'

export async function GET() {
  try {
    const pengumuman = await prisma.pengumuman.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ pengumuman })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal mengambil pengumuman' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { judul, isi, penting, pembuatRole, pembuatNama } = body

    if (!judul || !isi) {
      return NextResponse.json({ pesan: 'Judul dan isi wajib diisi' }, { status: 400 })
    }

    const pengumumanBaru = await prisma.pengumuman.create({
      data: {
        judul,
        isi,
        penting: penting || false,
        pembuatRole: pembuatRole || null,
        pembuatNama: pembuatNama || null,
      },
    })

    // Kirim notifikasi push ke semua WARGA
    try {
      await sendPushToRole(prisma, 'WARGA', {
        title: penting ? '📢 Pengumuman Penting!' : '📣 Pengumuman Baru',
        body: judul,
        url: '/warga',
      })
    } catch {}

    return NextResponse.json({ pesan: 'Pengumuman dibuat', pengumuman: pengumumanBaru })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal membuat pengumuman' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json()
    const { id } = body
    await prisma.pengumuman.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal menghapus pengumuman' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, judul, isi, penting } = body

    if (!id || !judul || !isi) {
      return NextResponse.json({ pesan: 'Data tidak lengkap' }, { status: 400 })
    }

    const updated = await prisma.pengumuman.update({
      where: { id: parseInt(id) },
      data: { judul, isi, penting: penting || false },
    })

    return NextResponse.json({ pesan: 'Pengumuman diperbarui', pengumuman: updated })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal memperbarui pengumuman' }, { status: 500 })
  }
}
