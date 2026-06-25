'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/Toast'
import StatusBadge from '@/components/StatusBadge'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import { SkeletonDashboard } from '@/components/Skeleton'
import { QRCodeSVG } from 'qrcode.react'
import Link from 'next/link'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 18) return 'Selamat sore'
  return 'Selamat malam'
}

function statusTampilan(t) {
  if (!t.pembayaran) return 'Belum Bayar'
  if (t.pembayaran.status === 'PENDING') return 'Pending'
  if (t.pembayaran.status === 'SUCCESS') return 'Lunas'
  return 'Belum Bayar'
}

export default function WargaDashboard() {
  const { user } = useAuth('WARGA')
  const toast = useToast()
  const [tagihanList, setTagihanList] = useState([])
  const [pengumuman, setPengumuman] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedTagihan, setSelectedTagihan] = useState(null)
  const [metodePilihan, setMetodePilihan] = useState('QRIS Gateway')
  const [paymentStep, setPaymentStep] = useState('select')

  const ambilData = async () => {
    if (!user) return
    try {
      const [tRes, pRes] = await Promise.all([
        fetch(`/api/tagihan?userId=${user.id}`),
        fetch('/api/pengumuman'),
      ])
      if (tRes.ok) {
        const t = await tRes.json()
        setTagihanList(t.tagihan || [])
      }
      if (pRes.ok) {
        const p = await pRes.json()
        setPengumuman(p.pengumuman || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (user) ambilData()
  }, [user])

  const handleBayar = (tagihan) => {
    setSelectedTagihan(tagihan)
    setMetodePilihan('QRIS Gateway')
    setPaymentStep('select')
    setShowPayModal(true)
  }

  const kirimPembayaran = async (metode) => {
    try {
      const res = await fetch('/api/pembayaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagihanId: selectedTagihan.id, metodeBayar: metode }),
      })
      if (res.ok) {
        setPaymentStep('success')
        ambilData()
        toast.success('Pembayaran berhasil dicatat!')
      } else {
        const data = await res.json()
        toast.error(data.pesan || 'Gagal memproses pembayaran')
        setShowPayModal(false)
      }
    } catch {
      toast.error('Gagal mengirim pembayaran')
      setShowPayModal(false)
    }
  }

  const handleProsesMetode = () => {
    if (metodePilihan === 'QRIS Gateway') {
      setPaymentStep('scanning')
    } else {
      kirimPembayaran('Tunai')
    }
  }

  useEffect(() => {
    if (showPayModal && paymentStep === 'scanning') {
      const timer = setTimeout(() => kirimPembayaran('QRIS Gateway'), 5000)
      return () => clearTimeout(timer)
    }
  }, [showPayModal, paymentStep])

  if (!user || loadingData) {
    return <SkeletonDashboard />
  }

  const belumBayar = tagihanList.filter(t => statusTampilan(t) === 'Belum Bayar')
  const totalBelum = belumBayar.reduce((s, t) => s + t.jumlah, 0)

  return (
    <>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: '24px' }}>
        <p className="label-small" style={{ marginBottom: '4px' }}>Tirta Asri Residence</p>
        <h1 className="section-title" style={{ fontSize: '24px' }}>
          {getGreeting()}, {user.nama.split(' ')[0]}
        </h1>
        <p className="section-subtitle">Blok {user.noRumah}</p>
      </div>

      {/* Pengumuman */}
      {pengumuman.length > 0 && (
        <div className="animate-fade-up delay-1" style={{ marginBottom: '16px' }}>
          {pengumuman.slice(0, 2).map(p => (
            <div key={p.id} className={`announcement-card${p.penting ? ' penting' : ''}`} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <i className={p.penting ? 'ri-megaphone-fill' : 'ri-information-line'}
                  style={{ fontSize: '18px', color: p.penting ? 'var(--color-accent)' : 'var(--color-text-muted)', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 2px' }}>{p.judul}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {p.isi.length > 100 ? p.isi.slice(0, 100) + '...' : p.isi}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Card */}
      {belumBayar.length > 0 && (
        <div className="stat-card stat-card-dark animate-fade-up delay-2" style={{ marginBottom: '16px' }}>
          <p className="stat-label" style={{ color: '#5a9e8a' }}>Tagihan Belum Dibayar</p>
          <p className="stat-value">Rp {totalBelum.toLocaleString('id-ID')}</p>
          <p className="stat-footnote" style={{ color: '#4a7a68' }}>{belumBayar.length} tagihan menunggu</p>
        </div>
      )}

      {/* Quick Actions */}
      <Link href="/warga/surat" className="animate-fade-up delay-2" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--color-card)', border: '1px solid var(--color-border-light)',
        borderRadius: 'var(--radius-lg)', padding: '16px 18px', marginBottom: '16px',
        textDecoration: 'none', transition: 'box-shadow 0.2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <i className="ri-file-text-line" style={{ fontSize: '22px', color: 'var(--color-primary)' }} />
          <div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>Pengajuan Surat</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>Ajukan surat keterangan RT</p>
          </div>
        </div>
        <i className="ri-arrow-right-s-line" style={{ fontSize: '20px', color: 'var(--color-text-muted)' }} />
      </Link>

      {/* Tagihan List */}
      <div className="animate-fade-up delay-3" id="iuran">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>Iuran Bulanan</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>Riwayat pembayaran</p>
          </div>
        </div>

        {tagihanList.length === 0 ? (
          <div className="card">
            <EmptyState icon="ri-wallet-3-line" title="Belum ada tagihan" description="Tagihan iuran Anda akan muncul di sini" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tagihanList.map((t, i) => {
              const status = statusTampilan(t)
              return (
                <div key={t.id} className="card animate-fade-up" style={{ animationDelay: `${0.15 + i * 0.05}s` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 500, color: 'var(--color-text)' }}>
                      {t.bulan} {t.tahun}
                    </span>
                    <StatusBadge status={status} />
                  </div>

                  <div className="divider" />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>Jumlah tagihan</p>
                      <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', margin: '2px 0 0' }}>
                        Rp {t.jumlah.toLocaleString('id-ID')}
                      </p>
                    </div>
                    {status === 'Belum Bayar' ? (
                      <button onClick={() => handleBayar(t)} className="btn btn-primary btn-sm">
                        <i className="ri-wallet-3-line" /> Bayar
                      </button>
                    ) : status === 'Pending' ? (
                      <span style={{ fontSize: '13px', color: 'var(--color-warning)', fontStyle: 'italic' }}>
                        <i className="ri-time-line" /> Menunggu RT...
                      </span>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--color-success)' }}>
                        <i className="ri-check-line" /> Selesai
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title={paymentStep === 'success' ? undefined : paymentStep === 'scanning' ? 'QRIS Tirta Asri' : 'Metode Pembayaran'}
        size="sm"
      >
        {paymentStep === 'select' && (
          <>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>
              Iuran {selectedTagihan?.bulan} {selectedTagihan?.tahun} — Rp {selectedTagihan?.jumlah?.toLocaleString('id-ID')}
            </p>
            <select
              value={metodePilihan}
              onChange={(e) => setMetodePilihan(e.target.value)}
              className="select-field"
              style={{ marginBottom: '16px' }}
            >
              <option value="QRIS Gateway">QRIS Gateway (Otomatis)</option>
              <option value="Tunai">Tunai / Cash (Titip Pengurus)</option>
            </select>
            <button onClick={handleProsesMetode} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Lanjutkan Pembayaran
            </button>
          </>
        )}

        {paymentStep === 'scanning' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-danger)', fontWeight: 600, margin: '0 0 20px' }}>
              <i className="ri-time-line" /> Bayar dalam 5 menit
            </p>
            <div style={{
              width: '180px', height: '180px', margin: '0 auto 20px',
              background: '#fff', borderRadius: 'var(--radius-lg)', padding: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--color-border-light)',
            }}>
              <QRCodeSVG value="https://tirta-asri-residence.vercel.app/payment" size={152} fgColor="#18291f" />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              Sistem mendeteksi otomatis, silakan scan...
            </p>
          </div>
        )}

        {paymentStep === 'success' && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'var(--color-success-bg)', margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <i className="ri-check-line" style={{ fontSize: '28px', color: 'var(--color-success)' }} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 600, color: 'var(--color-success)', margin: '0 0 8px' }}>
              Berhasil Tercatat
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 20px' }}>
              Pembayaran via <strong>{metodePilihan}</strong> telah tercatat.
              Status akan berubah setelah dikonfirmasi pengurus RT.
            </p>
            <button onClick={() => setShowPayModal(false)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Selesai
            </button>
          </div>
        )}
      </Modal>
    </>
  )
}