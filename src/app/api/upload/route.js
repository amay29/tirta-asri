import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import fs from 'fs'

export async function POST(request) {
  try {
    const role = request.headers.get('x-user-role')
    if (!role) {
      return NextResponse.json({ pesan: 'Akses ditolak' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ pesan: 'Tidak ada file' }, { status: 400 })
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ pesan: 'Format file tidak didukung. Harap unggah gambar JPG/PNG.' }, { status: 400 })
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ pesan: 'Ukuran gambar tidak boleh lebih dari 2MB.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filename = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Pastikan folder uploads ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ pesan: 'Gagal mengupload file' }, { status: 500 })
  }
}
