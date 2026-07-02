require('dotenv').config();

const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const pg = require('pg')
const bcrypt = require('bcryptjs')

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Menghapus data lama (jika ada)...')
  await prisma.pengumuman.deleteMany()
  await prisma.pembayaran.deleteMany()
  await prisma.surat.deleteMany()
  await prisma.tagihan.deleteMany()
  await prisma.user.deleteMany()

  console.log('Membuat akun admin...')
  const pinAdmin = await bcrypt.hash('112233', 10)
  const admin = await prisma.user.create({
    data: {
      nama: 'Pengurus RT',
      email: 'admin@tirta-asri.local',
      password: pinAdmin,
      noRumah: 'ADMIN',
      role: 'ADMIN',
    },
  })

  console.log('Membuat akun warga dummy...')
  const dataWarga = [
    { nama: 'Budi Santoso',  noRumah: 'B17' },
    { nama: 'Siti Rahma',    noRumah: 'A05' },
    { nama: 'Irma Noviana',  noRumah: 'C12' },
    { nama: 'Agus Setiawan', noRumah: 'B02' },
    { nama: 'Hendra Wijaya', noRumah: 'D08' },
  ]

  // Semua warga pakai PIN 123456 untuk kemudahan demo
  const pinWarga = await bcrypt.hash('123456', 10)

  const wargaTerbuat = []
  for (const w of dataWarga) {
    const emailSemu = `${w.noRumah.toLowerCase()}@warga.tirta-asri.local`
    const user = await prisma.user.create({
      data: {
        nama: w.nama,
        noRumah: w.noRumah,
        email: emailSemu,
        password: pinWarga,
        role: 'WARGA',
      },
    })
    wargaTerbuat.push(user)
  }

  console.log('Membuat tagihan dummy...')
  await prisma.tagihan.create({
    data: { userId: wargaTerbuat[0].id, bulan: 'Juni', tahun: 2026, jumlah: 50000, status: 'BELUM_BAYAR' },
  })

  const tagihanSiti = await prisma.tagihan.create({
    data: { userId: wargaTerbuat[1].id, bulan: 'Juni', tahun: 2026, jumlah: 50000, status: 'SUDAH_BAYAR' },
  })
  await prisma.pembayaran.create({
    data: { tagihanId: tagihanSiti.id, jumlah: 50000, metodeBayar: 'Tunai', status: 'SUCCESS' },
  })

  const tagihanIrma = await prisma.tagihan.create({
    data: { userId: wargaTerbuat[2].id, bulan: 'Juni', tahun: 2026, jumlah: 50000, status: 'SUDAH_BAYAR' },
  })
  await prisma.pembayaran.create({
    data: { tagihanId: tagihanIrma.id, jumlah: 50000, metodeBayar: 'QRIS Gateway', status: 'SUCCESS' },
  })

  const tagihanAgus = await prisma.tagihan.create({
    data: { userId: wargaTerbuat[3].id, bulan: 'Mei', tahun: 2026, jumlah: 50000, status: 'SUDAH_BAYAR' },
  })
  await prisma.pembayaran.create({
    data: { tagihanId: tagihanAgus.id, jumlah: 50000, metodeBayar: 'Tunai', status: 'SUCCESS' },
  })

  const tagihanHendra = await prisma.tagihan.create({
    data: { userId: wargaTerbuat[4].id, bulan: 'Juni', tahun: 2026, jumlah: 50000, status: 'BELUM_BAYAR' },
  })
  await prisma.pembayaran.create({
    data: { tagihanId: tagihanHendra.id, jumlah: 50000, metodeBayar: 'Tunai', status: 'PENDING' },
  })

  console.log('Membuat contoh pengajuan surat...')
  await prisma.surat.create({
    data: {
      userId: wargaTerbuat[0].id,
      jenisSurat: 'Surat Keterangan Domisili',
      keterangan: 'Untuk keperluan administrasi bank',
      status: 'PENDING',
    },
  })

  console.log('Membuat pengumuman dummy...')
  await prisma.pengumuman.create({
    data: {
      judul: 'Jadwal Kerja Bakti Bulan Juli',
      isi: 'Diberitahukan kepada seluruh warga Tirta Asri, akan diadakan kerja bakti bersama pada hari Minggu, 6 Juli 2026 mulai pukul 07.00 WIB. Dimohon kehadiran dan partisipasi seluruh warga.',
      penting: true,
    },
  })
  await prisma.pengumuman.create({
    data: {
      judul: 'Iuran Bulanan Juli 2026',
      isi: 'Iuran bulan Juli 2026 sebesar Rp 50.000 sudah bisa dibayarkan melalui portal ini. Mohon segera dilunasi sebelum tanggal 15 Juli 2026.',
      penting: false,
    },
  })
  await prisma.pengumuman.create({
    data: {
      judul: 'Perbaikan Saluran Air Blok C',
      isi: 'Informasi untuk warga Blok C, akan dilakukan perbaikan saluran air pada tanggal 28-29 Juni 2026. Mohon maaf atas ketidaknyamanan.',
      penting: false,
    },
  })

  console.log('')
  console.log('════════════════════════════════════════════')
  console.log('  Selesai! Akun untuk dicoba:')
  console.log('────────────────────────────────────────────')
  console.log('  ADMIN  → No Rumah: ADMIN   | PIN: 112233')
  console.log('  WARGA  → No Rumah: B17     | PIN: 123456 (Budi)')
  console.log('  WARGA  → No Rumah: D08     | PIN: 123456 (Hendra)')
  console.log('  (Semua warga pakai PIN: 123456)')
  console.log('════════════════════════════════════════════')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })