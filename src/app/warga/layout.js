'use client'

import { useAuth } from '@/hooks/useAuth'
import { ToastProvider } from '@/components/Toast'
import BottomNav from '@/components/BottomNav'
import { SkeletonDashboard } from '@/components/Skeleton'

export default function WargaLayout({ children }) {
  const { user, loading, logout } = useAuth('WARGA')

  if (loading || !user) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100dvh' }}>
        <div className="page-container">
          <SkeletonDashboard />
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100dvh' }}>
        <div className="page-container pb-safe">
          {children}
        </div>
        <BottomNav onLogout={logout} />
      </div>
    </ToastProvider>
  )
}
