import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const body = await request.json()
    const { nama, noRumah, noHp } = body

    if (!nama || !noRumah || !noHp) {
      return NextResponse.json({ pesan: 'Nama, nomor rumah, dan nomor HP wajib diisi' }, { status: 400 })
    }

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