import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import * as XLSX from 'xlsx'

export async function GET(request) {
  try {
    const adminRole = request.headers.get('x-user-role')
    const adminId = request.headers.get('x-user-id')

    if (adminRole !== 'ADMIN_RT') {
      return NextResponse.json({ pesan: 'Akses ditolak' }, { status: 403 })
    }

    const users = await prisma.user.findMany()
    const tagihan = await prisma.tagihan.findMany({
      include: { user: true, pembayaran: true }
    })
    const pembayaran = await prisma.pembayaran.findMany()
    const pengeluaran = await prisma.pengeluaran.findMany()

    const dataWarga = users.map(u => ({
      'ID': u.id,
      'Nama': u.nama,
      'No Rumah': u.noRumah,
      'Nomor HP': u.noHp,
      'Role': u.role,
      'Terdaftar Pada': new Date(u.createdAt).toLocaleString('id-ID')
    }))

    const dataIuran = tagihan.map(t => ({
      'Bulan': t.bulan,
      'Tahun': t.tahun,
      'Jumlah': t.jumlah,
      'Status': t.pembayaran?.status === 'SUCCESS' ? 'LUNAS' : (t.pembayaran ? 'MENUNGGU' : 'BELUM BAYAR'),
      'Warga': t.user?.nama,
      'No Rumah': t.user?.noRumah,
      'Metode Bayar': t.pembayaran?.metodeBayar || '-'
    }))

    const dataPengeluaran = pengeluaran.map(p => ({
      'Tanggal': new Date(p.createdAt).toLocaleString('id-ID'),
      'Keperluan': p.keperluan,
      'Nomor/Sumber': p.sumber,
      'Nominal (Rp)': p.nominal
    }))

    const wb = XLSX.utils.book_new()

    const wsWarga = XLSX.utils.json_to_sheet(dataWarga)
    XLSX.utils.book_append_sheet(wb, wsWarga, "Data Warga")

    const wsIuran = XLSX.utils.json_to_sheet(dataIuran)
    XLSX.utils.book_append_sheet(wb, wsIuran, "Riwayat Iuran")

    const wsPengeluaran = XLSX.utils.json_to_sheet(dataPengeluaran)
    XLSX.utils.book_append_sheet(wb, wsPengeluaran, "Pengeluaran")

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    await logAudit('BACKUP_DATABASE', adminId, 'Melakukan backup database ke format Excel')

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="Backup_Data_Tirta_Asri_${new Date().toISOString().split('T')[0]}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal melakukan backup' }, { status: 500 })
  }
}
