'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/Toast'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import { SkeletonList } from '@/components/Skeleton'

const STATUS_OPSI = ['PENDING', 'DIPROSES', 'SELESAI', 'DITOLAK']

export default function SuratAdmin() {
  const { user } = useAuth('ADMIN')
  const toast = useToast()
  const [suratList, setSuratList] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [filterStatus, setFilterStatus] = useState('Semua')

  const ambilSurat = async () => {
    try {
      const res = await fetch('/api/surat')
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

  useEffect(() => { if (user) ambilSurat() }, [user])

  const handleUbahStatus = async (id, statusBaru) => {
    try {
      const res = await fetch('/api/surat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: statusBaru }),
      })
      if (res.ok) {
        toast.success('Status surat diperbarui')
        ambilSurat()
      }
    } catch { toast.error('Gagal mengubah status') }
  }

  if (!user || loadingData) return <SkeletonList count={3} />

  const filters = ['Semua', ...STATUS_OPSI]
  const suratFiltered = filterStatus === 'Semua' ? suratList : suratList.filter(s => s.status === filterStatus)

  return (
    <>
      <div className="animate-fade-up" style={{ marginBottom: '24px' }}>
        <p className="label-small" style={{ marginBottom: '4px' }}>Tirta Asri Residence</p>
        <h1 className="section-title">Surat Masuk</h1>
        <p className="section-subtitle">{suratList.length} pengajuan total</p>
      </div>

      <div className="animate-fade-up delay-1 hide-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '16px' }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className={`btn-pill${filterStatus === f ? ' active' : ''}`}
          >
            {f === 'Semua' ? 'Semua' : f === 'PENDING' ? 'Menunggu' : f === 'DIPROSES' ? 'Diproses' : f === 'SELESAI' ? 'Selesai' : 'Ditolak'}
          </button>
        ))}
      </div>

      <div className="animate-fade-up delay-2">
        {suratFiltered.length === 0 ? (
          <div className="card">
            <EmptyState icon="ri-file-text-line" title="Tidak ada surat" description="Belum ada pengajuan untuk filter ini" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {suratFiltered.map(s => (
              <div key={s.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{s.jenisSurat}</p>
                    <span className="badge badge-neutral" style={{ fontSize: '10px', marginTop: '4px' }}>
                      {s.user.nama} — Blok {s.user.noRumah}
                    </span>
                  </div>
                  <StatusBadge status={s.status} />
                </div>

                {s.keterangan && (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 10px', lineHeight: 1.5 }}>{s.keterangan}</p>
                )}

                <div className="divider" />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                    <i className="ri-calendar-line" style={{ marginRight: '4px' }} />
                    {new Date(s.createdAt).toLocaleDateString('id-ID')}
                  </p>
                  <select
                    value={s.status}
                    onChange={(e) => handleUbahStatus(s.id, e.target.value)}
                    className="select-field"
                    style={{ width: 'auto', minWidth: '130px', minHeight: '36px', padding: '8px 32px 8px 12px', fontSize: '12px' }}
                  >
                    {STATUS_OPSI.map(opt => (
                      <option key={opt} value={opt}>
                        {opt === 'PENDING' ? 'Menunggu' : opt === 'DIPROSES' ? 'Diproses' : opt === 'SELESAI' ? 'Selesai' : 'Ditolak'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}