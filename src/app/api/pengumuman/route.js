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
    const { judul, isi, penting, pembuatRole, pembuatNama, foto } = body

    if (!judul || !isi) {
      return NextResponse.json({ pesan: 'Judul dan isi wajib diisi' }, { status: 400 })
    }

    const pengumumanBaru = await prisma.pengumuman.create({
      data: {
        judul,
        isi,
        foto: foto || null,
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
    const role = request.headers.get('x-user-role')
    const userId = request.headers.get('x-user-id')

    const body = await request.json()
    const { id } = body

    const current = await prisma.pengumuman.findUnique({ where: { id: parseInt(id) } })
    if (!current) {
      return NextResponse.json({ pesan: 'Pengumuman tidak ditemukan' }, { status: 404 })
    }

    if (role === 'ADMIN_IURAN') {
      const u = await prisma.user.findUnique({ where: { id: parseInt(userId) } })
      if (current.pembuatRole !== 'ADMIN_IURAN' || current.pembuatNama !== u?.nama) {
        return NextResponse.json({ pesan: 'Hanya bisa menghapus pengumuman Anda sendiri' }, { status: 403 })
      }
    }

    await prisma.pengumuman.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal menghapus pengumuman' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const role = request.headers.get('x-user-role')
    const userId = request.headers.get('x-user-id')

    const body = await request.json()
    const { id, judul, isi, penting, foto } = body

    if (!id || !judul || !isi) {
      return NextResponse.json({ pesan: 'Data tidak lengkap' }, { status: 400 })
    }

    const current = await prisma.pengumuman.findUnique({ where: { id: parseInt(id) } })
    if (!current) {
      return NextResponse.json({ pesan: 'Pengumuman tidak ditemukan' }, { status: 404 })
    }

    if (role === 'ADMIN_IURAN') {
      const u = await prisma.user.findUnique({ where: { id: parseInt(userId) } })
      if (current.pembuatRole !== 'ADMIN_IURAN' || current.pembuatNama !== u?.nama) {
        return NextResponse.json({ pesan: 'Hanya bisa mengedit pengumuman Anda sendiri' }, { status: 403 })
      }
    }

    const updated = await prisma.pengumuman.update({
      where: { id: parseInt(id) },
      data: { 
        judul, 
        isi, 
        penting: penting || false,
        ...(foto !== undefined ? { foto } : {})
      },
    })

    return NextResponse.json({ pesan: 'Pengumuman diperbarui', pengumuman: updated })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal memperbarui pengumuman' }, { status: 500 })
  }
}
