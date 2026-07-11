import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse('Not found', { status: 404 })
}
