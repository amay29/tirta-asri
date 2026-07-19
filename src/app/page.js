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

      {/* Features Section */}
      <section style={{ padding: '64px 24px', backgroundColor: 'var(--color-bg)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="font-heading" style={{ fontSize: '28px', color: 'var(--color-dark)', marginBottom: '12px' }}>
            Kemudahan untuk Warga
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>
            Platform digital yang dirancang khusus untuk mewujudkan transparansi dan kenyamanan warga.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
          <FeatureCard 
            icon="ri-wallet-3-line" 
            title="Pembayaran Digital" 
            desc="Bayar iuran bulanan dengan mudah melalui QRIS atau transfer bank, langsung dari HP Anda." 
          />
          <FeatureCard 
            icon="ri-bar-chart-box-line" 
            title="Transparansi Kas" 
            desc="Akses laporan uang masuk dan keluar secara real-time. Semuanya tercatat dengan jelas." 
          />
          <FeatureCard 
            icon="ri-file-text-line" 
            title="Surat Keterangan" 
            desc="Ajukan pembuatan surat pengantar RT/RW secara online tanpa perlu antre ke rumah pengurus." 
          />
          <FeatureCard 
            icon="ri-notification-3-line" 
            title="Notifikasi Real-time" 
            desc="Dapatkan pengumuman penting dan pengingat iuran langsung ke perangkat Anda." 
          />
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
          <p>Dibangun dengan Next.js App Router, Prisma ORM, dan PostgreSQL.</p>
          <p style={{ marginTop: '8px' }}>&copy; {new Date().getFullYear()} Tirta Asri Residence. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 24px' }}>
      <div style={{ 
        width: '56px', height: '56px', borderRadius: '16px', 
        backgroundColor: '#e0f0ea', color: '#1a6048', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <i className={icon} style={{ fontSize: '28px' }} />
      </div>
      <h4 className="font-heading" style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--color-dark)' }}>{title}</h4>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
        {desc}
      </p>
    </div>
  )
}