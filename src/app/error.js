'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100dvh', padding: '24px', textAlign: 'center'
    }}>
      <i className="ri-error-warning-line" style={{ fontSize: '48px', color: 'var(--color-danger)', marginBottom: '16px' }} />
      <h2 className="font-heading" style={{ fontSize: '24px', marginBottom: '8px' }}>Terjadi Kesalahan</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        Maaf, sistem mengalami gangguan saat memproses halaman ini.
      </p>
      <button onClick={() => reset()} className="btn btn-primary">
        Coba Lagi
      </button>
    </div>
  )
}
