import { verifyJwt } from '@/lib/jwt'

export async function getAuthUser(request) {
  const token = request.cookies.get('session_token')?.value
  if (!token) return null

  try {
    const payload = await verifyJwt(token)
    if (!payload) return null
    return payload // { id, role, nama, noRumah }
  } catch (err) {
    return null
  }
}
