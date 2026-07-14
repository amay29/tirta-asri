'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import EmptyState from '@/components/EmptyState'
import { SkeletonList } from '@/components/Skeleton'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import TopNav from '@/components/TopNav'

export default function RiwayatDanaMasuk() {
  const { user } = useAuth(['ADMIN_IURAN', 'ADMIN_RT'])
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

  const chartData = Object.entries(bulanGroups).map(([name, total]) => ({ name, total }))

  return (
    <>
      <TopNav title="Riwayat Dana Masuk" />
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

      {chartData.length > 0 && (
        <div className="card animate-fade-up delay-1" style={{ marginBottom: '16px', padding: '20px 16px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 16px' }}>Pemasukan per Periode</p>
          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} dy={10} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div style={{ background: '#fff', padding: '8px 12px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #eee' }}>
                          <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#666' }}>{payload[0].payload.name}</p>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1a6048' }}>Rp {payload[0].value.toLocaleString('id-ID')}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="total" radius={[4, 4, 4, 4]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#1a6048' : '#88c9a1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
                    {t.pembayaran.disetujuiOleh && (
                      <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className="ri-shield-user-line" style={{ color: 'var(--color-primary)' }} /> Acc: {t.pembayaran.disetujuiOleh}
                      </p>
                    )}
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
