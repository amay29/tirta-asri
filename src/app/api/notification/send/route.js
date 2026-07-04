import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPushToUser, sendPushToRole } from '@/lib/pushNotification'

export async function POST(request) {
  try {
    const body = await request.json()
    const { targetUserId, targetRole, title, body: msgBody, url } = body

    const payload = {
      title: title || 'Tirta Asri Residence',
      body: msgBody || 'Ada pemberitahuan baru',
      url: url || '/warga',
    }

    let sent = 0

    if (targetUserId) {
      sent = await sendPushToUser(prisma, targetUserId, payload)
    } else if (targetRole) {
      sent = await sendPushToRole(prisma, targetRole, payload)
    } else {
      return NextResponse.json({ pesan: 'Target tidak ditemukan' }, { status: 400 })
    }

    return NextResponse.json({ pesan: `Notifikasi terkirim ke ${sent} perangkat` })
  } catch (error) {
    console.error('Send notification error:', error)
    return NextResponse.json({ pesan: 'Gagal mengirim notifikasi' }, { status: 500 })
  }
}
