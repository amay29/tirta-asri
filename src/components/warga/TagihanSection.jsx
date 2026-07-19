'use client'
import { useState, useEffect } from 'react'
import EmptyState from '@/components/EmptyState'
import StatusBadge from '@/components/StatusBadge'
import PaymentModal from './PaymentModal'

function statusTampilan(t) {
  if (!t.pembayaran) return 'Belum Bayar'
  if (t.pembayaran.status === 'PENDING') return 'Pending'
  if (t.pembayaran.status === 'SUCCESS') return 'Lunas'
  return 'Belum Bayar'
}

export default function TagihanSection({ user }) {
  const [tagihanList, setTagihanList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedTagihan, setSelectedTagihan] = useState(null)

  const ambilData = async () => {
    try {
      const res = await fetch(`/api/tagihan?userId=${user.id}`)
      if (res.ok) {
        const data = await res.json()
        setTagihanList(data.tagihan || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) ambilData()
  }, [user])

  const handleBayar = (tagihan) => {
    setSelectedTagihan(tagihan)
    setShowPayModal(true)
  }

  const belumBayar = tagihanList.filter(t => statusTampilan(t) === 'Belum Bayar')
  const totalBelum = belumBayar.reduce((s, t) => s + t.jumlah, 0)

  if (loading) return null

  return (
    <>
      {belumBayar.length > 0 && (
        <div className="stat-card stat-card-dark animate-fade-up delay-2 mb-4">
          <p className="stat-label text-[#5a9e8a]">Tagihan Belum Dibayar</p>
          <p className="stat-value">Rp {totalBelum.toLocaleString('id-ID')}</p>
          <p className="stat-footnote text-[#4a7a68]">{belumBayar.length} tagihan menunggu</p>
        </div>
      )}

      <div className="animate-fade-up delay-3" id="iuran">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-base font-semibold text-[var(--color-text)] m-0">Iuran Bulanan</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 m-0">Riwayat pembayaran</p>
          </div>
        </div>

        {tagihanList.length === 0 ? (
          <div className="card">
            <EmptyState icon="ri-wallet-3-line" title="Belum ada tagihan" description="Tagihan iuran Anda akan muncul di sini" />
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {tagihanList.map((t, i) => {
              const status = statusTampilan(t)
              return (
                <div key={t.id} className="card animate-fade-up" style={{ animationDelay: `${0.15 + i * 0.05}s` }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-heading text-[17px] font-medium text-[var(--color-text)] block">
                        {t.bulan} {t.tahun}
                      </span>
                      {t.deadline && status === 'Belum Bayar' && (() => {
                        const dl = new Date(t.deadline)
                        const now = new Date()
                        const diffDays = Math.ceil((dl - now) / (1000 * 60 * 60 * 24))
                        
                        let dlColorClass = 'text-[var(--color-text-muted)]'
                        let dlText = `Jatuh tempo: ${dl.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
                        
                        if (diffDays < 0) {
                          dlColorClass = 'text-[var(--color-danger)]'
                          dlText = 'Terlewat jatuh tempo'
                        } else if (diffDays <= 3) {
                          dlColorClass = 'text-[var(--color-accent)]'
                          dlText = `Sisa ${diffDays} hari!`
                        }
                        
                        return (
                          <span className={`text-[11px] font-semibold ${dlColorClass} flex items-center gap-1 mt-1`}>
                            <i className="ri-alarm-warning-line" /> {dlText}
                          </span>
                        )
                      })()}
                    </div>
                    <StatusBadge status={status} />
                  </div>

                  <div className="divider" />

                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] m-0">Jumlah tagihan</p>
                      <p className="text-base font-semibold text-[var(--color-text)] mt-0.5 m-0">
                        Rp {t.jumlah.toLocaleString('id-ID')}
                      </p>
                    </div>
                    {status === 'Belum Bayar' ? (
                      <button onClick={() => handleBayar(t)} className="btn btn-primary btn-sm">
                        <i className="ri-wallet-3-line" /> Bayar
                      </button>
                    ) : status === 'Pending' ? (
                      <span className="text-[13px] text-[var(--color-warning)] italic">
                        <i className="ri-time-line" /> Menunggu RT...
                      </span>
                    ) : (
                      <span className="text-[13px] text-[var(--color-success)]">
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

      {showPayModal && selectedTagihan && (
        <PaymentModal 
          isOpen={showPayModal} 
          onClose={() => setShowPayModal(false)}
          tagihan={selectedTagihan}
          onSuccess={() => {
            setShowPayModal(false)
            ambilData()
          }}
        />
      )}
    </>
  )
}
