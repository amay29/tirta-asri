'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/Toast'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import { SkeletonList } from '@/components/Skeleton'
import TopNav from '@/components/TopNav'

function statusTampilan(t) {
  if (!t.pembayaran) return 'Belum Bayar'
  if (t.pembayaran.status === 'PENDING') return 'Pending'
  if (t.pembayaran.status === 'SUCCESS') return 'Lunas'
  return 'Belum Bayar'
}

const BULAN_LIST = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

export default function KelolaWarga() {
  const { user } = useAuth(['ADMIN_IURAN', 'ADMIN_RT'])
  const toast = useToast()
  const [wargaList, setWargaList] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showTagihanModal, setShowTagihanModal] = useState(false)
  const [selectedWarga, setSelectedWarga] = useState(null)

  const [bulanBaru, setBulanBaru] = useState(BULAN_LIST[new Date().getMonth()])
  const [tahunBaru, setTahunBaru] = useState(new Date().getFullYear())
  const [jumlahBaru, setJumlahBaru] = useState('50000')
  const [deadlineBaru, setDeadlineBaru] = useState('')
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)

  const [showWargaModal, setShowWargaModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formWarga, setFormWarga] = useState({ id: '', nama: '', noRumah: '', pin: '' })

  const ambilWarga = async () => {
    try {
      const res = await fetch('/api/warga')
      if (res.ok) {
        const data = await res.json()
        setWargaList(data.warga || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => { if (user) ambilWarga() }, [user])

  const handleSimpanWarga = async () => {
    if (!formWarga.nama || !formWarga.noRumah) return toast.error('Nama dan Nomor Rumah wajib diisi')
    if (!editMode && (!formWarga.pin || formWarga.pin.length !== 6)) return toast.error('PIN 6 angka wajib diisi')

    const url = '/api/warga'
    const method = editMode ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formWarga),
      })
      if (res.ok) {
        toast.success(editMode ? 'Warga diperbarui' : 'Warga berhasil ditambahkan')
        setShowWargaModal(false)
        ambilWarga()
      } else {
        const d = await res.json()
        toast.error(d.pesan || 'Gagal menyimpan warga')
      }
    } catch {
      toast.error('Gagal menyimpan warga')
    }
  }

  const handleHapusWarga = async (id, nama) => {
    if (!confirm(`Yakin ingin menghapus warga ${nama}?`)) return
    try {
      const res = await fetch('/api/warga', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        toast.success('Warga berhasil dihapus')
        ambilWarga()
      } else {
        toast.error('Gagal menghapus warga')
      }
    } catch {
      toast.error('Gagal menghapus warga')
    }
  }

  const bukaModalTambah = () => {
    setEditMode(false)
    setFormWarga({ id: '', nama: '', noRumah: '', pin: '' })
    setShowWargaModal(true)
  }

  const bukaModalEdit = (w) => {
    setEditMode(true)
    setFormWarga({ id: w.id, nama: w.nama, noRumah: w.noRumah, pin: '' })
    setShowWargaModal(true)
  }

  const handleBuatTagihan = async () => {
    if (!selectedWarga) return
    try {
      const res = await fetch('/api/tagihan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedWarga.id, bulan: bulanBaru, tahun: tahunBaru, jumlah: parseInt(jumlahBaru), deadline: deadlineBaru || null }),
      })
      if (res.ok) {
        toast.success(`Tagihan ${bulanBaru} untuk ${selectedWarga.nama} dibuat!`)
        setShowTagihanModal(false)
        ambilWarga()
      } else {
        const d = await res.json()
        toast.error(d.pesan || 'Gagal membuat tagihan')
      }
    } catch { toast.error('Gagal membuat tagihan') }
  }

  const handleBulkTagihan = async () => {
    setBulkLoading(true)
    let berhasil = 0
    for (const w of wargaList) {
      try {
        const res = await fetch('/api/tagihan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: w.id, bulan: bulanBaru, tahun: tahunBaru, jumlah: parseInt(jumlahBaru), deadline: deadlineBaru || null }),
        })
        if (res.ok) berhasil++
      } catch {}
    }
    setBulkLoading(false)
    setShowBulkModal(false)
    toast.success(`${berhasil} tagihan berhasil dibuat!`)
    ambilWarga()
  }

  if (!user || loadingData) return <SkeletonList count={3} />

  const filtered = wargaList.filter(w =>
    w.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.noRumah.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <TopNav title="Kelola Warga" />
      <div className="animate-fade-up" style={{ marginBottom: '24px' }}>
        <p className="label-small" style={{ marginBottom: '4px' }}>Tirta Asri Residence</p>
        <h1 className="section-title">Kelola Warga</h1>
        <p className="section-subtitle">{wargaList.length} warga terdaftar</p>
      </div>

      <div className="animate-fade-up delay-1" style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Cari warga..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field"
          style={{ flex: 1, minWidth: '150px' }}
        />
        {user?.role === 'ADMIN_RT' && (
          <button onClick={bukaModalTambah} className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap' }}>
            <i className="ri-user-add-line" /> Tambah Warga
          </button>
        )}
        <button onClick={() => setShowBulkModal(true)} className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
          <i className="ri-file-add-line" /> Tagihan Massal
        </button>
      </div>

      <div className="animate-fade-up delay-2">
        {filtered.length === 0 ? (
          <div className="card">
            <EmptyState icon="ri-group-line" title="Tidak ditemukan" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(w => {
              const belumBayar = w.tagihan.filter(t => statusTampilan(t) === 'Belum Bayar').length
              const lunas = w.tagihan.filter(t => statusTampilan(t) === 'Lunas').length

              return (
                <div key={w.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{w.nama}</p>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '12px' }}>Blok {w.noRumah}</span>
                        {w.role === 'ADMIN_RT' && <span className="badge badge-primary" style={{ fontSize: '10px' }}>Ketua RT</span>}
                        {w.role === 'ADMIN_IURAN' && <span className="badge badge-accent" style={{ fontSize: '10px' }}>Admin Iuran</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {user?.role === 'ADMIN_RT' && w.role === 'WARGA' && (
                        <div className="dropdown" style={{ position: 'relative' }}>
                          <button
                            onClick={(e) => {
                              const dropdown = e.currentTarget.nextElementSibling
                              dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex'
                            }}
                            className="btn btn-ghost btn-sm"
                          >
                            <i className="ri-more-2-fill" />
                          </button>
                          <div style={{
                            display: 'none', position: 'absolute', right: 0, top: '100%',
                            flexDirection: 'column', background: 'white', borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '120px', overflow: 'hidden'
                          }}>
                            <button onClick={() => bukaModalEdit(w)} className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', borderRadius: 0, fontSize: '14px' }}>
                              <i className="ri-edit-line" /> Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Reset PIN ${w.nama} ke 123456?`)) return
                                try {
                                  const res = await fetch('/api/auth/reset-pin', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ userId: w.id }),
                                  })
                                  if (res.ok) toast.success(`PIN ${w.nama} direset ke 123456`)
                                  else toast.error('Gagal reset PIN')
                                } catch { toast.error('Gagal reset PIN') }
                              }}
                              className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', borderRadius: 0, fontSize: '14px' }}
                            >
                              <i className="ri-lock-unlock-line" /> Reset PIN
                            </button>
                            <button onClick={() => handleHapusWarga(w.id, w.nama)} className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start', borderRadius: 0, fontSize: '14px', color: 'var(--color-danger)' }}>
                              <i className="ri-delete-bin-line" /> Hapus
                            </button>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => { setSelectedWarga(w); setShowTagihanModal(true) }}
                        className="btn btn-primary btn-sm"
                      >
                        <i className="ri-add-line" /> Tagihan
                      </button>
                    </div>
                  </div>
                  <div className="divider" />
                  <div style={{ display: 'flex', gap: '16px', paddingTop: '6px' }}>
                    <div>
                      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>Lunas</p>
                      <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-success)', margin: 0 }}>{lunas}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>Belum Bayar</p>
                      <p style={{ fontSize: '18px', fontWeight: 600, color: belumBayar > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)', margin: 0 }}>{belumBayar}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>Total Tagihan</p>
                      <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{w.tagihan.length}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Modal isOpen={showWargaModal} onClose={() => setShowWargaModal(false)} title={editMode ? 'Edit Data Warga' : 'Tambah Warga Baru'} size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '14px' }}>Nama Warga</label>
            <input type="text" value={formWarga.nama} onChange={(e) => setFormWarga({ ...formWarga, nama: e.target.value })} className="input-field" placeholder="Nama Lengkap" />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '14px' }}>Nomor / Blok Rumah</label>
            <input type="text" value={formWarga.noRumah} onChange={(e) => setFormWarga({ ...formWarga, noRumah: e.target.value })} className="input-field" placeholder="Misal: A1 No 2" />
          </div>
          {!editMode && (
            <div>
              <label className="form-label" style={{ fontSize: '14px' }}>PIN Awal (6 Angka)</label>
              <input type="text" inputMode="numeric" maxLength={6} value={formWarga.pin} onChange={(e) => setFormWarga({ ...formWarga, pin: e.target.value.replace(/\D/g, '') })} className="input-field" placeholder="123456" />
            </div>
          )}
          <button onClick={handleSimpanWarga} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
            <i className="ri-save-line" /> {editMode ? 'Simpan Perubahan' : 'Tambahkan'}
          </button>
        </div>
      </Modal>
      <Modal isOpen={showTagihanModal} onClose={() => setShowTagihanModal(false)} title={`Buat Tagihan — ${selectedWarga?.nama}`} size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '14px' }}>Bulan</label>
            <select value={bulanBaru} onChange={(e) => setBulanBaru(e.target.value)} className="select-field">
              {BULAN_LIST.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '14px' }}>Tahun</label>
            <input type="text" inputMode="numeric" value={tahunBaru} onChange={(e) => setTahunBaru(e.target.value.replace(/\D/g, ''))} className="input-field" />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '14px' }}>Jumlah (Rp)</label>
            <input type="text" inputMode="numeric" value={jumlahBaru} onChange={(e) => setJumlahBaru(e.target.value.replace(/\D/g, ''))} className="input-field" />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '14px' }}>Deadline Pembayaran <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(opsional)</span></label>
            <input type="date" value={deadlineBaru} onChange={(e) => setDeadlineBaru(e.target.value)} className="input-field" min={new Date().toISOString().split('T')[0]} />
          </div>
          <button onClick={handleBuatTagihan} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <i className="ri-check-line" /> Buat Tagihan
          </button>
        </div>
      </Modal>
      <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} title="Tagihan Massal" size="sm">
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
          Buat tagihan untuk <strong>semua {wargaList.length} warga</strong> sekaligus.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="form-label" style={{ fontSize: '14px' }}>Bulan</label>
            <select value={bulanBaru} onChange={(e) => setBulanBaru(e.target.value)} className="select-field">
              {BULAN_LIST.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '14px' }}>Tahun</label>
            <input type="text" inputMode="numeric" value={tahunBaru} onChange={(e) => setTahunBaru(e.target.value.replace(/\D/g, ''))} className="input-field" />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '14px' }}>Jumlah per warga (Rp)</label>
            <input type="text" inputMode="numeric" value={jumlahBaru} onChange={(e) => setJumlahBaru(e.target.value.replace(/\D/g, ''))} className="input-field" />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '14px' }}>Deadline Pembayaran <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(opsional)</span></label>
            <input type="date" value={deadlineBaru} onChange={(e) => setDeadlineBaru(e.target.value)} className="input-field" min={new Date().toISOString().split('T')[0]} />
          </div>
          <button onClick={handleBulkTagihan} disabled={bulkLoading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            {bulkLoading ? <><div className="spinner" /> Memproses...</> : <><i className="ri-file-add-line" /> Buat untuk Semua Warga</>}
          </button>
        </div>
      </Modal>
    </>
  )
}
