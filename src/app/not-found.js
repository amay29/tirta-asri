import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100dvh', padding: '24px', textAlign: 'center'
    }}>
      <i className="ri-compass-3-line" style={{ fontSize: '48px', color: 'var(--color-text-muted)', marginBottom: '16px' }} />
      <h2 className="font-heading" style={{ fontSize: '24px', marginBottom: '8px' }}>Halaman Tidak Ditemukan</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        Maaf, halaman yang Anda cari tidak ada atau sudah dipindahkan.
      </p>
      <Link href="/" className="btn btn-primary">
        Kembali ke Beranda
      </Link>
    </div>
  )
}
