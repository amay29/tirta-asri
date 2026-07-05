import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

export async function GET(request) {
  try {
    const adminRole = request.headers.get('x-user-role')
    const adminId = request.headers.get('x-user-id')

    if (adminRole !== 'ADMIN_RT') {
      return NextResponse.json({ pesan: 'Akses ditolak' }, { status: 403 })
    }

    // Ambil semua tabel utama
    const users = await prisma.user.findMany()
    const tagihan = await prisma.tagihan.findMany()
    const pembayaran = await prisma.pembayaran.findMany()
    const pengeluaran = await prisma.pengeluaran.findMany()
    const pengumuman = await prisma.pengumuman.findMany()
    const auditLogs = await prisma.auditLog.findMany()

    const backupData = {
      timestamp: new Date().toISOString(),
      data: { users, tagihan, pembayaran, pengeluaran, pengumuman, auditLogs }
    }

    await logAudit('BACKUP_DATABASE', adminId, 'Melakukan backup seluruh database')

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="backup_tirta_asri_${new Date().toISOString().split('T')[0]}.json"`,
        'Content-Type': 'application/json',
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal melakukan backup' }, { status: 500 })
  }
}
