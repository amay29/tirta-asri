'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [noRumah, setNoRumah] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showPin, setShowPin] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    if (loading) return
    setErrorMsg('')

    const currentNoRumah = noRumah.trim()
    const currentPin = pin.trim()

    if (!currentNoRumah) {
      setErrorMsg('Nomor rumah wajib diisi')
      return
    }

    if (currentPin.length < 6) {
      setErrorMsg('PIN harus terdiri dari 6 digit angka')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noRumah: currentNoRumah, pin: currentPin }),
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

      // Simpan session
      const userData = JSON.stringify({ ...hasil.user, loginAt: Date.now() })
      try {
        localStorage.setItem('tirtaAsriUser', userData)
      } catch (err) {
        console.warn('LocalStorage write blocked:', err)
      }
      document.cookie = `tirtaAsriUser=${encodeURIComponent(userData)}; path=/; max-age=86400; SameSite=Lax`

      // Bersihkan cache service worker lama agar tidak menghalangi redirect
      if ('caches' in window) {
        try {
          const keys = await caches.keys()
          await Promise.all(keys.map(k => caches.delete(k)))
        } catch {}
      }

      const target = ['ADMIN_IURAN', 'ADMIN_RT'].includes(hasil.user.role) ? '/admin' : '/warga'
      
      // Gunakan router.push agar navigasi berjalan sebagai SPA
      setTimeout(() => {
        router.push(target)
      }, 100)

    } catch (error) {
      console.error(error)
      setErrorMsg('Tidak dapat terhubung ke server')
      setLoading(false)
    }
  }

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setPin(val)
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
      <div className="auth-form-area">
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
                name="noRumah"
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
              <label className="form-label" htmlFor="pin">
                <i className="ri-lock-2-line" style={{ marginRight: '6px' }} />
                PIN (6 Digit)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="pin"
                  name="pin"
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  placeholder="● ● ● ● ● ●"
                  value={pin}
                  onChange={handlePinChange}
                  className="input-field"
                  style={{ 
                    letterSpacing: (pin && !showPin) ? '8px' : 'normal', 
                    fontSize: (pin && !showPin) ? '20px' : '15px', 
                    textAlign: (pin && !showPin) ? 'center' : 'left',
                    paddingRight: '48px'
                  }}
                  autoComplete="current-password"
                  maxLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px'
                  }}
                >
                  <i className={showPin ? 'ri-eye-off-line' : 'ri-eye-line'} style={{ fontSize: '18px' }} />
                </button>
              </div>
              <p className="form-hint" style={{ marginTop: '8px' }}>
                <i className="ri-shield-check-line" style={{ marginRight: '4px' }} />
                PIN Anda bersifat rahasia, jangan beritahu siapapun
              </p>
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