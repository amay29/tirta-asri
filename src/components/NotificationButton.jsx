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

      const perm = await Notification.requestPermission()
      setPermission(perm)

      if (perm !== 'granted') {
        setSubscribing(false)
        return
      }

      const registration = await navigator.serviceWorker.ready

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        ),
      })

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

  if (typeof window !== 'undefined' && !('Notification' in window)) return null
  if (permission === 'granted') return null
  if (permission === 'denied') return null

  return (
    <button
      onClick={handleSubscribe}
      disabled={subscribing}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        gap: '8px',
        padding: '12px 20px',
        background: 'linear-gradient(135deg, #c9a84c 0%, #a88832 100%)',
        color: '#18291f',
        border: 'none',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(201, 168, 76, 0.2)',
        fontFamily: 'var(--font-inter, Inter, sans-serif)',
        marginBottom: '16px'
      }}
      aria-label="Aktifkan notifikasi"
    >
      <i className="ri-notification-3-line" style={{ fontSize: '18px' }} />
      {subscribing ? 'Mengaktifkan...' : 'Aktifkan Notifikasi (Penting)'}

    </button>
  )
}
