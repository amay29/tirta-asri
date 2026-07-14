'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/Toast'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'
import { SkeletonList } from '@/components/Skeleton'
import Link from 'next/link'
import TopNav from '@/components/TopNav'

const STATUS_OPSI = ['PENDING', 'DIPROSES', 'SELESAI', 'DITOLAK']

const DEFAULT_TEMPLATES = {
  'Surat Keterangan Domisili': (nama, noRumah, id, tahun) =>
    `SURAT KETERANGAN DOMISILI\nNo: ${String(id).padStart(3, '0')}/RT-TA/${tahun}\n\nDengan ini menerangkan bahwa yang tersebut di bawah ini:\n\nNama: ${nama}\nAlamat: Perumahan Tirta Asri Residence, Blok ${noRumah}\n\nBenar-benar berdomisili di alamat tersebut di atas.\n\nDemikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.`,
  'Surat Keterangan Tidak Mampu': (nama, noRumah, id, tahun) =>
    `SURAT KETERANGAN TIDAK MAMPU\nNo: ${String(id).padStart(3, '0')}/RT-TA/${tahun}\n\nDengan ini menerangkan bahwa:\n\nNama: ${nama}\nAlamat: Perumahan Tirta Asri Residence, Blok ${noRumah}\n\nBerdasarkan pengamatan kami, yang bersangkutan termasuk keluarga yang kurang mampu.\n\nDemikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.`,
  'Surat Pengantar RT': (nama, noRumah, id, tahun) =>
    `SURAT PENGANTAR RT\nNo: ${String(id).padStart(3, '0')}/RT-TA/${tahun}\n\nDengan ini memberikan pengantar kepada:\n\nNama: ${nama}\nAlamat: Perumahan Tirta Asri Residence, Blok ${noRumah}\n\nYang bersangkutan adalah benar warga kami yang berdomisili di lingkungan RT kami.\n\nDemikian surat pengantar ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.`,
  'Surat Keterangan Usaha': (nama, noRumah, id, tahun) =>
    `SURAT KETERANGAN USAHA\nNo: ${String(id).padStart(3, '0')}/RT-TA/${tahun}\n\nDengan ini menerangkan bahwa:\n\nNama: ${nama}\nAlamat: Perumahan Tirta Asri Residence, Blok ${noRumah}\n\nBerdasarkan data yang ada, yang bersangkutan memiliki usaha dan berdomisili di wilayah kami.\n\nDemikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.`,
}

export default function SuratAdmin() {
  const { user } = useAuth('ADMIN_RT')
  const toast = useToast()
  const [suratList, setSuratList] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [filterStatus, setFilterStatus] = useState('Semua')

  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [menyimpanId, setMenyimpanId] = useState(null)

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
      const body = { id, status: statusBaru }
      if (statusBaru === 'SELESAI') {
        body.filePdf = `/cetak/surat/${id}`
      }

      const res = await fetch('/api/surat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success(statusBaru === 'SELESAI' ? 'Surat selesai & siap dicetak!' : 'Status surat diperbarui')
        ambilSurat()
      }
    } catch { toast.error('Gagal mengubah status') }
  }

  const mulaiEdit = (s) => {
    setEditingId(s.id)
    if (s.isiSurat) {
      setEditContent(s.isiSurat)
    } else {
      const templateFn = DEFAULT_TEMPLATES[s.jenisSurat] || DEFAULT_TEMPLATES['Surat Pengantar RT']
      const tahun = new Date(s.createdAt).getFullYear()
      setEditContent(templateFn(s.user.nama, s.user.noRumah, s.id, tahun))
    }
  }

  const simpanIsiSurat = async (id) => {
    setMenyimpanId(id)
    try {
      const res = await fetch('/api/surat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isiSurat: editContent }),
      })
      if (res.ok) {
        toast.success('Isi draf surat berhasil disimpan')
        setEditingId(null)
        ambilSurat()
      } else {
        toast.error('Gagal menyimpan isi surat')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setMenyimpanId(null)
    }
  }

  if (!user || loadingData) return <SkeletonList count={3} />

  const filters = ['Semua', ...STATUS_OPSI]
  const suratFiltered = filterStatus === 'Semua' ? suratList : suratList.filter(s => s.status === filterStatus)
  const pendingCount = suratList.filter(s => s.status === 'PENDING').length

  return (
    <>
      <TopNav title="Surat Masuk" />
      <div className="animate-fade-up" style={{ marginBottom: '24px' }}>
        <p className="label-small" style={{ marginBottom: '4px' }}>Tirta Asri Residence</p>
        <h1 className="section-title">Surat Masuk</h1>
        <p className="section-subtitle">
          {suratList.length} pengajuan total
          {pendingCount > 0 && <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}> · {pendingCount} menunggu</span>}
        </p>
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
                  <div style={{ background: 'var(--color-bg)', padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: '12px' }}>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '0 0 4px', fontWeight: 600 }}>Keterangan dari Warga:</p>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{s.keterangan}</p>
                  </div>
                )}
                {editingId === s.id ? (
                  <div style={{ marginTop: '10px', marginBottom: '14px' }}>
                    <label className="form-label" style={{ fontSize: '12px', marginBottom: '6px' }}>Edit Isi Dokumen Sebelum Dicetak:</label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="textarea-field"
                      rows={6}
                      style={{ fontSize: '13px', fontFamily: 'monospace', lineHeight: 1.5, background: '#faf8f4' }}
                    />
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditingId(null)} className="btn btn-secondary btn-sm" style={{ minHeight: '36px', padding: '6px 12px', fontSize: '12px' }}>
                        Batal
                      </button>
                      <button
                        onClick={() => simpanIsiSurat(s.id)}
                        disabled={menyimpanId === s.id}
                        className="btn btn-primary btn-sm"
                        style={{ minHeight: '36px', padding: '6px 12px', fontSize: '12px' }}
                      >
                        {menyimpanId === s.id ? 'Menyimpan...' : 'Simpan Draf'}
                      </button>
                    </div>
                  </div>
                ) : (
                  s.isiSurat && (
                    <div style={{ border: '1px dashed var(--color-border-light)', padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: '12px', background: '#fafaf9' }}>
                      <p style={{ fontSize: '11px', color: 'var(--color-primary)', margin: '0 0 4px', fontWeight: 600 }}>Draf Isi Surat (Telah Diedit):</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.4 }}>{s.isiSurat}</p>
                    </div>
                  )
                )}

                <div className="divider" />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', gap: '8px', flexWrap: 'wrap' }}>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                    <i className="ri-calendar-line" style={{ marginRight: '4px' }} />
                    {new Date(s.createdAt).toLocaleDateString('id-ID')}
                  </p>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {editingId !== s.id && (
                      <button
                        onClick={() => mulaiEdit(s)}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <i className="ri-edit-line" /> {s.isiSurat ? 'Edit Draf' : 'Tulis/Edit'}
                      </button>
                    )}
                    {(s.status === 'SELESAI' || s.status === 'DIPROSES') && (
                      <Link
                        href={`/cetak/surat/${s.id}`}
                        target="_blank"
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-primary)', fontSize: '12px' }}
                      >
                        <i className="ri-printer-line" /> Cetak
                      </Link>
                    )}

                    <select
                      value={s.status}
                      onChange={(e) => handleUbahStatus(s.id, e.target.value)}
                      className="select-field"
                      style={{ width: 'auto', minWidth: '120px', minHeight: '36px', padding: '8px 32px 8px 12px', fontSize: '12px' }}
                    >
                      {STATUS_OPSI.map(opt => (
                        <option key={opt} value={opt}>
                          {opt === 'PENDING' ? 'Menunggu' : opt === 'DIPROSES' ? 'Diproses' : opt === 'SELESAI' ? 'Selesai' : 'Ditolak'}
                        </option>
                      ))}
                    </select>
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