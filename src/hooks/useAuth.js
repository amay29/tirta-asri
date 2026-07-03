'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const SESSION_KEY = 'tirtaAsriUser'

export function useAuth(requiredRole = null) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Jalankan hanya di client
    if (typeof window === 'undefined') return

    try {
      let raw = null
      try {
        raw = localStorage.getItem(SESSION_KEY)
      } catch (err) {
        console.warn('LocalStorage read blocked:', err)
      }

      if (!raw) {
        // Fallback: Read from Cookie
        const match = document.cookie.match(new RegExp('(^| )' + SESSION_KEY + '=([^;]+)'))
        if (match) {
          raw = decodeURIComponent(match[2])
        }
      }

      if (!raw) {
        router.push('/login')
        return
      }

      const parsed = JSON.parse(raw)

      // Jika role tidak cocok, arahkan ke login
      if (requiredRole && parsed.role !== requiredRole) {
        router.push('/login')
        return
      }

      setUser(parsed)
      setLoading(false)
    } catch (e) {
      console.error('useAuth: session error', e)
      try {
        localStorage.removeItem(SESSION_KEY)
      } catch (err) {}
      document.cookie = `${SESSION_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      router.push('/login')
    }
  }, [requiredRole, router])

  const logout = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(SESSION_KEY)
      } catch (err) {}
      document.cookie = `${SESSION_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    }
    router.push('/login')
  }

  return { user, loading, logout }
}
