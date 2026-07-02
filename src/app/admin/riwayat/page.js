'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import EmptyState from '@/components/EmptyState'
import { SkeletonList } from '@/components/Skeleton'

export default function RiwayatDanaMasuk() {
  const { user } = useAuth('ADMIN')
  const [tagihanList, setTagihanList] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [filterBulan, setFilterBulan] = useState('Semua')

  const ambilData = async () => {
    try {
      const res = await fetch('/api/tagihan')
      if (res.ok) {
        const data = await res.json()
        const sudahLunas = (data.tagihan || []).filter(t => t.pembayaran?.status === 'SUCCESS')
        setTagihanList(sudahLunas)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => { if (user) ambilData() }, [user])

  if (!user || loadingData) return <SkeletonList count={3} />

  const totalIuranMasuk = tagihanList.reduce((s, t) => s + t.jumlah, 0)
  const daftarBulan = ['Semua', ...new Set(tagihanList.map(t => `${t.bulan} ${t.tahun}`))]
  const dataTerfilter = filterBulan === 'Semua' ? tagihanList : tagihanList.filter(t => `${t.bulan} ${t.tahun}` === filterBulan)

  const bulanGroups = {}
  tagihanList.forEach(t => {
    const key = `${t.bulan} ${t.tahun}`
    bulanGroups[key] = (bulanGroups[key] || 0) + t.jumlah
  })
  const maxChart = Math.max(...Object.values(bulanGroups), 1)

  return (
    <>
      <div className="animate-fade-up" style={{ marginBottom: '24px' }}>
        <p className="label-small" style={{ marginBottom: '4px' }}>Tirta Asri Residence</p>
        <h1 className="section-title" style={{ fontSize: '24px' }}>Riwayat Dana Masuk</h1>
        <p className="section-subtitle">Catatan iuran warga yang sudah lunas</p>
      </div>

      <div className="stat-card stat-card-dark animate-fade-up delay-1" style={{ marginBottom: '16px' }}>
        <p className="stat-label" style={{ color: '#5a9e8a' }}><i className="ri-funds-line" /> Total Iuran Masuk</p>
        <p className="stat-value" style={{ fontSize: '26px' }}>Rp {totalIuranMasuk.toLocaleString('id-ID')}</p>
        <p className="stat-footnote" style={{ color: '#4a7a68' }}>{tagihanList.length} transaksi lunas</p>
      </div>

      {Object.keys(bulanGroups).length > 0 && (
        <div className="card animate-fade-up delay-1" style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 12px' }}>Pemasukan per Periode</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(bulanGroups).map(([key, value]) => (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{key}</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Rp {value.toLocaleString('id-ID')}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${(value / maxChart) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="animate-fade-up delay-2 hide-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '16px' }}>
        {daftarBulan.map(b => (
          <button key={b} onClick={() => setFilterBulan(b)} className={`btn-pill${filterBulan === b ? ' active' : ''}`}>
            {b}
          </button>
        ))}
      </div>

      <div className="animate-fade-up delay-3">
        {dataTerfilter.length === 0 ? (
          <div className="card">
            <EmptyState icon="ri-exchange-funds-line" title="Belum ada transaksi" description="Belum ada pembayaran lunas untuk periode ini" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dataTerfilter.map(t => (
              <div key={t.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>{t.user.nama}</span>
                    <span className="badge badge-neutral" style={{ fontSize: '10px', marginLeft: '8px' }}>Blok {t.user.noRumah}</span>
                  </div>
                  <span className="badge badge-success">Lunas</span>
                </div>
                <div className="divider" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '8px' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--color-text)', fontWeight: 500, margin: 0 }}>Iuran {t.bulan} {t.tahun}</p>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                      {new Date(t.pembayaran.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '0 0 2px' }}>{t.pembayaran.metodeBayar}</p>
                    <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>Rp {t.jumlah.toLocaleString('id-ID')}</p>
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
