'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ToastProvider } from '@/components/Toast'
import AdminSidebar from '@/components/AdminSidebar'
import { SkeletonDashboard } from '@/components/Skeleton'

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth(['ADMIN_IURAN', 'ADMIN_RT'])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading || !user) {
    return (
      <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100dvh', padding: '28px 32px' }}>
        <SkeletonDashboard />
      </div>
    )
  }

  return (
    <ToastProvider>
      <div className="admin-layout">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={logout}
          role={user.role}
        />
        <main className="admin-main" style={{ backgroundColor: 'var(--color-bg)' }}>
          <div className="mobile-header">
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Buka menu">
              <i className="ri-menu-line" />
            </button>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
              Tirta Asri
            </p>
            <div style={{ width: '40px' }} />
          </div>
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}
