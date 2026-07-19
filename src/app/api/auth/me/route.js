import { NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/jwt'

export async function GET(request) {
  try {
    const token = request.cookies.get('session_token')?.value
    if (!token) {
      return NextResponse.json({ pesan: 'Belum login' }, { status: 401 })
    }

    const payload = await verifyJwt(token)
    if (!payload) {
      return NextResponse.json({ pesan: 'Sesi tidak valid' }, { status: 401 })
    }

    return NextResponse.json({ 
      user: {
        id: payload.id,
        nama: payload.nama,
        noRumah: payload.noRumah,
        role: payload.role
      } 
    })
  } catch (error) {
    return NextResponse.json({ pesan: 'Sesi tidak valid' }, { status: 401 })
  }
}
