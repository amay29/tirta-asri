'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/Toast'
import { SkeletonList } from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'
import Link from 'next/link'

const BULAN_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export default function LaporanBulanan() {
  const { user } = useAuth(['ADMIN_IURAN', 'ADMIN_RT'])
  const toast = useToast()
  const [tagihanList, setTagihanList] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [bulanFilter, setBulanFilter] = useState(BULAN_LIST[new Date().getMonth()])
  const [tahunFilter, setTahunFilter] = useState(new Date().getFullYear())

  const ambilData = async () => {
    try {
      const res = await fetch('/api/tagihan')
      if (res.ok) {
        const data = await res.json()
        setTagihanList(data.tagihan || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => { if (user) ambilData() }, [user])

  if (!user || loadingData) return <SkeletonList count={3} />

  // Filter data sesuai bulan dan tahun
  const dataBulanIni = tagihanList.filter(t => t.bulan === bulanFilter && t.tahun === parseInt(tahunFilter))
  
  // Kalkulasi
  const tagihanLunas = dataBulanIni.filter(t => t.pembayaran?.status === 'SUCCESS')
  const tagihanBelum = dataBulanIni.filter(t => t.pembayaran?.status !== 'SUCCESS')
  
  const totalTerkumpul = tagihanLunas.reduce((sum, t) => sum + t.jumlah, 0)
  const totalBelumMasuk = tagihanBelum.reduce((sum, t) => sum + t.jumlah, 0)
  const totalKeseluruhan = totalTerkumpul + totalBelumMasuk

  const handleDownloadCSV = () => {
    if (dataBulanIni.length === 0) return toast.error('Tidak ada data untuk bulan ini')
    
    let csvContent = 'No,Nama Warga,Blok / No. Rumah,Status,Jumlah (Rp)\n'
    dataBulanIni.forEach((t, idx) => {
      const isLunas = t.pembayaran?.status === 'SUCCESS'
      csvContent += `${idx + 1},"${t.user.nama}","Blok ${t.user.noRumah}","${isLunas ? 'LUNAS' : 'BELUM BAYAR'}",${t.jumlah}\n`
    })
    
    csvContent += `\nTotal Lunas,,,,${totalTerkumpul}\n`
    csvContent += `Total Belum Bayar,,,,${totalBelumMasuk}\n`
    csvContent += `Total Potensi Kas,,,,${totalKeseluruhan}\n`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Laporan_Iuran_${bulanFilter}_${tahunFilter}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <div className="no-print animate-fade-up" style={{ marginBottom: '24px' }}>
        <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: '12px' }}>
          <i className="ri-arrow-left-line" /> Kembali ke Dashboard
        </Link>
        <p className="label-small" style={{ marginBottom: '4px' }}>Tirta Asri Residence</p>
        <h1 className="section-title">Laporan Iuran</h1>
        <p className="section-subtitle">Rekapitulasi iuran warga bulanan</p>
      </div>

      <div className="no-print card animate-fade-up delay-1" style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label className="form-label" style={{ fontSize: '14px' }}>Pilih Bulan</label>
          <select value={bulanFilter} onChange={e => setBulanFilter(e.target.value)} className="select-field">
            {BULAN_LIST.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '100px' }}>
          <label className="form-label" style={{ fontSize: '14px' }}>Pilih Tahun</label>
          <input type="number" value={tahunFilter} onChange={e => setTahunFilter(e.target.value)} className="input-field" />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <button onClick={handleDownloadCSV} className="btn btn-outline" style={{ height: '48px' }}>
            <i className="ri-file-excel-line" /> Unduh CSV
          </button>
          <button onClick={() => window.print()} className="btn btn-primary" style={{ height: '48px' }}>
            <i className="ri-printer-line" /> Cetak PDF
          </button>
        </div>
      </div>

      <div id="print-area">
        <div className="print-header" style={{ display: 'none', textAlign: 'center', borderBottom: '3px double #333', paddingBottom: '16px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '1px' }}>RUKUN TETANGGA (RT)</h1>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '4px 0 0' }}>PERUMAHAN TIRTA ASRI RESIDENCE</h2>
          <p style={{ fontSize: '12px', margin: '6px 0 0', color: '#444' }}>Laporan Iuran Bulanan — Periode {bulanFilter} {tahunFilter}</p>
        </div>

        <h3 className="print-only-title" style={{ display: 'none', fontSize: '16px', fontWeight: 600, margin: '0 0 16px', textAlign: 'center' }}>
          REKAPITULASI IURAN BULAN {bulanFilter.toUpperCase()} {tahunFilter}
        </h3>

        <div className="stats-container animate-fade-up delay-2" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div className="stat-box" style={{ flex: 1, minWidth: '140px', padding: '16px', background: 'var(--color-success-bg)', borderRadius: '12px', border: '1px solid var(--color-success)' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-success)', margin: '0 0 4px', fontWeight: 600 }}>Terkumpul (Lunas)</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-success)', margin: 0 }}>Rp {totalTerkumpul.toLocaleString('id-ID')}</p>
            <p style={{ fontSize: '11px', color: 'var(--color-success)', margin: '4px 0 0' }}>{tagihanLunas.length} warga</p>
          </div>
          <div className="stat-box" style={{ flex: 1, minWidth: '140px', padding: '16px', background: 'var(--color-danger-bg)', borderRadius: '12px', border: '1px solid var(--color-danger)' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-danger)', margin: '0 0 4px', fontWeight: 600 }}>Belum Dibayar</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-danger)', margin: 0 }}>Rp {totalBelumMasuk.toLocaleString('id-ID')}</p>
            <p style={{ fontSize: '11px', color: 'var(--color-danger)', margin: '4px 0 0' }}>{tagihanBelum.length} warga</p>
          </div>
          <div className="stat-box" style={{ flex: 1, minWidth: '140px', padding: '16px', background: '#f5f5f5', borderRadius: '12px', border: '1px solid #ddd' }}>
            <p style={{ fontSize: '12px', color: '#555', margin: '0 0 4px', fontWeight: 600 }}>Total Potensi Kas</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#333', margin: 0 }}>Rp {totalKeseluruhan.toLocaleString('id-ID')}</p>
            <p style={{ fontSize: '11px', color: '#555', margin: '4px 0 0' }}>{dataBulanIni.length} total tagihan</p>
          </div>
        </div>

        <div className="animate-fade-up delay-3" style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 16px' }}>Rincian Warga</h3>
          
          {dataBulanIni.length === 0 ? (
            <EmptyState icon="ri-folder-info-line" title="Tidak ada data" description={`Belum ada tagihan dibuat untuk bulan ${bulanFilter} ${tahunFilter}`} />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#555', fontWeight: 600 }}>No</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#555', fontWeight: 600 }}>Nama Warga</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#555', fontWeight: 600 }}>Blok / No. Rumah</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#555', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#555', fontWeight: 600 }}>Jumlah (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {dataBulanIni.map((t, idx) => {
                    const isLunas = t.pembayaran?.status === 'SUCCESS'
                    return (
                      <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>{idx + 1}</td>
                        <td style={{ padding: '12px', fontWeight: 500 }}>{t.user.nama}</td>
                        <td style={{ padding: '12px' }}>Blok {t.user.noRumah}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                            background: isLunas ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                            color: isLunas ? 'var(--color-success)' : 'var(--color-danger)'
                          }}>
                            {isLunas ? 'LUNAS' : 'BELUM BAYAR'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                          {t.jumlah.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; margin: 0 !important; }
          .page-container { padding: 0 !important; max-width: none !important; }
          #print-area { padding: 20mm !important; }
          .print-header { display: block !important; }
          .print-only-title { display: block !important; }
          .stat-box { 
            border: 1px solid #000 !important; 
            background: #fff !important; 
            color: #000 !important;
          }
          .stat-box p { color: #000 !important; }
          table { width: 100% !important; border: 1px solid #000 !important; }
          th, td { border: 1px solid #ccc !important; padding: 8px !important; }
          @page { margin: 0; size: A4; }
        }
      `}</style>
    </>
  )
}
