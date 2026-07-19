'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth(requiredRole = null) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const redirectedRef = useRef(false)
  const rolesRef = useRef(requiredRole)
  rolesRef.current = requiredRole

  const logout = useCallback(async () => {
    if (typeof window === 'undefined') return
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {}

    router.replace('/login')
  }, [router])

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (isMounted) {
            setUser(data.user)
            
            const roles = rolesRef.current
            if (roles) {
              const allowedRoles = Array.isArray(roles) ? roles : [roles]
              if (!allowedRoles.includes(data.user.role) && !redirectedRef.current) {
                redirectedRef.current = true
                router.replace('/login')
              }
            }
          }
        } else {
          if (isMounted) {
            setUser(null)
            if (rolesRef.current && !redirectedRef.current) {
              redirectedRef.current = true
              router.replace('/login')
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          setUser(null)
          if (rolesRef.current && !redirectedRef.current) {
            redirectedRef.current = true
            router.replace('/login')
          }
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    checkAuth()

    return () => { isMounted = false }
  }, [router])

  return { user, loading, logout }
}
