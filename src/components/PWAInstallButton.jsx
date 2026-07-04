'use client'

import { useState, useEffect } from 'react'

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showButton, setShowButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Cek apakah sudah di-install sebagai PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowButton(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Deteksi setelah install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowButton(false)
      setDeferredPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setShowButton(false)
    }
    setDeferredPrompt(null)
  }

  if (isInstalled || !showButton) return null

  return (
    <button
      onClick={handleInstall}
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '16px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        background: 'linear-gradient(135deg, #0f2d26 0%, #1a5c52 100%)',
        color: '#f5f0e8',
        border: 'none',
        borderRadius: '50px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(15, 45, 38, 0.4)',
        animation: 'pwa-bounce 2s ease-in-out infinite',
        fontFamily: 'var(--font-inter, Inter, sans-serif)',
      }}
      aria-label="Install aplikasi"
    >
      <i className="ri-install-line" style={{ fontSize: '18px' }} />
      Install App
      <style jsx>{`
        @keyframes pwa-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </button>
  )
}
