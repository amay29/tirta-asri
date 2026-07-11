import { SignJWT, jwtVerify } from 'jose'

const secretKey = process.env.JWT_SECRET
if (!secretKey) throw new Error('JWT_SECRET environment variable is not set')
const encodedKey = new TextEncoder().encode(secretKey)


export async function signJwt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function verifyJwt(token) {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      clockTolerance: 300 // Toleransi waktu 5 menit untuk mengatasi perbedaan jam antar perangkat
    })
    return payload
  } catch (error) {
    return null
  }
}
