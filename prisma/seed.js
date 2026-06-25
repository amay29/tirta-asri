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
  const passwordAdmin = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      nama: 'Pengurus RT',
      email: 'admin@tirta-asri.local',
      password: passwordAdmin,
      noRumah: 'ADMIN',
      role: 'ADMIN',
    },
  })

  console.log('Membuat akun warga dummy...')
  const dataWarga = [
    { nama: 'Budi Santoso',  noRumah: 'B17', noHp: '081111111111' },
    { nama: 'Siti Rahma',    noRumah: 'A05', noHp: '081222222222' },
    { nama: 'Irma Noviana',  noRumah: 'C12', noHp: '081333333333' },
    { nama: 'Agus Setiawan', noRumah: 'B02', noHp: '081444444444' },
    { nama: 'Hendra Wijaya', noRumah: 'D08', noHp: '081555555555' },
  ]

  const wargaTerbuat = []
  for (const w of dataWarga) {
    const passwordHash = await bcrypt.hash(w.noHp, 10)
    const emailSemu = `${w.noRumah.toLowerCase()}@warga.tirta-asri.local`
    const user = await prisma.user.create({
      data: {
        nama: w.nama,
        noRumah: w.noRumah,
        email: emailSemu,
        password: passwordHash,
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
      isi: 'Iuran bulan Juli 2026 sebesar Rp 150.000 sudah bisa dibayarkan melalui portal ini. Mohon segera dilunasi sebelum tanggal 15 Juli 2026.',
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
  console.log('Selesai! Akun untuk dicoba:')
  console.log('  ADMIN  -> Nomor Rumah: ADMIN   | No HP: admin123')
  console.log('  WARGA  -> Nomor Rumah: B17     | No HP: 081111111111 (Budi)')
  console.log('  WARGA  -> Nomor Rumah: D08     | No HP: 081555555555 (Hendra)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })