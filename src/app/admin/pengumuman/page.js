'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/Toast'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import { SkeletonList } from '@/components/Skeleton'

export default function PengumumanAdmin() {
  const { user } = useAuth('ADMIN')
  const toast = useToast()
  const [pengumumanList, setPengumumanList] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [judul, setJudul] = useState('')
  const [isi, setIsi] = useState('')
  const [penting, setPenting] = useState(false)
  const [sending, setSending] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const ambilData = async () => {
    try {
      const res = await fetch('/api/pengumuman')
      if (res.ok) {
        const data = await res.json()
        setPengumumanList(data.pengumuman || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => { if (user) ambilData() }, [user])

  const handleBuat = async (e) => {
    e.preventDefault()
    if (!judul || !isi) return
    setSending(true)
    try {
      const res = await fetch('/api/pengumuman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ judul, isi, penting }),
      })
      if (res.ok) {
        setJudul('')
        setIsi('')
        setPenting(false)
        toast.success('Pengumuman berhasil dibuat!')
        ambilData()
      }
    } catch { toast.error('Gagal membuat pengumuman') }
    finally { setSending(false) }
  }

  const handleHapus = async () => {
    if (!deleteId) return
    try {
      const res = await fetch('/api/pengumuman', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteId }),
      })
      if (res.ok) {
        toast.info('Pengumuman dihapus')
        ambilData()
      }
    } catch { toast.error('Gagal menghapus') }
    finally { setDeleteId(null) }
  }

  if (!user || loadingData) return <SkeletonList count={2} />

  return (
    <>
      <div className="animate-fade-up" style={{ marginBottom: '24px' }}>
        <p className="label-small" style={{ marginBottom: '4px' }}>Tirta Asri Residence</p>
        <h1 className="section-title">Pengumuman</h1>
        <p className="section-subtitle">Kelola informasi untuk warga</p>
      </div>

      {/* Form */}
      <form onSubmit={handleBuat} className="card animate-fade-up delay-1" style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 14px' }}>
          <i className="ri-megaphone-line" style={{ marginRight: '6px', color: 'var(--color-accent)' }} />
          Buat Pengumuman Baru
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Judul pengumuman" value={judul} onChange={(e) => setJudul(e.target.value)} className="input-field" required />
          <textarea placeholder="Isi pengumuman..." value={isi} onChange={(e) => setIsi(e.target.value)} className="textarea-field" rows={3} required />
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            <input type="checkbox" checked={penting} onChange={(e) => setPenting(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--color-accent)' }} />
            Tandai sebagai penting
          </label>
          <button type="submit" disabled={sending} className="btn btn-primary" style={{ justifyContent: 'center' }}>
            {sending ? <><div className="spinner" /> Mengirim...</> : <><i className="ri-send-plane-line" /> Posting</>}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="animate-fade-up delay-2">
        {pengumumanList.length === 0 ? (
          <div className="card">
            <EmptyState icon="ri-megaphone-line" title="Belum ada pengumuman" description="Buat pengumuman pertama di atas" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pengumumanList.map(p => (
              <div key={p.id} className={`card${p.penting ? ' announcement-card penting' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      {p.penting && <i className="ri-pushpin-fill" style={{ color: 'var(--color-accent)', fontSize: '14px' }} />}
                      <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{p.judul}</p>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 6px', lineHeight: 1.5 }}>{p.isi}</p>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>
                      {new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <button onClick={() => setDeleteId(p.id)} className="btn btn-ghost" style={{ color: 'var(--color-danger)', flexShrink: 0 }}>
                    <i className="ri-delete-bin-line" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Pengumuman?" size="sm">
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>
          Pengumuman yang dihapus tidak bisa dikembalikan.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setDeleteId(null)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Batal</button>
          <button onClick={handleHapus} className="btn btn-danger btn-sm" style={{ flex: 1 }}>
            <i className="ri-delete-bin-line" /> Hapus
          </button>
        </div>
      </Modal>
    </>
  )
}
