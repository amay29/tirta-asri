'use client'

import { useState, useEffect } from 'react'
import { getSession } from '@/hooks/useAuth'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function NotificationButton() {
  const [permission, setPermission] = useState('default')
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const handleSubscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Browser Anda tidak mendukung notifikasi push')
      return
    }

    setSubscribing(true)

    try {
      // Request permission
      const perm = await Notification.requestPermission()
      setPermission(perm)

      if (perm !== 'granted') {
        setSubscribing(false)
        return
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        ),
      })

      // Kirim subscription ke server
      const user = getSession()
      if (user) {
        await fetch('/api/notification/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            subscription: subscription.toJSON(),
          }),
        })
      }
    } catch (err) {
      console.error('Subscribe error:', err)
    } finally {
      setSubscribing(false)
    }
  }

  // Jangan tampilkan jika sudah granted atau browser tidak support
  if (typeof window !== 'undefined' && !('Notification' in window)) return null
  if (permission === 'granted') return null
  if (permission === 'denied') return null

  return (
    <button
      onClick={handleSubscribe}
      disabled={subscribing}
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '16px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        background: 'linear-gradient(135deg, #c9a84c 0%, #a88832 100%)',
        color: '#18291f',
        border: 'none',
        borderRadius: '50px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(201, 168, 76, 0.3)',
        animation: 'notif-pulse 2s ease-in-out infinite',
        fontFamily: 'var(--font-inter, Inter, sans-serif)',
      }}
      aria-label="Aktifkan notifikasi"
    >
      <i className="ri-notification-3-line" style={{ fontSize: '18px' }} />
      {subscribing ? 'Mengaktifkan...' : 'Aktifkan Notifikasi'}
      <style jsx>{`
        @keyframes notif-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(201, 168, 76, 0.3); }
          50% { box-shadow: 0 4px 30px rgba(201, 168, 76, 0.6); }
        }
      `}</style>
    </button>
  )
}
