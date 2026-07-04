import webpush from 'web-push'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(
    'mailto:admin@tirta-asri.local',
    VAPID_PUBLIC,
    VAPID_PRIVATE
  )
}

export async function sendPushToUser(prisma, userId, payload) {
  try {
    const subs = await prisma.pushSubscription.findMany({
      where: { userId: parseInt(userId) },
    })

    const results = await Promise.allSettled(
      subs.map(sub =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        ).catch(async (err) => {
          // Subscription expired/invalid — hapus dari database
          if (err.statusCode === 404 || err.statusCode === 410) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
          }
          throw err
        })
      )
    )

    return results.filter(r => r.status === 'fulfilled').length
  } catch (err) {
    console.error('sendPushToUser error:', err)
    return 0
  }
}

export async function sendPushToRole(prisma, role, payload) {
  try {
    const users = await prisma.user.findMany({
      where: { role },
      select: { id: true },
    })

    let totalSent = 0
    for (const user of users) {
      totalSent += await sendPushToUser(prisma, user.id, payload)
    }
    return totalSent
  } catch (err) {
    console.error('sendPushToRole error:', err)
    return 0
  }
}
