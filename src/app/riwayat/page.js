'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DeprecatedRiwayat() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/riwayat')
  }, [router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Mengalihkan...</p>
    </div>
  )
}