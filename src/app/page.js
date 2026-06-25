import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="auth-page" style={{ backgroundColor: '#0f2d26' }}>
      {/* Hero Section */}
      <div style={{ position: 'relative', minHeight: '55dvh', overflow: 'hidden' }}
        className="auth-hero"
      >
        <Image
          src="/assets/tirta_asri.jpg"
          alt="Tirta Asri Residence"
          fill
          className="object-cover"
          priority
          style={{ objectPosition: 'center 40%' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(15,45,38,0.2) 0%, rgba(15,45,38,0.7) 60%, #0f2d26 100%)',
        }} />

        <div style={{
          position: 'absolute', bottom: '32px', left: '24px', right: '24px', zIndex: 10,
        }}>
          <span className="badge-accent badge" style={{ marginBottom: '12px' }}>
            Portal Layanan Mandiri
          </span>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '36px',
            fontWeight: 600,
            color: '#fdf8f3',
            lineHeight: 1.15,
            margin: 0,
          }}>
            Tirta Asri<br />Residence
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="auth-form-area" style={{
        flex: 1, padding: '32px 24px 48px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          <p className="animate-fade-up" style={{
            fontSize: '15px', color: '#a8d4cc', lineHeight: 1.7, margin: '0 0 28px',
          }}>
            Selamat datang di portal warga Tirta Asri Residence.
            Kelola iuran bulanan, ajukan surat keterangan, dan pantau
            informasi terbaru  — semua dalam satu tempat.
          </p>

          <div className="animate-fade-up delay-1" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link
              href="/login"
              className="btn btn-primary"
              style={{
                background: '#c9a84c',
                color: '#0f2d26',
                fontSize: '16px',
                padding: '16px 24px',
                borderRadius: '14px',
                justifyContent: 'center',
                minHeight: '54px',
              }}
            >
              <i className="ri-login-box-line" style={{ fontSize: '18px' }} />
              Masuk ke Akun
            </Link>

            <Link
              href="/register"
              className="btn btn-secondary"
              style={{
                background: 'transparent',
                color: '#a8d4cc',
                border: '1px solid rgba(168,212,204,0.3)',
                fontSize: '16px',
                padding: '16px 24px',
                borderRadius: '14px',
                justifyContent: 'center',
                minHeight: '54px',
              }}
            >
              <i className="ri-user-add-line" style={{ fontSize: '18px' }} />
              Daftar Warga Baru
            </Link>
          </div>

          <p className="animate-fade-up delay-3" style={{
            textAlign: 'center', marginTop: '32px',
            fontSize: '12px', color: 'rgba(168,212,204,0.5)', lineHeight: 1.7,
          }}>
            Jl. Lengkong, Kec. Bojongsoang<br />
            Kabupaten Bandung, Jawa Barat 40288
          </p>
        </div>
      </div>
    </div>
  )
}