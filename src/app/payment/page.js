'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function PaymentPage() {
  const [step, setStep] = useState('processing')

  useEffect(() => {
    const t = setTimeout(() => setStep('done'), 2500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f2d26 0%, #1a5c52 100%)', padding: '24px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '24px', padding: '40px 32px',
        maxWidth: '380px', width: '100%', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {step === 'processing' ? (
          <>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: '#fdf0e0', margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              <i className="ri-loader-4-line" style={{ fontSize: '28px', color: '#c9a84c', animation: 'spin 1s linear infinite' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 600, color: '#18291f', margin: '0 0 8px' }}>
              Memproses Pembayaran
            </h2>
            <p style={{ fontSize: '14px', color: '#5a7a72', lineHeight: 1.5, margin: 0 }}>
              Mohon tunggu sebentar...
            </p>
          </>
        ) : (
          <>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: '#e0f0ea', margin: '0 auto 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="ri-check-double-line" style={{ fontSize: '36px', color: '#1a6048' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 600, color: '#1a6048', margin: '0 0 8px' }}>
              Pembayaran Diterima
            </h2>
            <p style={{ fontSize: '14px', color: '#5a7a72', lineHeight: 1.6, margin: '0 0 24px' }}>
              Pembayaran iuran Anda telah tercatat dan menunggu konfirmasi dari pengurus RT.
            </p>
            <div style={{
              background: '#f5f1eb', borderRadius: '12px', padding: '16px', marginBottom: '20px',
            }}>
              <p style={{ fontSize: '12px', color: '#5a7a72', margin: '0 0 4px' }}>Status</p>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#18291f', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <i className="ri-time-line" style={{ color: '#c9a84c' }} /> Menunggu Verifikasi RT
              </p>
            </div>
            <Link href="/warga" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: '#0f2d26', color: '#f5f0e8', padding: '14px 28px',
              borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '15px',
            }}>
              <i className="ri-home-5-line" /> Kembali ke Beranda
            </Link>
          </>
        )}
      </div>
      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.08) } }
      `}</style>
    </div>
  )
}
