'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/Toast'
import StatusBadge from '@/components/StatusBadge'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import { SkeletonDashboard } from '@/components/Skeleton'

function statusTampilan(t) {
  if (!t.pembayaran) return 'Belum Bayar'
  if (t.pembayaran.status === 'PENDING') return 'Pending'
  if (t.pembayaran.status === 'SUCCESS') return 'Lunas'
  return 'Belum Bayar'
}

export default function AdminDashboard() {
  const { user } = useAuth('ADMIN')
  const toast = useToast()
  const [tagihanList, setTagihanList] = useState([])
  const [pengeluaran, setPengeluaran] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [inputKeperluan, setInputKeperluan] = useState('')
  const [inputNominal, setInputNominal] = useState('')
  const [sumberDana, setSumberDana] = useState('Cash')
  const [confirmApprove, setConfirmApprove] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const ambilData = async () => {
    try {
      const [tRes, pRes] = await Promise.all([
        fetch('/api/tagihan'),
        fetch('/api/pengeluaran'),
      ])
      if (tRes.ok) { const d = await tRes.json(); setTagihanList(d.tagihan || []) }
      if (pRes.ok) { const d = await pRes.json(); setPengeluaran(d.riwayatPengeluaran || []) }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => { if (user) ambilData() }, [user])

  const handleSetujui = async (pembayaranId) => {
    setConfirmApprove(null)
    try {
      const res = await fetch('/api/pembayaran', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pembayaranId }),
      })
      if (res.ok) {
        toast.success('Pembayaran disetujui!')
        ambilData()
      } else {
        toast.error('Gagal menyetujui pembayaran')
      }
    } catch { toast.error('Gagal menyetujui') }
  }

  const handleTambahPengeluaran = async (e) => {
    e.preventDefault()
    if (!inputKeperluan || !inputNominal) return
    try {
      const res = await fetch('/api/pengeluaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keperluan: inputKeperluan, nominal: parseInt(inputNominal), sumber: sumberDana }),
      })
      if (res.ok) {
        setInputKeperluan('')
        setInputNominal('')
        toast.success('Pengeluaran tercatat!')
        ambilData()
      }
    } catch { toast.error('Gagal mencatat pengeluaran') }
  }

  const handleHapusPengeluaran = async (id) => {
    if (!confirm('Yakin ingin membatalkan pengeluaran ini? Data yang sudah dihapus tidak bisa dikembalikan.')) return
    try {
      const res = await fetch('/api/pengeluaran', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) { toast.info('Pengeluaran dibatalkan'); ambilData() }
    } catch { toast.error('Gagal membatalkan') }
  }

  if (!user || loadingData) return <SkeletonDashboard />

  const tagihanLunas = tagihanList.filter(t => statusTampilan(t) === 'Lunas')
  const masukTunai = tagihanLunas.filter(t => t.pembayaran?.metodeBayar === 'Tunai').reduce((s, t) => s + t.jumlah, 0)
  const masukQris = tagihanLunas.filter(t => t.pembayaran?.metodeBayar === 'QRIS Gateway').reduce((s, t) => s + t.jumlah, 0)
  const keluarTunai = pengeluaran.filter(p => p.sumber === 'Cash').reduce((s, p) => s + p.nominal, 0)
  const keluarQris = pengeluaran.filter(p => p.sumber === 'Transfer').reduce((s, p) => s + p.nominal, 0)
  const kasUangTunai = masukTunai - keluarTunai
  const kasSaldoQris = masukQris - keluarQris
  const totalSaldo = kasUangTunai + kasSaldoQris

  const pendingList = tagihanList.filter(t => statusTampilan(t) === 'Pending')

  const tagihanTersaring = tagihanList.filter(t =>
    t.user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user.noRumah.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: '24px' }}>
        <p className="label-small" style={{ marginBottom: '4px' }}>Tirta Asri Residence</p>
        <h1 className="section-title" style={{ fontSize: '26px' }}>Dashboard Pengurus</h1>
        <p className="section-subtitle">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="animate-fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div className="stat-card stat-card-dark">
          <p className="stat-label" style={{ color: '#5a9e8a' }}><i className="ri-wallet-3-line" /> Total Saldo</p>
          <p className="stat-value">Rp {totalSaldo.toLocaleString('id-ID')}</p>
          <p className="stat-footnote" style={{ color: '#4a7a68' }}>Cash + QRIS</p>
        </div>
        <div className="stat-card stat-card-light">
          <p className="stat-label"><i className="ri-money-dollar-circle-line" /> Kas Tunai</p>
          <p className="stat-value">Rp {kasUangTunai.toLocaleString('id-ID')}</p>
          <p className="stat-footnote">Uang fisik</p>
        </div>
        <div className="stat-card stat-card-light">
          <p className="stat-label"><i className="ri-qr-code-line" /> Saldo QRIS</p>
          <p className="stat-value">Rp {kasSaldoQris.toLocaleString('id-ID')}</p>
          <p className="stat-footnote">Rekening digital</p>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingList.length > 0 && (
        <div className="card animate-fade-up delay-2" style={{ marginBottom: '16px', borderColor: 'var(--color-warning)' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 12px' }}>
            <i className="ri-time-line" style={{ color: 'var(--color-warning)', marginRight: '6px' }} />
            Menunggu Persetujuan ({pendingList.length})
          </p>
          {pendingList.map(t => (
            <div key={t.id} className="card-flat" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{t.user.nama}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                  Blok {t.user.noRumah} · {t.bulan} {t.tahun} · {t.pembayaran?.metodeBayar} · Rp {t.jumlah.toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => setConfirmApprove(t)}
                className="btn btn-primary btn-sm"
              >
                <i className="ri-check-line" /> Setujui
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pengeluaran Form */}
      <div className="card animate-fade-up delay-3" style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 14px' }}>
          <i className="ri-arrow-up-circle-line" style={{ color: 'var(--color-danger)', marginRight: '6px' }} />
          Input Pengeluaran
        </p>
        <form onSubmit={handleTambahPengeluaran} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Keperluan pengeluaran" value={inputKeperluan} onChange={(e) => setInputKeperluan(e.target.value)} className="input-field" required />
          <input type="text" inputMode="numeric" placeholder="Nominal (Rp)" value={inputNominal} onChange={(e) => setInputNominal(e.target.value.replace(/\D/g, ''))} className="input-field" required />
          <div>
            <label className="form-label">Sumber Dana</label>
            <select value={sumberDana} onChange={(e) => setSumberDana(e.target.value)} className="select-field">
              <option value="Cash">Uang Tunai / Cash</option>
              <option value="Transfer">Rekening / Hasil QRIS</option>
            </select>
          </div>
          <button type="submit" className="btn btn-danger" style={{ justifyContent: 'center' }}>
            <i className="ri-subtract-line" /> Catat Pengeluaran
          </button>
        </form>

        {pengeluaran.length > 0 && (
          <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed var(--color-border-light)' }}>
            {pengeluaran.slice(0, 5).map(exp => (
              <div key={exp.id} className="card-flat" style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)', margin: 0 }}>{exp.keperluan}</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-danger)', margin: '2px 0 0' }}>
                    - Rp {exp.nominal.toLocaleString('id-ID')}
                    <span className="badge badge-neutral" style={{ marginLeft: '6px', fontSize: '10px' }}>{exp.sumber}</span>
                  </p>
                  <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                    {new Date(exp.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <button onClick={() => handleHapusPengeluaran(exp.id)} className="btn btn-ghost" style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Batalkan
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Tagihan with Search */}
      <div className="animate-fade-up delay-4">
        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Cari nama atau nomor rumah warga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ background: 'var(--color-card)' }}
          />
        </div>

        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 12px' }}>
          Semua Tagihan Warga
        </p>

        {tagihanTersaring.length === 0 ? (
          <div className="card">
            <EmptyState icon="ri-search-line" title="Tidak ditemukan" description="Coba kata kunci lain" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tagihanTersaring.map(t => {
              const status = statusTampilan(t)
              return (
                <div key={t.id} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{t.user.nama}</p>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '10px' }}>Blok {t.user.noRumah}</span>
                        {t.pembayaran && <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{t.pembayaran.metodeBayar}</span>}
                      </div>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  <div className="divider" />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>{t.bulan} {t.tahun}</p>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: '2px 0 0' }}>Rp {t.jumlah.toLocaleString('id-ID')}</p>
                    </div>
                    {status === 'Pending' && (
                      <button onClick={() => setConfirmApprove(t)} className="btn btn-primary btn-sm">
                        <i className="ri-check-line" /> Setujui
                      </button>
                    )}
                    {status === 'Lunas' && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Valid ✓</span>}
                    {status === 'Belum Bayar' && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Menunggu warga</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <Modal isOpen={!!confirmApprove} onClose={() => setConfirmApprove(null)} title="Konfirmasi Persetujuan" size="sm">
        {confirmApprove && (
          <>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 16px' }}>
              Setujui pembayaran dari <strong>{confirmApprove.user.nama}</strong> (Blok {confirmApprove.user.noRumah})?
            </p>
            <div className="card-flat" style={{ marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '14px' }}>{confirmApprove.bulan} {confirmApprove.tahun}</p>
              <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 600, color: 'var(--color-text)' }}>
                Rp {confirmApprove.jumlah.toLocaleString('id-ID')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setConfirmApprove(null)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>Batal</button>
              <button onClick={() => handleSetujui(confirmApprove.pembayaran.id)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                <i className="ri-check-double-line" /> Setujui
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  )
}