'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/Toast'
import { SkeletonList } from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'
import Link from 'next/link'
import jsPDF from 'jspdf'
import TopNav from '@/components/TopNav'
import autoTable from 'jspdf-autotable'

const BULAN_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export default function LaporanBulanan() {
  const { user } = useAuth(['ADMIN_IURAN', 'ADMIN_RT'])
  const toast = useToast()
  const [tagihanList, setTagihanList] = useState([])
  const [pengeluaranList, setPengeluaranList] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [bulanFilter, setBulanFilter] = useState(BULAN_LIST[new Date().getMonth()])
  const [tahunFilter, setTahunFilter] = useState(new Date().getFullYear())

  const ambilData = async () => {
    try {
      const [resT, resP] = await Promise.all([
        fetch('/api/tagihan'),
        fetch('/api/pengeluaran')
      ])
      
      if (resT.ok) {
        const dataT = await resT.json()
        setTagihanList(dataT.tagihan || [])
      }
      if (resP.ok) {
        const dataP = await resP.json()
        setPengeluaranList(dataP.riwayatPengeluaran || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => { if (user) ambilData() }, [user])

  if (!user || loadingData) return <SkeletonList count={3} />

  const dataBulanIni = tagihanList.filter(t => t.bulan === bulanFilter && t.tahun === parseInt(tahunFilter))

  const pengeluaranBulanIni = pengeluaranList.filter(p => {
    const d = new Date(p.createdAt)
    return BULAN_LIST[d.getMonth()] === bulanFilter && d.getFullYear() === parseInt(tahunFilter)
  })

  const tagihanLunas = dataBulanIni.filter(t => t.pembayaran?.status === 'SUCCESS')
  const tagihanBelum = dataBulanIni.filter(t => t.pembayaran?.status !== 'SUCCESS')
  
  const totalTerkumpul = tagihanLunas.reduce((sum, t) => sum + t.jumlah, 0)
  const totalBelumMasuk = tagihanBelum.reduce((sum, t) => sum + t.jumlah, 0)
  const totalPengeluaran = pengeluaranBulanIni.reduce((sum, p) => sum + p.nominal, 0)
  const totalKeseluruhan = totalTerkumpul + totalBelumMasuk

  const handleDownloadPDF = () => {
    if (dataBulanIni.length === 0 && pengeluaranBulanIni.length === 0) {
      return toast.error('Tidak ada data pemasukan maupun pengeluaran untuk bulan ini')
    }

    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('RUKUN TETANGGA (RT)', 105, 15, { align: 'center' })
    doc.setFontSize(14)
    doc.text('PERUMAHAN TIRTA ASRI RESIDENCE', 105, 22, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Laporan Keuangan Bulanan - Periode ${bulanFilter} ${tahunFilter}`, 105, 28, { align: 'center' })
    doc.line(14, 32, 196, 32)
    
    let currentY = 40

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('A. Ringkasan', 14, currentY)
    currentY += 8
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Total Pemasukan Iuran Lunas: Rp ${totalTerkumpul.toLocaleString('id-ID')}`, 14, currentY)
    currentY += 6
    doc.text(`Total Pengeluaran: Rp ${totalPengeluaran.toLocaleString('id-ID')}`, 14, currentY)
    currentY += 6
    doc.text(`Saldo Bulan Ini: Rp ${(totalTerkumpul - totalPengeluaran).toLocaleString('id-ID')}`, 14, currentY)
    currentY += 6
    doc.text(`Total Iuran Belum Dibayar: Rp ${totalBelumMasuk.toLocaleString('id-ID')}`, 14, currentY)
    currentY += 12

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('B. Rincian Pemasukan Iuran', 14, currentY)
    currentY += 6
    
    if (dataBulanIni.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [['No', 'Nama Warga', 'Blok / No', 'Status', 'Jumlah (Rp)']],
        body: dataBulanIni.map((t, idx) => [
          idx + 1,
          t.user.nama,
          `Blok ${t.user.noRumah}`,
          t.pembayaran?.status === 'SUCCESS' ? 'LUNAS' : 'BELUM BAYAR',
          t.jumlah.toLocaleString('id-ID')
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 9 },
      })
      currentY = doc.lastAutoTable.finalY + 12
    } else {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.text('Tidak ada data iuran pada bulan ini.', 14, currentY)
      currentY += 12
    }

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('C. Rincian Pengeluaran', 14, currentY)
    currentY += 6
    
    if (pengeluaranBulanIni.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [['No', 'Tanggal', 'Keperluan', 'Sumber Dana', 'Nominal (Rp)']],
        body: pengeluaranBulanIni.map((p, idx) => [
          idx + 1,
          new Date(p.createdAt).toLocaleDateString('id-ID'),
          p.keperluan,
          p.sumber,
          p.nominal.toLocaleString('id-ID')
        ]),
        theme: 'grid',
        headStyles: { fillColor: [192, 57, 43] },
        styles: { fontSize: 9 },
      })
      currentY = doc.lastAutoTable.finalY + 20
    } else {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.text('Tidak ada pengeluaran pada bulan ini.', 14, currentY)
      currentY += 20
    }

    if (currentY > 260) {
      doc.addPage()
      currentY = 20
    }
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Mengetahui,', 150, currentY)
    currentY += 5
    doc.text('Pengurus RT Tirta Asri', 150, currentY)
    currentY += 25
    doc.text('______________________', 145, currentY)

    doc.save(`Laporan_Kas_${bulanFilter}_${tahunFilter}.pdf`)
    toast.success('PDF berhasil diunduh')
  }

  const handleDownloadCSV = () => {
    if (dataBulanIni.length === 0 && pengeluaranBulanIni.length === 0) return toast.error('Tidak ada data untuk bulan ini')
    
    let csvContent = 'LAPORAN KEUANGAN BULANAN\n'
    csvContent += `Periode: ${bulanFilter} ${tahunFilter}\n\n`
    
    csvContent += 'A. RINGKASAN\n'
    csvContent += `Total Pemasukan Iuran Lunas,Rp ${totalTerkumpul}\n`
    csvContent += `Total Pengeluaran,Rp ${totalPengeluaran}\n`
    csvContent += `Saldo Bulan Ini,Rp ${totalTerkumpul - totalPengeluaran}\n`
    csvContent += `Total Iuran Belum Dibayar,Rp ${totalBelumMasuk}\n\n`
    
    csvContent += 'B. RINCIAN PEMASUKAN IURAN\n'
    csvContent += 'No,Nama Warga,Blok / No,Status,Jumlah (Rp)\n'
    if (dataBulanIni.length === 0) {
      csvContent += 'Tidak ada data iuran pada bulan ini.\n'
    } else {
      dataBulanIni.forEach((t, idx) => {
        const isLunas = t.pembayaran?.status === 'SUCCESS'
        csvContent += `${idx + 1},"${t.user.nama}","Blok ${t.user.noRumah}","${isLunas ? 'LUNAS' : 'BELUM BAYAR'}",${t.jumlah}\n`
      })
    }
    csvContent += '\n'
    
    csvContent += 'C. RINCIAN PENGELUARAN\n'
    csvContent += 'No,Tanggal,Keperluan,Sumber Dana,Nominal (Rp)\n'
    if (pengeluaranBulanIni.length === 0) {
      csvContent += 'Tidak ada pengeluaran pada bulan ini.\n'
    } else {
      pengeluaranBulanIni.forEach((p, idx) => {
        csvContent += `${idx + 1},"${new Date(p.createdAt).toLocaleDateString('id-ID')}","${p.keperluan}","${p.sumber}",${p.nominal}\n`
      })
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Laporan_Keuangan_${bulanFilter}_${tahunFilter}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <TopNav title="Laporan Bulanan" />
      <div className="animate-fade-up" style={{ marginBottom: '24px' }}>
        <p className="label-small" style={{ marginBottom: '4px' }}>Tirta Asri Residence</p>
        <h1 className="section-title">Laporan Bulanan</h1>
        <p className="section-subtitle">Rekapitulasi keuangan kas warga (Pemasukan & Pengeluaran)</p>
      </div>

      <div className="card animate-fade-up delay-1" style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
          <button onClick={handleDownloadPDF} className="btn btn-primary" style={{ height: '48px' }}>
            <i className="ri-download-2-line" /> Unduh Laporan PDF
          </button>
        </div>
      </div>

      <div className="stats-container animate-fade-up delay-2" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="stat-box" style={{ flex: 1, minWidth: '140px', padding: '16px', background: 'var(--color-success-bg)', borderRadius: '12px', border: '1px solid var(--color-success)' }}>
          <p style={{ fontSize: '12px', color: 'var(--color-success)', margin: '0 0 4px', fontWeight: 600 }}>Terkumpul (Lunas)</p>
          <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-success)', margin: 0 }}>Rp {totalTerkumpul.toLocaleString('id-ID')}</p>
          <p style={{ fontSize: '11px', color: 'var(--color-success)', margin: '4px 0 0' }}>{tagihanLunas.length} iuran</p>
        </div>
        <div className="stat-box" style={{ flex: 1, minWidth: '140px', padding: '16px', background: 'var(--color-danger-bg)', borderRadius: '12px', border: '1px solid var(--color-danger)' }}>
          <p style={{ fontSize: '12px', color: 'var(--color-danger)', margin: '0 0 4px', fontWeight: 600 }}>Pengeluaran Kas</p>
          <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-danger)', margin: 0 }}>Rp {totalPengeluaran.toLocaleString('id-ID')}</p>
          <p style={{ fontSize: '11px', color: 'var(--color-danger)', margin: '4px 0 0' }}>{pengeluaranBulanIni.length} pengeluaran</p>
        </div>
        <div className="stat-box" style={{ flex: 1, minWidth: '140px', padding: '16px', background: '#f5f5f5', borderRadius: '12px', border: '1px solid #ddd' }}>
          <p style={{ fontSize: '12px', color: '#555', margin: '0 0 4px', fontWeight: 600 }}>Saldo Tersisa (Bulan Ini)</p>
          <p style={{ fontSize: '20px', fontWeight: 700, color: '#333', margin: 0 }}>Rp {(totalTerkumpul - totalPengeluaran).toLocaleString('id-ID')}</p>
          <p style={{ fontSize: '11px', color: '#555', margin: '4px 0 0' }}>Pemasukan - Pengeluaran</p>
        </div>
      </div>

      <div className="animate-fade-up delay-3" style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 16px' }}>Pratinjau Rincian Tagihan Iuran</h3>
        
        {dataBulanIni.length === 0 ? (
          <EmptyState icon="ri-folder-info-line" title="Tidak ada tagihan" description={`Belum ada data iuran pada bulan ${bulanFilter} ${tahunFilter}`} />
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
    </>
  )
}
