'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [noRumah, setNoRumah] = useState('')
  const [noHp, setNoHp] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noRumah: noRumah.trim(), noHp }),
      })

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        setErrorMsg('Server bermasalah, coba lagi nanti')
        setLoading(false)
        return
      }

      const hasil = await response.json()

      if (!response.ok) {
        setErrorMsg(hasil.pesan || 'Gagal login')
        setLoading(false)
        return
      }

      localStorage.setItem('tirtaAsriUser', JSON.stringify(hasil.user))

      if (hasil.user.role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/warga')
      }
    } catch (error) {
      console.error(error)
      setErrorMsg('Tidak dapat terhubung ke server')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Hero Side */}
      <div className="auth-hero" style={{ position: 'relative', minHeight: '240px', overflow: 'hidden', backgroundColor: '#0f2d26' }}>
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
          background: 'linear-gradient(to bottom, rgba(15,45,38,0.3) 0%, rgba(15,45,38,0.85) 70%, var(--color-bg) 100%)',
        }} />
        <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', zIndex: 10 }}>
          <span className="badge badge-accent" style={{ marginBottom: '8px' }}>Portal Warga</span>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 600,
            color: '#fdf8f3', lineHeight: 1.2, margin: 0,
          }}>
            Tirta Asri Residence
          </h1>
        </div>
      </div>

      {/* Form Side */}
      <div className="auth-form-area" style={{ flex: 1, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div className="animate-fade-up">
            <p className="label-small" style={{ marginBottom: '4px' }}>Selamat datang</p>
            <h2 className="section-title" style={{ marginBottom: '4px' }}>Masuk ke Akun Anda</h2>
            <div style={{ width: '28px', height: '3px', borderRadius: '2px', background: 'var(--color-accent)', marginBottom: '28px' }} />
          </div>

          <form onSubmit={handleLogin}>
            <div className="animate-fade-up delay-1" style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="noRumah">
                <i className="ri-home-4-line" style={{ marginRight: '6px' }} />
                Nomor Rumah
              </label>
              <input
                id="noRumah"
                type="text"
                placeholder="Contoh: B17"
                value={noRumah}
                onChange={(e) => setNoRumah(e.target.value)}
                className="input-field"
                autoComplete="username"
                required
              />
            </div>

            <div className="animate-fade-up delay-2" style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="noHp">
                <i className="ri-phone-line" style={{ marginRight: '6px' }} />
                Nomor HP (Password)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="noHp"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Masukkan nomor HP Anda"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="input-field"
                  style={{ paddingRight: '48px' }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--color-text-muted)',
                    cursor: 'pointer', fontSize: '18px', padding: '4px',
                  }}
                  aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  <i className={showPw ? 'ri-eye-off-line' : 'ri-eye-line'} />
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="form-error animate-fade-in" style={{ marginBottom: '8px' }}>
                <i className="ri-error-warning-line" style={{ marginRight: '6px' }} />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary animate-fade-up delay-3"
              style={{ width: '100%', justifyContent: 'center', marginTop: '20px', fontSize: '16px', minHeight: '52px' }}
            >
              {loading ? (
                <><div className="spinner" /> Memproses...</>
              ) : (
                <>Masuk <i className="ri-arrow-right-line" /></>
              )}
            </button>
          </form>

          <p className="animate-fade-up delay-4" style={{
            textAlign: 'center', marginTop: '20px',
            fontSize: '14px', color: 'var(--color-text-secondary)',
          }}>
            Belum punya akun?{' '}
            <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}