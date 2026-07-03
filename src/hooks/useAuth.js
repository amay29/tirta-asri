'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const SESSION_KEY = 'tirtaAsriUser'

export function useAuth(requiredRole = null) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const requiredRoleStr = typeof requiredRole === 'string' ? requiredRole : JSON.stringify(requiredRole)

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
      if (requiredRole) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
        if (!allowedRoles.includes(parsed.role)) {
          router.push('/login')
          return
        }
      }

      // Hindari update state berulang jika data user tidak berubah secara nilai string (untuk cegah infinite loop)
      setUser(prev => {
        if (prev && JSON.stringify(prev) === JSON.stringify(parsed)) return prev
        return parsed
      })
      setLoading(false)
    } catch (e) {
      console.error('useAuth: session error', e)
      try {
        localStorage.removeItem(SESSION_KEY)
      } catch (err) {}
      document.cookie = `${SESSION_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      router.push('/login')
    }
  }, [requiredRoleStr, router])

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
