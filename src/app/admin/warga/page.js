'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/Toast'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import { SkeletonList } from '@/components/Skeleton'

function statusTampilan(t) {
  if (!t.pembayaran) return 'Belum Bayar'
  if (t.pembayaran.status === 'PENDING') return 'Pending'
  if (t.pembayaran.status === 'SUCCESS') return 'Lunas'
  return 'Belum Bayar'
}

const BULAN_LIST = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

export default function KelolaWarga() {
  const { user } = useAuth('ADMIN')
  const toast = useToast()
  const [wargaList, setWargaList] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showTagihanModal, setShowTagihanModal] = useState(false)
  const [selectedWarga, setSelectedWarga] = useState(null)
  const [bulanBaru, setBulanBaru] = useState(BULAN_LIST[new Date().getMonth()])
  const [tahunBaru, setTahunBaru] = useState(new Date().getFullYear())
  const [jumlahBaru, setJumlahBaru] = useState('50000')
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)

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

  const handleBuatTagihan = async () => {
    if (!selectedWarga) return
    try {
      const res = await fetch('/api/tagihan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedWarga.id, bulan: bulanBaru, tahun: tahunBaru, jumlah: parseInt(jumlahBaru) }),
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
          body: JSON.stringify({ userId: w.id, bulan: bulanBaru, tahun: tahunBaru, jumlah: parseInt(jumlahBaru) }),
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
          style={{ flex: 1, minWidth: '200px' }}
        />
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
                      <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{w.nama}</p>
                      <span className="badge badge-neutral" style={{ fontSize: '10px', marginTop: '4px' }}>Blok {w.noRumah}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
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
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}
                      >
                        <i className="ri-lock-unlock-line" /> Reset PIN
                      </button>
                      <button
                        onClick={() => { setSelectedWarga(w); setShowTagihanModal(true) }}
                        className="btn btn-ghost btn-sm"
                      >
                        <i className="ri-add-line" /> Tagihan
                      </button>
                    </div>
                  </div>
                  <div className="divider" />
                  <div style={{ display: 'flex', gap: '16px', paddingTop: '6px' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>Lunas</p>
                      <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-success)', margin: 0 }}>{lunas}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>Belum</p>
                      <p style={{ fontSize: '16px', fontWeight: 600, color: belumBayar > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)', margin: 0 }}>{belumBayar}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>Total</p>
                      <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{w.tagihan.length}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Single Tagihan Modal */}
      <Modal isOpen={showTagihanModal} onClose={() => setShowTagihanModal(false)} title={`Buat Tagihan — ${selectedWarga?.nama}`} size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="form-label">Bulan</label>
            <select value={bulanBaru} onChange={(e) => setBulanBaru(e.target.value)} className="select-field">
              {BULAN_LIST.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Tahun</label>
            <input type="text" inputMode="numeric" value={tahunBaru} onChange={(e) => setTahunBaru(e.target.value.replace(/\D/g, ''))} className="input-field" />
          </div>
          <div>
            <label className="form-label">Jumlah (Rp)</label>
            <input type="text" inputMode="numeric" value={jumlahBaru} onChange={(e) => setJumlahBaru(e.target.value.replace(/\D/g, ''))} className="input-field" />
          </div>
          <button onClick={handleBuatTagihan} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <i className="ri-check-line" /> Buat Tagihan
          </button>
        </div>
      </Modal>

      {/* Bulk Modal */}
      <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} title="Tagihan Massal" size="sm">
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
          Buat tagihan untuk <strong>semua {wargaList.length} warga</strong> sekaligus.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="form-label">Bulan</label>
            <select value={bulanBaru} onChange={(e) => setBulanBaru(e.target.value)} className="select-field">
              {BULAN_LIST.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Tahun</label>
            <input type="text" inputMode="numeric" value={tahunBaru} onChange={(e) => setTahunBaru(e.target.value.replace(/\D/g, ''))} className="input-field" />
          </div>
          <div>
            <label className="form-label">Jumlah per warga (Rp)</label>
            <input type="text" inputMode="numeric" value={jumlahBaru} onChange={(e) => setJumlahBaru(e.target.value.replace(/\D/g, ''))} className="input-field" />
          </div>
          <button onClick={handleBulkTagihan} disabled={bulkLoading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            {bulkLoading ? <><div className="spinner" /> Memproses...</> : <><i className="ri-file-add-line" /> Buat untuk Semua Warga</>}
          </button>
        </div>
      </Modal>
    </>
  )
}
