'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth(requiredRole = null) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem('tirtaAsriUser')
    if (!raw) {
      router.push('/login')
      return
    }

    try {
      const parsed = JSON.parse(raw)
      if (requiredRole && parsed.role !== requiredRole) {
        router.push('/login')
        return
      }
      setUser(parsed)
    } catch {
      localStorage.removeItem('tirtaAsriUser')
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router, requiredRole])

  const logout = () => {
    localStorage.removeItem('tirtaAsriUser')
    router.push('/login')
  }

  return { user, loading, logout }
}
