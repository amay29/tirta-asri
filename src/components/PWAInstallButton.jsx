'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/Modal'

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showManualModal, setShowManualModal] = useState(false)
  const [os, setOs] = useState('unknown')

  useEffect(() => {

    const userAgent = window.navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setOs('ios')
    } else if (/android/.test(userAgent)) {
      setOs('android')
    }

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      setShowManualModal(false)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {

      setShowManualModal(true)
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setDeferredPrompt(null)
  }

  if (isInstalled) return null

  return (
    <>
      <button
        onClick={handleInstall}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          gap: '8px',
          padding: '12px 20px',
          background: 'linear-gradient(135deg, #0f2d26 0%, #1a5c52 100%)',
          color: '#f5f0e8',
          border: 'none',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(15, 45, 38, 0.2)',
          fontFamily: 'var(--font-inter, Inter, sans-serif)',
          marginBottom: '12px'
        }}
        aria-label="Install aplikasi"
      >
        <i className="ri-install-line" style={{ fontSize: '18px' }} />
        Install App ke Layar Utama
      </button>

      <Modal isOpen={showManualModal} onClose={() => setShowManualModal(false)} title="Cara Install Aplikasi" size="sm">
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <i className="ri-smartphone-line" style={{ fontSize: '48px', color: 'var(--color-primary)', marginBottom: '12px', display: 'block' }} />
          
          {os === 'ios' ? (
            <>
              <p style={{ fontSize: '14px', color: 'var(--color-text)', marginBottom: '16px', lineHeight: 1.5 }}>
                Untuk install di iPhone/iPad (Safari):
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', background: 'var(--color-card-alt)', padding: '16px', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  1. Tap icon <strong>Share</strong> <i className="ri-share-forward-box-line" style={{ color: 'var(--color-primary)' }} /> di bar navigasi bawah.
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  2. Scroll ke bawah dan pilih <strong>"Tambah ke Layar Utama"</strong> (Add to Home Screen) <i className="ri-add-box-line" style={{ color: 'var(--color-primary)' }} />.
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  3. Tap <strong>Tambah</strong> di pojok kanan atas.
                </p>
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: '14px', color: 'var(--color-text)', marginBottom: '16px', lineHeight: 1.5 }}>
                Browser Anda belum mendukung instalasi otomatis. Install secara manual:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', background: 'var(--color-card-alt)', padding: '16px', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  1. Tap menu <strong>Titik Tiga</strong> <i className="ri-more-2-fill" style={{ color: 'var(--color-primary)' }} /> di pojok kanan atas browser (Chrome).
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  2. Pilih opsi <strong>"Install aplikasi"</strong> atau <strong>"Tambah ke Layar Utama"</strong>.
                </p>
              </div>
            </>
          )}
          
          <button onClick={() => setShowManualModal(false)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '24px' }}>
            Mengerti
          </button>
        </div>
      </Modal>
    </>
  )
}
