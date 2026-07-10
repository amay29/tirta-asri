import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const body = await request.json()
    const { nama, noRumah, pin } = body

    if (!nama || !noRumah || !pin) {
      return NextResponse.json({ pesan: 'Nama, nomor rumah, dan PIN wajib diisi' }, { status: 400 })
    }

    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json({ pesan: 'PIN harus terdiri dari 6 angka' }, { status: 400 })
    }

    const sudahAda = await prisma.user.findFirst({
      where: { noRumah },
    })

    if (sudahAda) {
      return NextResponse.json({ pesan: 'Nomor rumah ini sudah terdaftar. Silakan login.' }, { status: 409 })
    }

    const emailSemu = `${noRumah.toLowerCase().replace(/\s+/g, '')}@warga.tirta-asri.local`
    const passwordHash = await bcrypt.hash(pin, 10)

    const userBaru = await prisma.user.create({
      data: {
        nama,
        noRumah,
        email: emailSemu,
        password: passwordHash,
        role: 'WARGA',
      },
      select: {
        id: true,
        nama: true,
        noRumah: true,
        role: true,
      },
    })

    return NextResponse.json({ pesan: 'Pendaftaran berhasil! Silakan login dengan PIN Anda.', user: userBaru })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ pesan: 'Gagal mendaftarkan akun' }, { status: 500 })
  }
}