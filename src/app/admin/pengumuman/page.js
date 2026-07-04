'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/Toast'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import { SkeletonList } from '@/components/Skeleton'

const ROLE_LABELS = {
  ADMIN_IURAN: 'Admin Iuran',
  ADMIN_RT: 'Ketua RT',
}

export default function PengumumanAdmin() {
  const { user } = useAuth(['ADMIN_IURAN', 'ADMIN_RT'])
  const toast = useToast()
  const [pengumumanList, setPengumumanList] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  
  // State untuk form buat baru
  const [judul, setJudul] = useState('')
  const [isi, setIsi] = useState('')
  const [foto, setFoto] = useState(null)
  const [fotoPreview, setFotoPreview] = useState('')
  const [penting, setPenting] = useState(false)
  const [sending, setSending] = useState(false)
  
  // State untuk edit pengumuman
  const [editId, setEditId] = useState(null)
  const [editJudul, setEditJudul] = useState('')
  const [editIsi, setEditIsi] = useState('')
  const [editFoto, setEditFoto] = useState(null)
  const [editFotoPreview, setEditFotoPreview] = useState('')
  const [editPenting, setEditPenting] = useState(false)
  const [updating, setUpdating] = useState(false)
  
  // State untuk delete
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

  const handleFotoChange = (e, isEdit = false) => {
    const file = e.target.files[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    if (isEdit) {
      setEditFoto(file)
      setEditFotoPreview(preview)
    } else {
      setFoto(file)
      setFotoPreview(preview)
    }
  }

  const uploadFoto = async (fileObj) => {
    if (!fileObj) return null
    const fd = new FormData()
    fd.append('file', fileObj)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const data = await res.json()
      return data.url
    }
    return null
  }

  const handleBuat = async (e) => {
    e.preventDefault()
    if (!judul || !isi) return
    setSending(true)
    try {
      let uploadedUrl = null
      if (foto) {
        uploadedUrl = await uploadFoto(foto)
      }
      const res = await fetch('/api/pengumuman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul,
          isi,
          foto: uploadedUrl,
          penting,
          pembuatRole: user.role,
          pembuatNama: user.nama,
        }),
      })
      if (res.ok) {
        setJudul('')
        setIsi('')
        setFoto(null)
        setFotoPreview('')
        setPenting(false)
        toast.success('Pengumuman berhasil dibuat!')
        ambilData()
      }
    } catch { toast.error('Gagal membuat pengumuman') }
    finally { setSending(false) }
  }

  const handleMulaiEdit = (p) => {
    setEditId(p.id)
    setEditJudul(p.judul)
    setEditIsi(p.isi)
    setEditPenting(p.penting)
    setEditFoto(null)
    setEditFotoPreview(p.foto || '')
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editJudul || !editIsi) return
    setUpdating(true)
    try {
      let uploadedUrl = editFotoPreview
      if (editFoto) {
        uploadedUrl = await uploadFoto(editFoto)
      }
      const res = await fetch('/api/pengumuman', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, judul: editJudul, isi: editIsi, foto: uploadedUrl, penting: editPenting }),
      })
      if (res.ok) {
        toast.success('Pengumuman berhasil diperbarui!')
        setEditId(null)
        ambilData()
      } else {
        toast.error('Gagal memperbarui pengumuman')
      }
    } catch {
      toast.error('Terjadi kesalahan koneksi')
    } finally {
      setUpdating(false)
    }
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

      {/* Form Buat */}
      <form onSubmit={handleBuat} className="card animate-fade-up delay-1" style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 14px' }}>
          <i className="ri-megaphone-line" style={{ marginRight: '6px', color: 'var(--color-accent)' }} />
          Buat Pengumuman Baru
          <span className="badge badge-accent" style={{ marginLeft: '8px', fontSize: '10px' }}>
            {ROLE_LABELS[user.role] || user.role}
          </span>
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Judul pengumuman" value={judul} onChange={(e) => setJudul(e.target.value)} className="input-field" required />
          <textarea placeholder="Isi pengumuman..." value={isi} onChange={(e) => setIsi(e.target.value)} className="textarea-field" rows={3} required />
          
          <div>
            <label className="form-label" style={{ fontSize: '13px' }}><i className="ri-image-add-line" /> Foto (Opsional)</label>
            <input type="file" accept="image/*" onChange={(e) => handleFotoChange(e, false)} className="input-field" style={{ padding: '8px' }} />
            {fotoPreview && (
              <div style={{ marginTop: '8px', borderRadius: '8px', overflow: 'hidden', height: '120px', width: '200px', background: '#eee' }}>
                <img src={fotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

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
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      {p.penting && <i className="ri-pushpin-fill" style={{ color: 'var(--color-accent)', fontSize: '14px' }} />}
                      <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{p.judul}</p>
                    </div>
                    {p.foto && (
                      <div style={{ marginBottom: '8px', borderRadius: '8px', overflow: 'hidden', width: '120px', height: '80px', background: '#eee', flexShrink: 0 }}>
                        <img src={p.foto} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 6px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{p.isi}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>
                        {new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      {p.pembuatRole && (
                        <span
                          className="badge"
                          style={{
                            fontSize: '9px',
                            background: p.pembuatRole === 'ADMIN_RT' ? 'var(--color-primary)' : 'var(--color-accent)',
                            color: '#fff',
                          }}
                        >
                          {ROLE_LABELS[p.pembuatRole] || p.pembuatRole}
                          {p.pembuatNama ? ` · ${p.pembuatNama}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    {/* Tombol Edit */}
                    <button onClick={() => handleMulaiEdit(p)} className="btn btn-ghost" style={{ color: 'var(--color-text-muted)', padding: '8px' }}>
                      <i className="ri-edit-line" />
                    </button>
                    {/* Tombol Hapus */}
                    <button onClick={() => setDeleteId(p.id)} className="btn btn-ghost" style={{ color: 'var(--color-danger)', padding: '8px' }}>
                      <i className="ri-delete-bin-line" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={!!editId} onClose={() => setEditId(null)} title="Edit Pengumuman" size="sm">
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="form-label">Judul Pengumuman</label>
            <input type="text" value={editJudul} onChange={(e) => setEditJudul(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="form-label">Isi Pengumuman</label>
            <textarea value={editIsi} onChange={(e) => setEditIsi(e.target.value)} className="textarea-field" rows={4} required />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '13px' }}><i className="ri-image-add-line" /> Foto (Opsional)</label>
            <input type="file" accept="image/*" onChange={(e) => handleFotoChange(e, true)} className="input-field" style={{ padding: '8px' }} />
            {editFotoPreview && (
              <div style={{ marginTop: '8px', borderRadius: '8px', overflow: 'hidden', height: '120px', width: '200px', background: '#eee' }}>
                <img src={editFotoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-secondary)', cursor: 'pointer', margin: '4px 0' }}>
            <input type="checkbox" checked={editPenting} onChange={(e) => setEditPenting(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--color-accent)' }} />
            Tandai sebagai penting
          </label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="button" onClick={() => setEditId(null)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Batal</button>
            <button type="submit" disabled={updating} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
              {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Pengumuman?" size="sm">
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
          Pengumuman yang dihapus tidak bisa dikembalikan.
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setDeleteId(null)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Batal</button>
          <button onClick={handleHapus} className="btn btn-danger btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
            <i className="ri-delete-bin-line" /> Hapus
          </button>
        </div>
      </Modal>
    </>
  )
}
