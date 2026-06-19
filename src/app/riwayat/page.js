'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RiwayatDanaMasuk() {
  const [filterBulan, setFilterBulan] = useState('Semua')

  // Murni data iuran masuk dari warga (Pemasukan)
  const [dataPemasukan] = useState([
    { id: 1, nama: 'Budi Santoso', blok: 'B17', bulan: 'Juni 2026', nominal: 50000, tanggal: '18 Juni 2026, 09:15', metode: 'Transfer Manual', status: 'Lunas' },
    { id: 2, nama: 'Siti Rahma', blok: 'A05', bulan: 'Juni 2026', nominal: 50000, tanggal: '19 Juni 2026, 14:20', metode: 'QRIS Gateway', status: 'Lunas' },
    { id: 3, nama: 'Irma Noviana', blok: 'C12', bulan: 'Juni 2026', nominal: 50000, tanggal: '19 Juni 2026, 15:02', metode: 'QRIS Gateway', status: 'Lunas' },
    { id: 4, nama: 'Agus Setiawan', blok: 'B02', bulan: 'Mei 2026', nominal: 50000, tanggal: '28 Mei 2026, 10:11', metode: 'Transfer Manual', status: 'Lunas' },
  ])

  // Hitung total iuran warga yang masuk
  const totalIuranMasuk = dataPemasukan
    .filter(item => item.status === 'Lunas')
    .reduce((sum, item) => sum + item.nominal, 0)

  const dataTerfilter = filterBulan === 'Semua' 
    ? dataPemasukan 
    : dataPemasukan.filter(item => item.bulan === filterBulan)

  return (
    <div style={{ backgroundColor: '#f0ede6', minHeight: '100vh', padding: '24px 16px 48px', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght=500;600&family=Inter:wght=400;500;600&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-0 { animation: fadeUp .35s ease both; }
        .anim-1 { animation: fadeUp .35s .07s ease both; }
        .anim-2 { animation: fadeUp .35s .14s ease both; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>
        
        {/* Header */}
        <div className="anim-0" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
          <div>
            <p style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: '#9ab5b0', margin: '0 0 4px' }}>
              Tirta Asri Residence
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 600, color: '#18291f', lineHeight: 1.15, margin: 0 }}>
              Riwayat Dana Masuk
            </h1>
            <p style={{ fontSize: '11px', color: '#8a9e98', margin: '4px 0 0' }}>Khusus pencatatan iuran warga</p>
          </div>
          <Link
            href="/admin"
            style={{
              fontSize: '11px', fontWeight: 500, color: '#18291f',
              background: '#fff', border: '.5px solid #dde8e3',
              padding: '8px 14px', borderRadius: '20px',
              textDecoration: 'none', transition: 'all .2s',
            }}
          >
            ← Kembali
          </Link>
        </div>

        {/* Box Total Pemasukan Iuran */}
        <div className="anim-1" style={{ background: '#18291f', borderRadius: '18px', padding: '20px', color: '#f5f0e8', marginBottom: '16px' }}>
          <p style={{ fontSize: '11px', color: '#5a9e8a', textTransform: 'uppercase', letterSpacing: '.05em', margin: 0 }}>Total Iuran Warga Masuk</p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 600, margin: '6px 0 0', color: '#fff' }}>
            Rp {totalIuranMasuk.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Filter Bulan */}
        <div className="anim-1" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px' }}>
          {['Semua', 'Juni 2026', 'Mei 2026'].map((bulan) => (
            <button
              key={bulan}
              onClick={() => setFilterBulan(bulan)}
              style={{
                padding: '6px 14px', borderRadius: '14px', fontSize: '11.5px', fontWeight: 500,
                border: '.5px solid #dde8e3', cursor: 'pointer',
                backgroundColor: filterBulan === bulan ? '#18291f' : '#fff',
                color: filterBulan === bulan ? '#f5f0e8' : '#5a7a72',
              }}
            >
              {bulan}
            </button>
          ))}
        </div>

        {/* Daftar Transaksi Dana Masuk */}
        <div className="anim-2" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {dataTerfilter.map((item) => (
            <div key={item.id} style={{ background: '#fff', borderRadius: '16px', padding: '14px 16px', border: '.5px solid #e0ebe5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#18291f' }}>{item.nama}</span>
                  <span style={{ fontSize: '10px', color: '#8a9e98', marginLeft: '6px', fontWeight: 600, background: '#f0ede6', padding: '2px 6px', borderRadius: '4px' }}>Blok {item.blok}</span>
                </div>
                <span style={{ background: '#e0f0ea', color: '#1a6048', padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 700 }}>
                  {item.status}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '8px', borderTop: '.5px dashed #f0ede6' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#18291f', fontWeight: 500, margin: 0 }}>Iuran {item.bulan}</p>
                  <p style={{ fontSize: '9.5px', color: '#b0c8c3', margin: '2px 0 0' }}>🕒 {item.tanggal}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '9.5px', color: '#8a9e98', margin: '0 0 2px' }}>{item.metode}</p>
                  <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#18291f', margin: 0 }}>Rp {item.nominal.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}