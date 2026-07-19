import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import bcrypt from 'bcryptjs'

export async function GET(request) {
  try {
    const userRole = request.headers.get('x-user-role')
    if (userRole !== 'ADMIN_RT' && userRole !== 'ADMIN_IURAN') {
      return NextResponse.json({ pesan: 'Forbidden' }, { status: 403 })
    }

    const warga = await prisma.user.findMany({
      where: {
        role: { in: ['WARGA', 'ADMIN_RT', 'ADMIN_IURAN'] }
      },
      select: {
        id: true,
        nama: true,
        noRumah: true,
        role: true,
        createdAt: true,
        tagihan: {
          include: { pembayaran: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { noRumah: 'asc' },
    })
    return NextResponse.json({ warga })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal mengambil data warga' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const adminRole = request.headers.get('x-user-role')
    const adminId = request.headers.get('x-user-id')
    if (adminRole !== 'ADMIN_RT') return NextResponse.json({ pesan: 'Forbidden' }, { status: 403 })

    const { nama, noRumah, pin } = await request.json()
    if (!nama || !noRumah || !pin) return NextResponse.json({ pesan: 'Data tidak lengkap' }, { status: 400 })

    const passwordHash = await bcrypt.hash(pin, 10)

    const userBaru = await prisma.user.create({
      data: { nama, noRumah, password: passwordHash, role: 'WARGA' },
    })
    
    await logAudit('CREATE_WARGA', adminId, `Menambah warga baru: ${nama} (${noRumah})`)
    return NextResponse.json({ pesan: 'Warga berhasil ditambahkan', user: userBaru })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal menambah warga' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const adminRole = request.headers.get('x-user-role')
    const adminId = request.headers.get('x-user-id')
    if (adminRole !== 'ADMIN_RT') return NextResponse.json({ pesan: 'Forbidden' }, { status: 403 })

    const { id, nama, noRumah } = await request.json()
    if (!id || !nama || !noRumah) return NextResponse.json({ pesan: 'Data tidak lengkap' }, { status: 400 })

    const userUpdate = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { nama, noRumah },
    })
    
    await logAudit('UPDATE_WARGA', adminId, `Mengubah data warga ID ${id}: ${nama} (${noRumah})`)
    return NextResponse.json({ pesan: 'Data warga berhasil diubah', user: userUpdate })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal mengubah warga' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const adminRole = request.headers.get('x-user-role')
    const adminId = request.headers.get('x-user-id')
    if (adminRole !== 'ADMIN_RT') return NextResponse.json({ pesan: 'Forbidden' }, { status: 403 })

    const { id } = await request.json()
    if (!id) return NextResponse.json({ pesan: 'ID wajib diisi' }, { status: 400 })

    if (process.env.NEXT_PUBLIC_IS_DEMO === 'true') {
      return NextResponse.json({ pesan: 'Fitur hapus warga dinonaktifkan pada versi Demo (Portfolio).' }, { status: 403 })
    }

    await prisma.user.delete({ where: { id: parseInt(id) } })
    
    await logAudit('DELETE_WARGA', adminId, `Menghapus warga ID ${id}`)
    return NextResponse.json({ pesan: 'Warga berhasil dihapus' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal menghapus warga' }, { status: 500 })
  }
}
