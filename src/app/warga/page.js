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
import PWAInstallButton from '@/components/PWAInstallButton'
import NotificationButton from '@/components/NotificationButton'

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
  const [kasData, setKasData] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedTagihan, setSelectedTagihan] = useState(null)
  const [metodePilihan, setMetodePilihan] = useState('QRIS Gateway')
  const [paymentStep, setPaymentStep] = useState('select')
  const [showKasDetail, setShowKasDetail] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const [showPinModal, setShowPinModal] = useState(false)
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [buktiFile, setBuktiFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const ambilData = async () => {
    if (!user) return
    try {
      const [tRes, pRes, allTRes, expRes] = await Promise.all([
        fetch(`/api/tagihan?userId=${user.id}`),
        fetch('/api/pengumuman'),
        fetch('/api/tagihan'),
        fetch('/api/pengeluaran'),
      ])
      if (tRes.ok) { const t = await tRes.json(); setTagihanList(t.tagihan || []) }
      if (pRes.ok) { const p = await pRes.json(); setPengumuman(p.pengumuman || []) }

      // Hitung transparansi kas
      if (allTRes.ok && expRes.ok) {
        const allTagihan = (await allTRes.json()).tagihan || []
        const allPengeluaran = (await expRes.json()).riwayatPengeluaran || []

        const lunas = allTagihan.filter(t => t.pembayaran?.status === 'SUCCESS')
        const masuk = lunas.reduce((s, t) => s + t.jumlah, 0)
        const keluar = allPengeluaran.reduce((s, p) => s + p.nominal, 0)

        setKasData({
          totalMasuk: masuk,
          totalKeluar: keluar,
          saldo: masuk - keluar,
          jumlahWargaLunas: lunas.length,
          pengeluaranList: allPengeluaran.slice(0, 8),
        })
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
    setCountdown(10)
    setShowPayModal(true)
  }

  const kirimPembayaran = async (metode, fileUrl = null) => {
    try {
      const res = await fetch('/api/pembayaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tagihanId: selectedTagihan.id, 
          metodeBayar: metode,
          buktiTransfer: fileUrl
        }),
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

  const handleProsesMetode = async () => {
    if (metodePilihan === 'QRIS Gateway') {
      setPaymentStep('scanning')
      setCountdown(10)
    } else if (metodePilihan === 'Transfer Manual') {
      if (!buktiFile) {
        toast.error('Harap unggah bukti transfer terlebih dahulu')
        return
      }
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', buktiFile)
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (res.ok) {
          const data = await res.json()
          await kirimPembayaran('Transfer Manual', data.url)
        } else {
          const errorData = await res.json()
          toast.error(errorData.pesan || 'Gagal mengunggah bukti transfer')
        }
      } catch (e) {
        toast.error('Terjadi kesalahan saat mengunggah file')
      } finally {
        setIsUploading(false)
      }
    } else {
      kirimPembayaran('Tunai')
    }
  }

  // Countdown timer for QRIS
  useEffect(() => {
    if (showPayModal && paymentStep === 'scanning') {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            kirimPembayaran('QRIS Gateway')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [showPayModal, paymentStep])

  const handleChangePin = async () => {
    if (newPin !== confirmPin) {
      toast.error('PIN baru dan konfirmasi tidak cocok')
      return
    }
    setPinLoading(true)
    try {
      const res = await fetch('/api/auth/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, oldPin, newPin }),
      })
      if (res.ok) {
        toast.success('PIN berhasil diubah')
        setShowPinModal(false)
        setOldPin('')
        setNewPin('')
        setConfirmPin('')
      } else {
        const data = await res.json()
        toast.error(data.pesan || 'Gagal mengubah PIN')
      }
    } catch {
      toast.error('Gagal mengubah PIN')
    }
    setPinLoading(false)
  }

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

      {/* PWA & Notifications */}
      <div className="animate-fade-up">
        <PWAInstallButton />
        <NotificationButton />
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{p.judul}</p>
                    {p.pembuatRole && (
                      <span
                        style={{
                          fontSize: '9px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          background: p.pembuatRole === 'ADMIN_RT' ? 'var(--color-primary)' : 'var(--color-accent)',
                          color: '#fff',
                        }}
                      >
                        {p.pembuatRole === 'ADMIN_RT' ? 'Ketua RT' : 'Admin Iuran'}
                      </span>
                    )}
                  </div>
                  {p.foto && (
                    <div style={{ margin: '6px 0', borderRadius: '8px', overflow: 'hidden', height: '100px', width: '160px', background: '#eee' }}>
                      <img src={p.foto} alt="Foto Pengumuman" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {p.isi.length > 120 ? p.isi.slice(0, 120) + '...' : p.isi}
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

      {/* === TRANSPARANSI KAS RT === */}
      {kasData && (
        <div className="card animate-fade-up delay-2" style={{ marginBottom: '16px' }}>
          <div
            onClick={() => setShowKasDetail(!showKasDetail)}
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="ri-shield-check-line" style={{ color: 'var(--color-primary)' }} />
                Transparansi Kas RT
              </p>
              <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                Rp {kasData.saldo.toLocaleString('id-ID')}
              </p>
            </div>
            <i className={`ri-arrow-${showKasDetail ? 'up' : 'down'}-s-line`}
              style={{ fontSize: '20px', color: 'var(--color-text-muted)' }} />
          </div>

          {showKasDetail && (
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed var(--color-border-light)' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1, background: 'var(--color-success-bg)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--color-success)', margin: '0 0 2px' }}>Pemasukan</p>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-success)', margin: 0 }}>
                    Rp {kasData.totalMasuk.toLocaleString('id-ID')}
                  </p>
                  <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                    {kasData.jumlahWargaLunas} pembayaran
                  </p>
                </div>
                <div style={{ flex: 1, background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--color-danger)', margin: '0 0 2px' }}>Pengeluaran</p>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-danger)', margin: 0 }}>
                    Rp {kasData.totalKeluar.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {kasData.pengeluaranList.length > 0 && (
                <>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>
                    Catatan Pengeluaran Terakhir
                  </p>
                  {kasData.pengeluaranList.map(exp => (
                    <div key={exp.id} className="card-flat" style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '13px', color: 'var(--color-text)', margin: 0 }}>{exp.keperluan}</p>
                        <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', margin: '1px 0 0' }}>
                          {new Date(exp.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-danger)', margin: 0 }}>
                        - Rp {exp.nominal.toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <Link href="/warga/surat" className="animate-fade-up delay-2" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--color-card)', border: '1px solid var(--color-border-light)',
        borderRadius: 'var(--radius-lg)', padding: '16px 18px', marginBottom: '8px',
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

      <button onClick={() => setShowPinModal(true)} className="animate-fade-up delay-2" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--color-card)', border: '1px solid var(--color-border-light)',
        borderRadius: 'var(--radius-lg)', padding: '16px 18px', marginBottom: '16px',
        textDecoration: 'none', transition: 'box-shadow 0.2s', width: '100%', cursor: 'pointer', outline: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <i className="ri-lock-password-line" style={{ fontSize: '22px', color: 'var(--color-primary)' }} />
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>Ubah PIN Akun</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>Ganti password login Anda</p>
          </div>
        </div>
        <i className="ri-arrow-right-s-line" style={{ fontSize: '20px', color: 'var(--color-text-muted)' }} />
      </button>

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 500, color: 'var(--color-text)', display: 'block' }}>
                        {t.bulan} {t.tahun}
                      </span>
                      {t.deadline && status === 'Belum Bayar' && (() => {
                        const dl = new Date(t.deadline)
                        const now = new Date()
                        const diffDays = Math.ceil((dl - now) / (1000 * 60 * 60 * 24))
                        
                        let dlColor = 'var(--color-text-muted)'
                        let dlText = `Jatuh tempo: ${dl.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
                        
                        if (diffDays < 0) {
                          dlColor = 'var(--color-danger)'
                          dlText = 'Terlewat jatuh tempo'
                        } else if (diffDays <= 3) {
                          dlColor = 'var(--color-accent)'
                          dlText = `Sisa ${diffDays} hari!`
                        }
                        
                        return (
                          <span style={{ fontSize: '11px', fontWeight: 600, color: dlColor, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                            <i className="ri-alarm-warning-line" /> {dlText}
                          </span>
                        )
                      })()}
                    </div>
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
              <option value="QRIS Gateway">QRIS Gateway (Scan QR)</option>
              <option value="Tunai">Tunai / Cash (Titip Pengurus)</option>
              <option value="Transfer Manual">Transfer Manual (Bukti Transfer)</option>
            </select>
            
            {metodePilihan === 'Transfer Manual' && (
              <div className="card-flat" style={{ marginBottom: '16px', background: 'var(--color-bg)' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 4px' }}>Bank BCA</p>
                <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)', margin: '0 0 4px', letterSpacing: '1px' }}>1234567890</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 12px' }}>a/n Tirta Asri</p>
                
                <label className="form-label" style={{ fontSize: '13px' }}>Unggah Bukti Transfer (Max 2MB)</label>
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={e => setBuktiFile(e.target.files[0])}
                  className="input-field" 
                  style={{ fontSize: '13px', padding: '8px' }}
                />
              </div>
            )}

            <button onClick={handleProsesMetode} disabled={isUploading || (metodePilihan === 'Transfer Manual' && !buktiFile)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {isUploading ? 'Mengunggah...' : 'Lanjutkan Pembayaran'}
            </button>
          </>
        )}

        {paymentStep === 'scanning' && (
          <div style={{ textAlign: 'center' }}>
            {/* Countdown bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                  <i className="ri-time-line" /> Sisa waktu
                </span>
                <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>00:{String(countdown).padStart(2, '0')}</span>
              </div>
              <div className="progress-bar" style={{ height: '4px' }}>
                <div className="progress-bar-fill" style={{
                  width: `${(countdown / 10) * 100}%`,
                  background: countdown <= 3 ? 'var(--color-danger)' : 'var(--color-primary)',
                  transition: 'width 1s linear',
                }} />
              </div>
            </div>

            <div style={{
              width: '180px', height: '180px', margin: '0 auto 16px',
              background: '#fff', borderRadius: 'var(--radius-lg)', padding: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--color-border-light)',
            }}>
              <QRCodeSVG
                value={typeof window !== 'undefined' ? `${window.location.origin}/payment` : 'https://tirta-asri.local/payment'}
                size={152}
                fgColor="#18291f"
              />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>
              Scan dengan aplikasi e-wallet Anda
            </p>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              Pembayaran otomatis tercatat setelah countdown selesai
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

      {/* Ubah PIN Modal */}
      <Modal isOpen={showPinModal} onClose={() => setShowPinModal(false)} title="Ubah PIN" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px' }}>
            <button type="button" onClick={() => setShowPin(!showPin)} className="btn btn-ghost btn-sm" style={{ padding: '0 8px', fontSize: '13px' }}>
              <i className={showPin ? 'ri-eye-off-line' : 'ri-eye-line'} style={{ marginRight: '4px' }} />
              {showPin ? 'Sembunyikan PIN' : 'Lihat PIN'}
            </button>
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '14px' }}>PIN Lama</label>
            <input type={showPin ? 'text' : 'password'} value={oldPin} onChange={e => setOldPin(e.target.value)} className="input-field" placeholder="Masukkan PIN lama" maxLength={6} />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '14px' }}>PIN Baru</label>
            <input type={showPin ? 'text' : 'password'} value={newPin} onChange={e => setNewPin(e.target.value)} className="input-field" placeholder="Masukkan PIN baru" maxLength={6} />
          </div>
          <div>
            <label className="form-label" style={{ fontSize: '14px' }}>Konfirmasi PIN Baru</label>
            <input type={showPin ? 'text' : 'password'} value={confirmPin} onChange={e => setConfirmPin(e.target.value)} className="input-field" placeholder="Ketik ulang PIN baru" maxLength={6} />
          </div>
          <button onClick={handleChangePin} disabled={pinLoading || !oldPin || !newPin || !confirmPin} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            {pinLoading ? 'Memproses...' : 'Simpan PIN Baru'}
          </button>
        </div>
      </Modal>
    </>
  )
}