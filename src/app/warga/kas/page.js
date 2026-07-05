'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import EmptyState from '@/components/EmptyState'
import { SkeletonList } from '@/components/Skeleton'

export default function KasRTPaage() {
  const { user } = useAuth('WARGA')
  const [kasData, setKasData] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  const ambilData = async () => {
    try {
      const allTRes = await fetch('/api/tagihan')
      const expRes = await fetch('/api/pengeluaran')

      if (allTRes.ok && expRes.ok) {
        const allTagihan = (await allTRes.json()).tagihan || []
        const allPengeluaran = (await expRes.json()).riwayatPengeluaran || []

        const lunas = allTagihan.filter(t => t.pembayaran?.status === 'SUCCESS')
        
        // Grouping by month-year
        const bulanan = {}
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
        
        // Pemasukan
        lunas.forEach(t => {
          const key = `${t.bulan} ${t.tahun}`
          if (!bulanan[key]) bulanan[key] = { masuk: 0, keluar: 0, pengeluaranList: [] }
          bulanan[key].masuk += t.jumlah
        })

        // Pengeluaran
        allPengeluaran.forEach(p => {
          const d = new Date(p.createdAt)
          const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`
          if (!bulanan[key]) bulanan[key] = { masuk: 0, keluar: 0, pengeluaranList: [] }
          bulanan[key].keluar += p.nominal
          bulanan[key].pengeluaranList.push(p)
        })

        const totalMasuk = lunas.reduce((s, t) => s + t.jumlah, 0)
        const totalKeluar = allPengeluaran.reduce((s, p) => s + p.nominal, 0)

        // Sort keys by date descending (rough sort assuming latest years/months are keys)
        const sortedKeys = Object.keys(bulanan).sort((a, b) => {
          const [mA, yA] = a.split(' ')
          const [mB, yB] = b.split(' ')
          const dA = new Date(parseInt(yA), monthNames.indexOf(mA), 1)
          const dB = new Date(parseInt(yB), monthNames.indexOf(mB), 1)
          return dB - dA
        })

        setKasData({
          totalMasuk,
          totalKeluar,
          saldo: totalMasuk - totalKeluar,
          bulanan,
          sortedKeys
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

  if (!user || loadingData) return <SkeletonList count={3} />

  return (
    <>
      <div className="animate-fade-up" style={{ marginBottom: '24px' }}>
        <Link href="/warga" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--color-primary)', textDecoration: 'none', marginBottom: '12px', fontWeight: 600 }}>
          <i className="ri-arrow-left-s-line" /> Kembali
        </Link>
        <p className="label-small" style={{ marginBottom: '4px' }}>Tirta Asri Residence</p>
        <h1 className="section-title">Transparansi Kas RT</h1>
        <p className="section-subtitle">Rincian pemasukan dan pengeluaran</p>
      </div>

      <div className="stat-card stat-card-dark animate-fade-up delay-1" style={{ marginBottom: '24px' }}>
        <p className="stat-label" style={{ color: '#5a9e8a' }}><i className="ri-safe-2-line" /> Saldo Kas Saat Ini</p>
        <p className="stat-value" style={{ fontSize: '32px' }}>Rp {kasData.saldo.toLocaleString('id-ID')}</p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#5a9e8a', margin: '0 0 2px' }}>Total Pemasukan</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#f5f1eb', margin: 0 }}>Rp {kasData.totalMasuk.toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: '#5a9e8a', margin: '0 0 2px' }}>Total Pengeluaran</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#f5f1eb', margin: 0 }}>Rp {kasData.totalKeluar.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      <div className="animate-fade-up delay-2">
        {kasData.sortedKeys.length === 0 ? (
          <EmptyState icon="ri-file-list-3-line" title="Belum Ada Transaksi" description="Data kas akan muncul di sini" />
        ) : (
          kasData.sortedKeys.map(key => {
            const dataBulan = kasData.bulanan[key]
            return (
              <div key={key} className="card" style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span><i className="ri-calendar-event-line" style={{ color: 'var(--color-primary)', marginRight: '6px' }} /> {key}</span>
                  <span style={{ fontSize: '14px', color: dataBulan.masuk - dataBulan.keluar >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                    Rp {(dataBulan.masuk - dataBulan.keluar).toLocaleString('id-ID')}
                  </span>
                </h3>
                
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', background: 'var(--color-bg)', padding: '12px', borderRadius: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>Pemasukan (Iuran)</p>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-primary)', margin: 0 }}>Rp {dataBulan.masuk.toLocaleString('id-ID')}</p>
                  </div>
                  <div style={{ width: '1px', background: 'var(--color-border)' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>Pengeluaran</p>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-danger)', margin: 0 }}>Rp {dataBulan.keluar.toLocaleString('id-ID')}</p>
                  </div>
                </div>

                {dataBulan.pengeluaranList.length > 0 && (
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>Rincian Pengeluaran</p>
                    {dataBulan.pengeluaranList.map(exp => (
                      <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 2px' }}>{exp.keperluan}</p>
                          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                            {new Date(exp.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · Sumber: {exp.sumber}
                          </p>
                        </div>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-danger)', margin: 0 }}>
                          - Rp {exp.nominal.toLocaleString('id-ID')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
