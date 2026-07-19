import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100dvh' }}>
      {/* Hero Section */}
      <section style={{ backgroundColor: '#0f2d26', position: 'relative', minHeight: '60dvh', overflow: 'hidden', paddingBottom: '40px' }}>
        <Image
          src="/assets/tirta_asri.jpg"
          alt="Tirta Asri Residence"
          fill
          className="object-cover"
          priority
          style={{ objectPosition: 'center 40%', opacity: 0.8 }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(15,45,38,0.3) 0%, rgba(15,45,38,0.9) 70%, #0f2d26 100%)',
        }} />
        
        <div style={{
          position: 'absolute', bottom: '0', left: '0', right: '0', padding: '0 24px 32px', zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
        }}>
          <span className="badge badge-accent" style={{ marginBottom: '16px' }}>Portal Layanan Mandiri</span>
          <h1 className="font-heading" style={{ fontSize: '36px', fontWeight: 600, color: '#fdf8f3', lineHeight: 1.15, margin: '0 0 16px' }}>
            Tirta Asri Residence
          </h1>
          <p style={{ color: '#a8d4cc', fontSize: '16px', lineHeight: 1.6, maxWidth: '400px', margin: '0 0 32px' }}>
            Kelola iuran bulanan, pantau laporan kas, dan dapatkan pengumuman terbaru dengan mudah dalam satu aplikasi.
          </p>
          <Link
            href="/login"
            className="btn btn-primary"
            style={{
              background: '#c9a84c', color: '#0f2d26', fontSize: '16px', padding: '16px 32px',
              borderRadius: '14px', width: '100%', maxWidth: '320px', justifyContent: 'center'
            }}
          >
            Masuk ke Akun Warga
            <i className="ri-arrow-right-line" style={{ marginLeft: '8px' }} />
          </Link>
        </div>
      </section>



      {/* Footer / Tech Stack */}
      <footer style={{ backgroundColor: '#0f2d26', color: '#a8d4cc', padding: '48px 24px', textAlign: 'center' }}>
        <i className="ri-home-smile-line" style={{ fontSize: '32px', color: '#c9a84c', marginBottom: '16px', display: 'block' }} />
        <h3 className="font-heading" style={{ color: '#fdf8f3', fontSize: '20px', marginBottom: '12px' }}>Tirta Asri Residence</h3>
        <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.8, marginBottom: '24px' }}>
          Jl. Lengkong, Kec. Bojongsoang<br />
          Kabupaten Bandung, Jawa Barat 40288
        </p>
        <div style={{ borderTop: '1px solid rgba(168,212,204,0.2)', paddingTop: '24px', fontSize: '12px', opacity: 0.6 }}>
          <p style={{ marginTop: '8px' }}>&copy; {new Date().getFullYear()} Tirta Asri Residence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
