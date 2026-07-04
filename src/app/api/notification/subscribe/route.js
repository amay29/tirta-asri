import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const body = await request.json()
    const { userId, subscription } = body

    if (!userId || !subscription?.endpoint || !subscription?.keys) {
      return NextResponse.json({ pesan: 'Data tidak lengkap' }, { status: 400 })
    }

    // Upsert — update jika endpoint sudah ada, buat baru jika belum
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        userId: parseInt(userId),
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      create: {
        userId: parseInt(userId),
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    })

    return NextResponse.json({ pesan: 'Subscription berhasil disimpan' })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ pesan: 'Gagal menyimpan subscription' }, { status: 500 })
  }
}
