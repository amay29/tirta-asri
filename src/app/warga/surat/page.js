'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/Toast'
import StatusBadge from '@/components/StatusBadge'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import { SkeletonList } from '@/components/Skeleton'
import Link from 'next/link'

const JENIS_SURAT = [
  'Surat Keterangan Domisili',
  'Surat Keterangan Tidak Mampu',
  'Surat Pengantar RT',
  'Surat Keterangan Usaha',
]

export default function SuratWarga() {
  const { user } = useAuth('WARGA')
  const toast = useToast()
  const [suratList, setSuratList] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [jenisSurat, setJenisSurat] = useState(JENIS_SURAT[0])
  const [keterangan, setKeterangan] = useState('')
  const [mengirim, setMengirim] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const ambilSurat = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/surat?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setSuratList(data.surat || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (user) ambilSurat()
  }, [user])

  const handleAjukan = async () => {
    setShowConfirm(false)
    setMengirim(true)
    try {
      const res = await fetch('/api/surat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, jenisSurat, keterangan }),
      })
      if (res.ok) {
        setKeterangan('')
        ambilSurat()
        toast.success('Pengajuan surat berhasil dikirim!')
      } else {
        toast.error('Gagal mengajukan surat')
      }
    } catch {
      toast.error('Gagal mengirim pengajuan')
    } finally {
      setMengirim(false)
    }
  }

  const badgeLabel = (s) => {
    if (s === 'SELESAI') return 'Selesai'
    if (s === 'DIPROSES') return 'Diproses'
    if (s === 'DITOLAK') return 'Ditolak'
    return 'Menunggu'
  }

  if (!user || loadingData) return <SkeletonList count={2} />

  return (
    <>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <p className="label-small" style={{ marginBottom: '4px' }}>Tirta Asri Residence</p>
          <h1 className="section-title">Pengajuan Surat</h1>
        </div>
        <Link href="/warga" className="btn btn-ghost" style={{ flexShrink: 0 }}>
          <i className="ri-arrow-left-line" /> Kembali
        </Link>
      </div>

      {/* Form */}
      <div className="card animate-fade-up delay-1" style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 16px' }}>
          <i className="ri-add-line" style={{ marginRight: '6px' }} />
          Ajukan Surat Baru
        </p>

        <div style={{ marginBottom: '14px' }}>
          <label className="form-label">Jenis Surat</label>
          <select value={jenisSurat} onChange={(e) => setJenisSurat(e.target.value)} className="select-field">
            {JENIS_SURAT.map(j => <option key={j} value={j}>{j}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '4px' }}>
          <label className="form-label">Keterangan (opsional)</label>
          <textarea
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="textarea-field"
            placeholder="Jelaskan keperluan surat ini..."
            rows={3}
          />
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          disabled={mengirim}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
        >
          {mengirim ? <><div className="spinner" /> Mengirim...</> : <>Ajukan Surat <i className="ri-send-plane-line" /></>}
        </button>
      </div>

      {/* Riwayat */}
      <div className="animate-fade-up delay-2">
        <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 12px' }}>Riwayat Pengajuan</p>

        {suratList.length === 0 ? (
          <div className="card">
            <EmptyState icon="ri-file-text-line" title="Belum ada pengajuan" description="Surat yang Anda ajukan akan muncul di sini" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {suratList.map(s => (
              <div key={s.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: s.keterangan ? '8px' : 0 }}>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{s.jenisSurat}</p>
                  <StatusBadge status={s.status} />
                </div>
                {s.keterangan && (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 8px', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{s.keterangan}</p>
                )}
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                  <i className="ri-calendar-line" style={{ marginRight: '4px' }} />
                  Diajukan {new Date(s.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {s.status === 'SELESAI' && (
                  <a href={s.filePdf || `/cetak/surat/${s.id}`} target="_blank" rel="noopener noreferrer"
                    className="btn btn-primary btn-sm" style={{ marginTop: '10px', justifyContent: 'center', width: '100%' }}>
                    <i className="ri-printer-line" /> Lihat & Cetak Surat
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Konfirmasi Pengajuan" size="sm">
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '0 0 8px', lineHeight: 1.5 }}>
          Anda akan mengajukan:
        </p>
        <div className="card-flat" style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{jenisSurat}</p>
          {keterangan && <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>{keterangan}</p>}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowConfirm(false)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Batal</button>
          <button onClick={handleAjukan} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
            <i className="ri-check-line" /> Kirim
          </button>
        </div>
      </Modal>
    </>
  )
}