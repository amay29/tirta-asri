'use client'

import { useAuth } from '@/hooks/useAuth'

export default function ProfilPage() {
  const { user, loading, logout } = useAuth(['WARGA', 'ADMIN_RT', 'ADMIN_IURAN'])

  if (loading) return <div className="p-24 text-center">Memuat data...</div>

  return (
    <div style={{ padding: '24px' }}>
      <h2 className="section-title mb-16">Profil Saya</h2>
      
      <div className="card mb-24">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            <i className="ri-user-smile-line" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{user?.nama}</h3>
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Rumah {user?.noRumah}</p>
          </div>
        </div>
        <div style={{ padding: '12px', background: 'var(--color-bg-warm)', borderRadius: '12px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>Role: <strong>{user?.role === 'ADMIN_RT' ? 'Ketua RT' : user?.role === 'ADMIN_IURAN' ? 'Bendahara' : 'Warga'}</strong></p>
        </div>
      </div>

      <button className="btn btn-primary" style={{ width: '100%', background: 'var(--color-danger)' }} onClick={logout}>
        <i className="ri-logout-box-r-line" /> Keluar
      </button>
    </div>
  )
}
