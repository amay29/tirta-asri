'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function Register() {
  const router = useRouter()
  const [nama, setNama] = useState('')
  const [noRumah, setNoRumah] = useState('')
  const [pin, setPin] = useState('')
  const [pinKonfirmasi, setPinKonfirmasi] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [sukses, setSukses] = useState(false)

  const handlePinChange = (setter) => (e) => {
    setter(e.target.value.replace(/\D/g, '').slice(0, 6))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (pin.length < 6) {
      setErrorMsg('PIN harus 6 digit angka')
      return
    }
    if (pin !== pinKonfirmasi) {
      setErrorMsg('PIN dan Konfirmasi PIN tidak sama')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: nama.trim(), noRumah: noRumah.trim(), pin }),
      })

      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        setErrorMsg('Server bermasalah, coba lagi nanti')
        setLoading(false)
        return
      }

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.pesan || 'Gagal mendaftarkan akun')
        setLoading(false)
        return
      }

      setSukses(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch {
      setErrorMsg('Tidak dapat terhubung ke server')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Hero */}
      <div className="auth-hero" style={{ position: 'relative', minHeight: '200px', overflow: 'hidden', backgroundColor: '#0f2d26' }}>
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
          <span className="badge badge-accent" style={{ marginBottom: '8px' }}>Pendaftaran</span>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 600,
            color: '#fdf8f3', lineHeight: 1.2, margin: 0,
          }}>
            Daftar Akun Warga
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="auth-form-area">
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {sukses ? (
            <div className="animate-fade-up" style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'var(--color-success-bg)', margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <i className="ri-check-line" style={{ fontSize: '32px', color: 'var(--color-success)' }} />
              </div>
              <h2 className="section-title" style={{ color: 'var(--color-success)', marginBottom: '8px' }}>Pendaftaran Berhasil!</h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Akun Anda telah dibuat. Anda akan dialihkan ke halaman login...
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '12px' }}>
                <i className="ri-information-line" style={{ marginRight: '4px' }} />
                Ingat PIN Anda. Gunakan untuk login.
              </p>
            </div>
          ) : (
            <>
              <div className="animate-fade-up">
                <h2 className="section-title" style={{ marginBottom: '4px' }}>Data Diri</h2>
                <div style={{ width: '28px', height: '3px', borderRadius: '2px', background: 'var(--color-accent)', marginBottom: '24px' }} />
              </div>

              <form onSubmit={handleRegister}>
                <div className="animate-fade-up delay-1" style={{ marginBottom: '14px' }}>
                  <label className="form-label" htmlFor="nama">
                    <i className="ri-user-3-line" style={{ marginRight: '6px' }} />
                    Nama Lengkap
                  </label>
                  <input id="nama" type="text" placeholder="Nama sesuai KTP" value={nama}
                    onChange={(e) => setNama(e.target.value)} className="input-field" required />
                </div>

                <div className="animate-fade-up delay-1" style={{ marginBottom: '14px' }}>
                  <label className="form-label" htmlFor="noRumah">
                    <i className="ri-home-4-line" style={{ marginRight: '6px' }} />
                    Nomor Rumah
                  </label>
                  <input id="noRumah" type="text" placeholder="Contoh: B17" value={noRumah}
                    onChange={(e) => setNoRumah(e.target.value)} className="input-field" required />
                </div>

                <div style={{ height: '1px', background: 'var(--color-border-light)', margin: '20px 0 16px' }} />
                <p className="animate-fade-up delay-2" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="ri-lock-2-line" />
                  Buat PIN Keamanan (6 Digit)
                </p>

                <div className="animate-fade-up delay-2" style={{ marginBottom: '14px' }}>
                  <label className="form-label" htmlFor="pin">PIN</label>
                  <input id="pin" type="password" inputMode="numeric" placeholder="● ● ● ● ● ●" value={pin}
                    onChange={handlePinChange(setPin)} className="input-field"
                    style={{ letterSpacing: pin ? '8px' : 'normal', fontSize: pin ? '20px' : '15px', textAlign: pin ? 'center' : 'left' }}
                    maxLength={6} required />
                </div>

                <div className="animate-fade-up delay-2" style={{ marginBottom: '14px' }}>
                  <label className="form-label" htmlFor="pinKonfirmasi">Konfirmasi PIN</label>
                  <input id="pinKonfirmasi" type="password" inputMode="numeric" placeholder="● ● ● ● ● ●" value={pinKonfirmasi}
                    onChange={handlePinChange(setPinKonfirmasi)} className="input-field"
                    style={{ letterSpacing: pinKonfirmasi ? '8px' : 'normal', fontSize: pinKonfirmasi ? '20px' : '15px', textAlign: pinKonfirmasi ? 'center' : 'left' }}
                    maxLength={6} required />
                  {pinKonfirmasi && pin && pinKonfirmasi !== pin && (
                    <p className="form-error" style={{ marginTop: '6px', fontSize: '12px' }}>
                      <i className="ri-error-warning-line" style={{ marginRight: '4px' }} /> PIN tidak cocok
                    </p>
                  )}
                  {pinKonfirmasi && pin && pinKonfirmasi === pin && pin.length === 6 && (
                    <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="ri-check-line" /> PIN cocok
                    </p>
                  )}
                </div>

                <p className="form-hint animate-fade-up delay-2" style={{ marginBottom: '16px' }}>
                  <i className="ri-shield-check-line" style={{ marginRight: '4px' }} />
                  PIN ini bersifat rahasia. Jangan beritahu siapapun.
                </p>

                {errorMsg && (
                  <div className="form-error animate-fade-in" style={{ marginBottom: '8px' }}>
                    <i className="ri-error-warning-line" style={{ marginRight: '6px' }} />
                    {errorMsg}
                  </div>
                )}

                <button type="submit"
                  disabled={loading || pin.length < 6 || pin !== pinKonfirmasi}
                  className="btn btn-primary animate-fade-up delay-3"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '16px', fontSize: '16px', minHeight: '52px' }}
                >
                  {loading ? <><div className="spinner" /> Mendaftarkan...</> : <>Daftar Sekarang <i className="ri-arrow-right-line" /></>}
                </button>
              </form>

              <p className="animate-fade-up delay-4" style={{
                textAlign: 'center', marginTop: '20px',
                fontSize: '14px', color: 'var(--color-text-secondary)',
              }}>
                Sudah punya akun?{' '}
                <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                  Masuk di sini
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}