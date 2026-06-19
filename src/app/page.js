import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#0d3830', fontFamily: 'Inter, sans-serif' }}>

      <div className="relative h-72 overflow-hidden shrink-0 md:h-96">
        <Image
          src="/assets/tirta_asri.jpg"
          alt="Tirta Asri Residence"
          fill
          className="object-cover"
          priority
        />
        
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, #0d383044 0%, #0d3830ee 85%, #0d3830 100%)' }}
        />
    
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <span className="inline-block text-[9.5px] font-medium tracking-widest uppercase px-2.5 py-1 rounded-sm mb-2.5"
            style={{ color: '#c9a84c', background: '#c9a84c22', border: '0.5px solid #c9a84c88' }}>
            Portal Layanan Mandiri Warga
          </span>
          <h1 className="font-serif text-[30px] font-semibold leading-tight mb-1.5"
            style={{ color: '#fdf8f3', fontFamily: 'var(--font-playfair), serif' }}>
            Tirta Asri Residence
          </h1>
          <p className="text-xs" style={{ color: '#a8d4cc' }}>
            
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 pb-8 pt-6">
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#fdf8f3' }}>

          <p className="text-[11px] font-medium tracking-wider uppercase mb-1"
            style={{ color: '#7ab5ac' }}>
            Selamat datang
          </p>
          <h2 className="text-[19px] font-medium mb-1.5"
            style={{ fontFamily: 'var(--font-playfair), serif', color: '#1a2e2a' }}>
            Masuk ke akun Anda
          </h2>
          <div className="w-7 h-0.5 rounded-sm mb-5" style={{ backgroundColor: '#c9a84c' }} />

          <div className="mb-3.5">
            <label className="block text-[11.5px] font-medium mb-1.5"
              style={{ color: '#4a7068' }}>
              Nomor Rumah / HP
            </label>
            <input
              type="text"
              placeholder="Contoh: B17 atau 08123456xxx"
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
              style={{
                border: '0.5px solid #b8d4cf',
                backgroundColor: '#fff',
                color: '#1a2e2a',
                fontFamily: 'Inter, sans-serif',
              }}
            />
          </div>

          <div className="mb-3.5">
            <label className="block text-[11.5px] font-medium mb-1.5"
              style={{ color: '#4a7068' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none"
              style={{
                border: '0.5px solid #b8d4cf',
                backgroundColor: '#fff',
                color: '#1a2e2a',
                fontFamily: 'Inter, sans-serif',
              }}
            />
          </div>

          <Link
            href="/dashboard"
            className="block text-center w-full py-3 rounded-xl text-sm font-medium mt-5"
            style={{ backgroundColor: '#1a5c52', color: '#fdf8f3' }}
          >
            Masuk →
          </Link>
        </div>

        <p className="text-center mt-5 leading-relaxed" style={{ fontSize: '10.5px', color: '#5a9990' }}>
          Jl. Lengkong Kec. Bojongsoang<br />
          Kabupaten Bandung, Jawa Barat 40288
        </p>
      </div>

    </div>
  )
}