'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Admin() {
  const [dataIuran, setDataIuran] = useState([
    { id: 1, nama: 'Budi Santoso', blok: 'B17', bulan: 'Juni 2026', nominal: 50000, status: 'Pending' },
    { id: 2, nama: 'Siti Rahma', blok: 'A05', bulan: 'Juni 2026', nominal: 50000, status: 'Lunas' },
    { id: 3, nama: 'Irma Noviana', blok: 'C12', bulan: 'Juni 2026', nominal: 50000, status: 'Lunas' },
    { id: 4, nama: 'Agus Setiawan', blok: 'B02', bulan: 'Mei 2026', nominal: 50000, status: 'Lunas' },
    { id: 5, pointer: 'Hendra Wijaya', nama: 'Hendra Wijaya', blok: 'D08', bulan: 'Juni 2026', nominal: 50000, status: 'Pending' },
  ])

  // State Baru: Catatan Pengeluaran untuk Transparansi
  const [pengeluaran, setPengeluaran] = useState([
    { id: 1, keperluan: 'Bayar Insentif Satpam', nominal: 100000 },
  ])
  
  const [inputKeperluan, setInputKeperluan] = useState('')
  const [inputNominal, setInputNominal] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [totalKas, setTotalKas] = useState(0)

  // Menghitung Sisa Saldo: (Total Lunas) - (Total Pengeluaran)
  useEffect(() => {
    const totalMasuk = dataIuran
      .filter(item => item.status === 'Lunas')
      .reduce((sum, item) => sum + item.nominal, 0)
      
    const totalKeluar = pengeluaran.reduce((sum, item) => sum + item.nominal, 0)
    
    setTotalKas(totalMasuk - totalKeluar)
  }, [dataIuran, pengeluaran])

  const handleSetujui = (id) => {
    setDataIuran(prev => prev.map(item =>
      item.id === id ? { ...item, status: 'Lunas' } : item
    ))
  }

  // Fungsi Tambah Pengeluaran RT Baru
  const handleTambahPengeluaran = (e) => {
    e.preventDefault()
    if (!inputKeperluan || !inputNominal) return
    
    const baru = {
      id: Date.now(),
      keperluan: inputKeperluan,
      nominal: parseInt(inputNominal)
    }
    setPengeluaran(prev => [...prev, baru])
    setInputKeperluan('')
    setInputNominal('')
  }

  const wargaTersaring = dataIuran.filter(w =>
    w.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.blok.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div style={{
      backgroundColor: '#f0ede6',
      minHeight: '100vh',
      padding: '24px 16px 48px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght=500;600&family=Inter:wght=400;500;600&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-0 { animation: fadeUp .35s ease both; }
        .anim-1 { animation: fadeUp .35s .07s ease both; }
        .anim-2 { animation: fadeUp .35s .13s ease both; }
        .anim-3 { animation: fadeUp .35s .19s ease both; }
        .wcard  { animation: fadeUp .3s ease both; }
        .btn-setujui:hover  { background: #1a5c42 !important; transform: scale(1.03); }
        .btn-setujui:active { transform: scale(.97); }
        .btn-out:hover { color: #c0392b; border-color: #f5c6c6 !important; }
        .wcard-wrap:hover { border-color: #d0e4dd !important; }
        .s-input:focus {
          border-color: #18291f !important;
          box-shadow: 0 0 0 3px rgba(24,41,31,.07);
          outline: none;
        }
        .btn-keluar:hover { background: #b83227 !important; }
        .btn-nav:hover { background: #e8e4dc !important; color: #18291f !important; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>

        {/* Header (Hanya bagian tombol kanan atas yang disisipkan Link Riwayat) */}
        <div className="anim-0" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
          <div>
            <p style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: '#9ab5b0', margin: '0 0 4px' }}>
              Tirta Asri Residence
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 600, color: '#18291f', lineHeight: 1.15, margin: 0 }}>
              Dashboard Pengurus
            </h1>
            <p style={{ fontSize: '11px', color: '#8a9e98', margin: '4px 0 0' }}>Kelola iuran warga</p>
          </div>
          
          {/* Navigasi Tombol Tambahan */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <Link
              href="/riwayat"
              className="btn-nav"
              style={{
                fontSize: '11px', fontWeight: 500, color: '#8a9e98',
                background: '#fff', border: '.5px solid #dde8e3',
                padding: '8px 14px', borderRadius: '20px',
                textDecoration: 'none', transition: 'all .2s', display: 'flex', alignItems: 'center'
              }}
            >
              Riwayat
            </Link>
            <Link
              href="/"
              className="btn-out"
              style={{
                fontSize: '11px', fontWeight: 500, color: '#8a9e98',
                background: '#fff', border: '.5px solid #dde8e3',
                padding: '8px 14px', borderRadius: '20px',
                textDecoration: 'none', flexShrink: 0,
                transition: 'all .2s', display: 'flex', alignItems: 'center'
              }}
            >
              Keluar
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="anim-1" style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            background: '#18291f', borderRadius: '18px', padding: '18px',
            flex: 1, minWidth: 0,
          }}>
            <p style={{ fontSize: '8.5px', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5a9e8a', margin: '0 0 8px' }}>
              Sisa Saldo Kas
            </p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600, color: '#f5f0e8', margin: '0 0 10px' }}>
              Rp {totalKas.toLocaleString('id-ID')}
            </p>
            <p style={{ fontSize: '9.5px', color: '#4a7a68', margin: 0 }}>
              <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#3a7a62', marginRight: 5, verticalAlign: 'middle' }} />
              Bersih setelah pengeluaran
            </p>
          </div>
          <div style={{
            background: '#fff', border: '.5px solid #e0ebe5',
            borderRadius: '18px', padding: '18px', flex: 1, minWidth: 0,
          }}>
            <p style={{ fontSize: '8.5px', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9ab5b0', margin: '0 0 8px' }}>
              Total Warga
            </p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600, color: '#18291f', margin: '0 0 10px' }}>
              {dataIuran.length}
            </p>
            <p style={{ fontSize: '9.5px', color: '#b0c8c3', margin: 0 }}>
              <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#c0d8d3', marginRight: 5, verticalAlign: 'middle' }} />
              Rumah terdata
            </p>
          </div>
        </div>

        {/* FORM INPUT PENGELUARAN */}
        <div className="anim-1" style={{
          background: '#fff', border: '.5px solid #e0ebe5',
          borderRadius: '18px', overflow: 'hidden', marginBottom: '12px',
          padding: '14px 18px', textAlign: 'left'
        }}>
          <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#18291f', margin: '0 0 2px 0' }}>Input Pengeluaran Kas RT</p>
          <p style={{ fontSize: '10px', color: '#b0c8c3', margin: '0 0 12px 0' }}>Catat pengeluaran untuk transparansi warga</p>
          
          <form onSubmit={handleTambahPengeluaran} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Keperluan (Contoh: Beli Sapu Jalanan)" 
              value={inputKeperluan}
              onChange={(e) => setInputKeperluan(e.target.value)}
              className="s-input"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', fontSize: '12.5px', border: '.5px solid #e0ebe5', background: '#f8f6f2', color: '#18291f', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' }}
            />
            <input 
              type="number" 
              placeholder="Nominal Angka (Contoh: 35000)" 
              value={inputNominal}
              onChange={(e) => setInputNominal(e.target.value)}
              className="s-input"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', fontSize: '12.5px', border: '.5px solid #e0ebe5', background: '#f8f6f2', color: '#18291f', fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' }}
            />
            <button 
              type="submit" 
              className="btn-keluar"
              style={{ backgroundColor: '#cc4141', color: '#fff', border: 'none', padding: '9px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'background .2s', fontFamily: "'Inter', sans-serif" }}
            >
              + Catat Pengeluaran Keluar
            </button>
          </form>
        </div>

        {/* Search */}
        <div className="anim-2" style={{
          background: '#fff', border: '.5px solid #e0ebe5',
          borderRadius: '18px', overflow: 'hidden', marginBottom: '12px',
        }}>
          <div style={{ padding: '14px 18px', borderBottom: '.5px solid #f0ede6', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div>
              <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#18291f', margin: 0 }}>Cari Warga</p>
              <p style={{ fontSize: '10px', color: '#b0c8c3', margin: '1px 0 0' }}>Nama atau nomor blok</p>
            </div>
          </div>
          <div style={{ padding: '13px 16px' }}>
            <input
              type="text"
              className="s-input"
              placeholder="Damar atau B17..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px',
                border: '.5px solid #e0ebe5', borderRadius: '12px',
                fontSize: '13px', fontFamily: "'Inter', sans-serif",
                color: '#18291f', background: '#f8f6f2',
                boxSizing: 'border-box', transition: 'border-color .2s, box-shadow .2s',
              }}
            />
          </div>
        </div>

        {/* Warga Cards */}
        <div className="anim-3" style={{
          background: '#fff', border: '.5px solid #e0ebe5',
          borderRadius: '18px', overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 18px', borderBottom: '.5px solid #f0ede6', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div>
              <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#18291f', margin: 0 }}>Riwayat Pembayaran</p>
              <p style={{ fontSize: '10px', color: '#b0c8c3', margin: '1px 0 0' }}>Ketuk Setujui untuk validasi</p>
            </div>
          </div>

          <div style={{ padding: '0 12px 12px' }}>
            {wargaTersaring.length > 0 ? wargaTersaring.map((w, i) => (
              <div
                key={w.id}
                className="wcard wcard-wrap"
                style={{
                  background: '#f8f6f2', borderRadius: '14px',
                  padding: '14px', marginTop: '10px',
                  border: '.5px solid transparent',
                  transition: 'border-color .2s',
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '11px' }}>
                  <div>
                    <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#18291f', margin: 0 }}>{w.nama}</p>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      fontSize: '10.5px', fontWeight: 600, color: '#2a7a62',
                      background: '#e4f2ed', padding: '2px 7px',
                      borderRadius: '4px', marginTop: '4px',
                    }}>
                      {w.blok}
                    </span>
                  </div>
                  <span style={w.status === 'Lunas'
                    ? { background: '#e0f0ea', color: '#1a6048', padding: '3px 9px', borderRadius: '5px', fontSize: '9.5px', fontWeight: 700, flexShrink: 0 }
                    : { background: '#fdf0e0', color: '#9a6010', padding: '3px 9px', borderRadius: '5px', fontSize: '9.5px', fontWeight: 700, flexShrink: 0 }
                  }>
                    {w.status}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '11px', borderTop: '.5px solid #e8e4dc' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: '#8a9e98', margin: 0 }}>{w.bulan}</p>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#18291f', margin: '2px 0 0' }}>
                      Rp {w.nominal.toLocaleString('id-ID')}
                    </p>
                  </div>
                  {w.status === 'Pending' ? (
                    <button
                      onClick={() => handleSetujui(w.id)}
                      className="btn-setujui"
                      style={{
                        background: '#18291f', color: '#f5f0e8',
                        border: 'none', padding: '7px 14px',
                        borderRadius: '10px', fontSize: '11px',
                        fontWeight: 600, cursor: 'pointer',
                        transition: 'all .15s', letterSpacing: '.01em',
                      }}
                    >
                      ✓ Setujui
                    </button>
                  ) : (
                    <span style={{ fontSize: '10.5px', color: '#b0c8c3', fontStyle: 'italic' }}>Selesai</span>
                  )}
                </div>
              </div>
            )) : (
              <p style={{ textAlign: 'center', padding: '32px 0', fontSize: '12px', fontStyle: 'italic', color: '#b0c8c3', margin: 0 }}>
                Warga tidak ditemukan...
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}