import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ pesan: 'Logout berhasil' })
  response.cookies.set('session_token', '', { maxAge: 0, path: '/' })
  response.cookies.set('token', '', { maxAge: 0, path: '/' }) // Clear old token too
  return response
}
