'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import EmptyState from '@/components/EmptyState'
import { SkeletonList } from '@/components/Skeleton'

export default function AktivitasAdmin() {
  const { user } = useAuth(['ADMIN_RT', 'ADMIN_IURAN'])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const ambilData = async () => {
    try {
      const res = await fetch('/api/aktivitas')
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) ambilData()
  }, [user])

  if (!user || loading) return <SkeletonList count={4} />

  const getActionIcon = (action) => {
    if (action.includes('APPROVE')) return <i className="ri-check-line" style={{ color: 'var(--color-success)' }} />
    if (action.includes('CANCEL') || action.includes('REJECT')) return <i className="ri-close-line" style={{ color: 'var(--color-danger)' }} />
    if (action.includes('RESET')) return <i className="ri-refresh-line" style={{ color: 'var(--color-warning)' }} />
    return <i className="ri-history-line" style={{ color: 'var(--color-primary)' }} />
  }

  return (
    <>
      <div className="animate-fade-up" style={{ marginBottom: '24px' }}>
        <p className="label-small" style={{ marginBottom: '4px' }}>Tirta Asri Residence</p>
        <h1 className="section-title" style={{ fontSize: '24px' }}>Histori Aktivitas</h1>
        <p className="section-subtitle">Catatan tindakan yang dilakukan oleh Admin</p>
      </div>

      <div className="animate-fade-up delay-1">
        {logs.length === 0 ? (
          <div className="card">
            <EmptyState icon="ri-history-line" title="Belum ada aktivitas" description="Riwayat tindakan admin akan muncul di sini" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {logs.map(log => (
              <div key={log.id} className="card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {getActionIcon(log.action)}
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: 'var(--color-text)', margin: '0 0 4px', lineHeight: 1.5 }}>
                    <strong>{log.user?.nama || 'Sistem'}</strong> {log.details}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                      {new Date(log.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {log.user?.role && (
                      <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                        {log.user.role === 'ADMIN_RT' ? 'Ketua RT' : 'Admin Iuran'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
