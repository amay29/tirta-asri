'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const SESSION_KEY = 'tirtaAsriUser'

export function getSession() {
  if (typeof window === 'undefined') return null

  let raw = null
  try {
    raw = localStorage.getItem(SESSION_KEY)
  } catch (err) {

  }

  if (!raw) {
    try {
      const match = document.cookie.match(new RegExp('(^| )' + SESSION_KEY + '=([^;]+)'))
      if (match) raw = decodeURIComponent(match[2])
    } catch (err) {}
  }

  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function useAuth(requiredRole = null) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const redirectedRef = useRef(false)

  const rolesRef = useRef(requiredRole)
  rolesRef.current = requiredRole

  const logout = useCallback(async () => {
    if (typeof window === 'undefined') return
    try { localStorage.removeItem(SESSION_KEY) } catch {}
    document.cookie = `${SESSION_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    
    if ('caches' in window) {
      try {
        const keys = await caches.keys()
        await Promise.all(keys.map(k => caches.delete(k)))
      } catch (err) {}
    }

    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {}

    router.replace('/login')
  }, [router])

  useEffect(() => {

    if (typeof window === 'undefined') return
    if (redirectedRef.current) return

    const parsed = getSession()

    if (!parsed) {
      redirectedRef.current = true
      router.replace('/login')
      return
    }

    const required = rolesRef.current
    if (required) {
      const allowedRoles = Array.isArray(required) ? required : [required]
      if (!allowedRoles.includes(parsed.role)) {
        redirectedRef.current = true
        router.replace('/login')
        return
      }
    }

    setUser(parsed)
    setLoading(false)
  }, [router]) // router dari next/navigation stabil (SPA)

  return { user, loading, logout }
}
