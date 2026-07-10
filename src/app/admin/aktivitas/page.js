'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import EmptyState from '@/components/EmptyState'
import { SkeletonList } from '@/components/Skeleton'

const KEUANGAN_ACTIONS = ['PAYMENT_APPROVE', 'PAYMENT_REJECT', 'PAYMENT_CANCEL', 'EXPENSE_ADD', 'EXPENSE_DELETE']

export default function AktivitasAdmin() {
  const { user } = useAuth(['ADMIN_RT', 'ADMIN_IURAN'])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('keuangan') // 'keuangan' | 'sistem'

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
    if (action.includes('APPROVE') || action === 'EXPENSE_ADD') return <i className="ri-check-double-line" style={{ color: 'var(--color-success)' }} />
    if (action.includes('CANCEL') || action.includes('REJECT') || action === 'EXPENSE_DELETE') return <i className="ri-close-circle-line" style={{ color: 'var(--color-danger)' }} />
    if (action.includes('CHANGE') || action.includes('RESET')) return <i className="ri-refresh-line" style={{ color: 'var(--color-warning)' }} />
    if (action.includes('BACKUP')) return <i className="ri-database-2-line" style={{ color: 'var(--color-primary)' }} />
    if (action.includes('ANNOUNCEMENT')) return <i className="ri-megaphone-line" style={{ color: 'var(--color-accent)' }} />
    return <i className="ri-history-line" style={{ color: 'var(--color-primary)' }} />
  }

  const keuanganLogs = logs.filter(log => KEUANGAN_ACTIONS.includes(log.action))
  const sistemLogs = logs.filter(log => !KEUANGAN_ACTIONS.includes(log.action))

  const displayedLogs = user.role === 'ADMIN_IURAN' 
    ? keuanganLogs 
    : (activeTab === 'keuangan' ? keuanganLogs : sistemLogs)

  return (
    <>
      <div className="animate-fade-up" style={{ marginBottom: '24px' }}>
        <p className="label-small" style={{ marginBottom: '4px' }}>Tirta Asri Residence</p>
        <h1 className="section-title" style={{ fontSize: '24px' }}>Histori Aktivitas</h1>
        <p className="section-subtitle">
          {user.role === 'ADMIN_IURAN' ? 'Catatan tindakan keuangan (Iuran & Pengeluaran)' : 'Catatan seluruh tindakan dalam sistem'}
        </p>
      </div>

      {user.role === 'ADMIN_RT' && (
        <div className="animate-fade-up delay-1" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button 
            className={`btn-pill ${activeTab === 'keuangan' ? 'active' : ''}`}
            onClick={() => setActiveTab('keuangan')}
            style={{ flex: 1 }}
          >
            <i className="ri-wallet-3-line" /> Aktivitas Keuangan
          </button>
          <button 
            className={`btn-pill ${activeTab === 'sistem' ? 'active' : ''}`}
            onClick={() => setActiveTab('sistem')}
            style={{ flex: 1 }}
          >
            <i className="ri-settings-4-line" /> Sistem & Warga
          </button>
        </div>
      )}

      <div className="animate-fade-up delay-2">
        {displayedLogs.length === 0 ? (
          <div className="card">
            <EmptyState 
              icon={activeTab === 'keuangan' || user.role === 'ADMIN_IURAN' ? "ri-wallet-3-line" : "ri-history-line"} 
              title="Belum ada aktivitas" 
              description="Riwayat tindakan akan muncul di sini" 
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayedLogs.map((log, index) => (
              <div key={log.id} className="card animate-fade-up" style={{ animationDelay: `${0.1 + index * 0.05}s`, padding: '16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '42px', height: '42px', borderRadius: '12px', 
                  background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontSize: '20px'
                }}>
                  {getActionIcon(log.action)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', color: 'var(--color-text)', margin: '0 0 6px', lineHeight: 1.5 }}>
                    <strong style={{ fontWeight: 600 }}>{log.user?.nama || 'Sistem'}</strong> {log.details}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="ri-time-line" />
                      {new Date(log.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {log.user?.role && (
                      <span className={`badge ${log.user.role === 'ADMIN_RT' ? 'badge-accent' : log.user.role === 'ADMIN_IURAN' ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '10px' }}>
                        {log.user.role === 'ADMIN_RT' ? 'Ketua RT' : log.user.role === 'ADMIN_IURAN' ? 'Admin Iuran' : 'Warga'}
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
