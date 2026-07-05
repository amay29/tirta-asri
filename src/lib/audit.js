import { prisma } from '@/lib/prisma'

export async function logAudit(action, userId, details) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId: userId ? parseInt(userId) : null,
        details: typeof details === 'string' ? details : JSON.stringify(details),
      },
    })
  } catch (error) {
    console.error('Failed to write audit log:', error)
  }
}
