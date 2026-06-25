import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// =====================================================================
// POST /api/auth/register
// =====================================================================
// Dipakai untuk mendaftarkan warga baru. Role SELALU 'WARGA' di sini —
// tidak ada cara untuk membuat akun admin lewat endpoint publik ini.
// Akun admin sengaja hanya bisa dibuat langsung di database (lihat
// prisma/seed.js), supaya tidak ada celah orang luar bisa daftar jadi
// admin sendiri.
//
// Body yang diharapkan:
// { nama, noRumah, noHp, email (opsional) }
// Password warga = noHp yang mereka masukkan saat daftar (di-hash bcrypt
// sebelum disimpan, jadi walau database bocor, nomor HP asli tidak
// langsung terbaca).
// =====================================================================
export async function POST(request) {
  try {
    const body = await request.json()
    const { nama, noRumah, noHp } = body

    if (!nama || !noRumah || !noHp) {
      return NextResponse.json({ pesan: 'Nama, nomor rumah, dan nomor HP wajib diisi' }, { status: 400 })
    }

    // noRumah dipakai sebagai "username" login, jadi harus unik.
    // Email juga wajib unik di skema (@unique), tapi karena warga
    // belum tentu punya/mau kasih email, kita buat email "semu" dari
    // noRumah supaya field @unique di skema tetap terpenuhi tanpa
    // merepotkan warga untuk mengisi email asli.
    const emailSemu = `${noRumah.toLowerCase().replace(/\s+/g, '')}@warga.tirta-asri.local`

    const sudahAda = await prisma.user.findFirst({
      where: { noRumah },
    })

    if (sudahAda) {
      return NextResponse.json({ pesan: 'Nomor rumah ini sudah terdaftar. Silakan login.' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(noHp, 10)

    const userBaru = await prisma.user.create({
      data: {
        nama,
        noRumah,
        email: emailSemu,
        password: passwordHash,
        role: 'WARGA',
      },
      select: {
        // Jangan pernah kembalikan password (walau sudah di-hash)
        id: true,
        nama: true,
        noRumah: true,
        role: true,
      },
    })

    return NextResponse.json({ pesan: 'Pendaftaran berhasil', user: userBaru })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal mendaftarkan akun' }, { status: 500 })
  }
}