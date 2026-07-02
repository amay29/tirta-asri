'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const SESSION_KEY = 'tirtaAsriUser'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 jam

export function useAuth(requiredRole = null) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const hasChecked = useRef(false)

  useEffect(() => {
    // Cegah double-check saat React StrictMode / HMR
    if (hasChecked.current) return
    hasChecked.current = true

    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (!raw) {
        router.push('/login')
        return
      }

      const parsed = JSON.parse(raw)

      // Cek masa berlaku sesi (24 jam)
      if (parsed.loginAt && Date.now() - parsed.loginAt > SESSION_DURATION) {
        localStorage.removeItem(SESSION_KEY)
        router.push('/login')
        return
      }

      // Cek role
      if (requiredRole && parsed.role !== requiredRole) {
        router.push('/login')
        return
      }

      // Perpanjang sesi setiap kali user aktif
      const updated = { ...parsed, loginAt: Date.now() }
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated))

      setUser(parsed)
    } catch {
      localStorage.removeItem(SESSION_KEY)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, []) // Intentionally no deps — only run once on mount

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    router.push('/login')
  }

  return { user, loading, logout }
}
