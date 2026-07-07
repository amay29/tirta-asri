import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET(request, { params }) {
  try {
    const { slug } = params
    const filepath = path.join(process.cwd(), 'public', 'uploads', ...slug)

    if (!fs.existsSync(filepath)) {
      return new NextResponse('File tidak ditemukan', { status: 404 })
    }

    const fileBuffer = fs.readFileSync(filepath)
    
    // Tentukan Content-Type berdasarkan ekstensi
    const ext = path.extname(filepath).toLowerCase()
    let contentType = 'application/octet-stream'
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
    else if (ext === '.png') contentType = 'image/png'
    else if (ext === '.pdf') contentType = 'application/pdf'
    else if (ext === '.csv') contentType = 'text/csv'
    else if (ext === '.xls') contentType = 'application/vnd.ms-excel'
    else if (ext === '.xlsx') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
