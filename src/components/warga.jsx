'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'

export default function Warga() {
  const [anggotaKeluarga] = useState([
    { id: 1, nama: 'Widaningrum', status: 'Kepala Keluarga' },
    { id: 2, nama: 'Irma Noviana', status: 'Anggota Keluarga' },
    { id: 3, nama: 'Rangga Basqian', status: 'Anggota Keluarga' },
    { id: 4, nama: 'Damar Alam', status: 'Anggota Keluarga' },
  ])

  const [tagihanWarga, setTagihanWarga] = useState([
    { id: 1, bulan: 'Juli 2026', nominal: 150000, status: 'Belum Bayar' },
    { id: 2, bulan: 'Juni 2026', nominal: 150000, status: 'Pending' },
    { id: 3, bulan: 'Mei 2026', nominal: 150000, status: 'Lunas' },
  ])

  // State Pengontrol Modal & Metode Pembayaran Pilihan Warga
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedTagihanId, setSelectedTagihanId] = useState(null)
  const [metodePilihan, setMetodePilihan] = useState('QRIS Gateway')
  
  // State langkah pembayaran: 'select' (pilih metode), 'scanning' (proses qris), 'success' (berhasil diajukan)
  const [paymentStep, setPaymentStep] = useState('select') 

  // 1. Fungsi saat tombol "Bayar Sekarang" ditekan
  const handleBukaPaymentGateway = (id) => {
    setSelectedTagihanId(id)
    setMetodePilihan('QRIS Gateway') // Default opsi awal
    setPaymentStep('select') // Langkah pertama: Memilih metode pembayaran
    setShowPayModal(true)
  }

  // 2. Fungsi eksekusi setelah warga memilih metode pembayaran
  const handleProsesMetode = () => {
    if (metodePilihan === 'QRIS Gateway') {
      setPaymentStep('scanning')
    } else {
      // Jika memilih Tunai / Cash, langsung masuk ke status sukses pengajuan pending
      setPaymentStep('success')
      setTagihanWarga(prev => prev.map(item =>
        item.id === selectedTagihanId ? { ...item, status: 'Pending' } : item
      ))
    }
  }

  // 3. Efek Simulasi Otomatis khusus pembayaran QRIS Gateway
  useEffect(() => {
    if (showPayModal && paymentStep === 'scanning' && metodePilihan === 'QRIS Gateway') {
      const timer = setTimeout(() => {
        setPaymentStep('success')
        setTagihanWarga(prev => prev.map(item =>
          item.id === selectedTagihanId ? { ...item, status: 'Pending' } : item
        ))
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [showPayModal, paymentStep, selectedTagihanId, metodePilihan])

  const badgeStyle = (status) => {
    if (status === 'Lunas')      return { background: '#e0f0ea', color: '#1a6048' }
    if (status === 'Pending')    return { background: '#fdf0e0', color: '#9a6010' }
    return                              { background: '#fde8e8', color: '#a03030' }
  }

  return (
    <div style={{ backgroundColor: '#f0ede6', minHeight: '100vh', padding: '24px 16px 48px', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght=500;600&family=Inter:wght=400;500;600&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .anim-0 { animation: fadeUp .35s ease both; }
        .anim-1 { animation: fadeUp .35s .07s ease both; }
        .anim-2 { animation: fadeUp .35s .14s ease both; }
        .tcard  { animation: fadeUp .3s ease both; }
        .modal-fade { animation: fadeIn .25s ease both; }
        .s-select { width: 100%; padding: 10px 12px; border-radius: 10px; font-size: 13px; border: .5px solid #e0ebe5; background: #f8f6f2; color: #18291f; box-sizing: border-box; font-family: 'Inter', sans-serif; margin-bottom: 16px; }
        .s-select:focus { border-color: #18291f; outline: none; background: #fff; }
        .btn-bayar:hover  { background: #1a5c42 !important; transform: scale(1.03); }
        .btn-bayar:active { transform: scale(.97); }
        .btn-out:hover { color: #c0392b; border-color: #f5c6c6 !important; }
        .btn-qris-cancel:hover { color: #881b1b !important; }
      `}</style>

      <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>

        {/* MODAL PEMBAYARAN MULTI OPSI (CASH & QRIS) */}
        {showPayModal && (
          <div className="modal-fade" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(24, 41, 31, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', items: 'center', zIndex: 9999, padding: '16px', alignItems: 'center' }}>
            <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '24px', textAlign: 'center', width: '100%', maxWidth: '320px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '.5px solid #e0ebe5' }}>
              
              {/* TAMPILAN A: PILIH METODE PEMBAYARAN */}
              {paymentStep === 'select' && (
                <div className="modal-fade">
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 600, color: '#18291f', margin: '0 0 6px' }}>Metode Pembayaran</p>
                  <p style={{ fontSize: '11px', color: '#8a9e98', margin: '0 0 16px' }}>Silakan pilih metode transaksi iuran warga</p>
                  
                  <select 
                    value={metodePilihan} 
                    onChange={(e) => setMetodePilihan(e.target.value)}
                    className="s-select"
                  >
                    <option value="QRIS Gateway">QRIS Gateway (Otomatis)</option>
                    <option value="Tunai">Tunai / Cash (Titip Pengurus)</option>
                  </select>

                  <button 
                    onClick={handleProsesMetode}
                    style={{ backgroundColor: '#18291f', color: '#f5f0e8', border: 'none', width: '100%', padding: '11px', borderRadius: '12px', fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', fontFamily: "'Inter', sans-serif", marginBottom: '10px' }}
                  >
                    Lanjutkan Pembayaran
                  </button>

                  <button 
                    onClick={() => setShowPayModal(false)}
                    className="btn-qris-cancel"
                    style={{ backgroundColor: 'transparent', color: '#a03030', border: 'none', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
                  >
                    Batalkan
                  </button>
                </div>
              )}

              {/* TAMPILAN B: JIKA MEMILIH QRIS & SEDANG SCANNING */}
              {paymentStep === 'scanning' && (
                <div className="modal-fade">
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 600, color: '#18291f', margin: '0 0 4px' }}>QRIS Tirta Asri</p>
                  <p style={{ fontSize: '10.5px', color: '#cc4141', fontWeight: 600, margin: '0 0 20px' }}>Segera bayar dalam 5 minutes</p>
                  
                  <div style={{ width: '170px', height: '170px', backgroundColor: '#fff', margin: '0 auto 20px', borderRadius: '16px', padding: '12px', boxSizing: 'border-box', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '.5px solid #e0ebe5' }}>
                    <QRCodeSVG value="https://tirta-asri-residence.vercel.app/payment" size={146} fgColor="#18291f" includeMargin={false} />
                  </div>

                  <p style={{ fontSize: '11px', color: '#8a9e98', margin: '0 0 16px', fontStyle: 'italic' }}>
                    Sistem mendeteksi otomatis, silakan scan...
                  </p>

                  <button 
                    onClick={() => setShowPayModal(false)}
                    className="btn-qris-cancel"
                    style={{ backgroundColor: 'transparent', color: '#a03030', border: 'none', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
                  >
                    Batalkan
                  </button>
                </div>
              )}

              {/* TAMPILAN C: SELESAI DIAJUKAN (STATUS PENDING ADMIN) */}
              {paymentStep === 'success' && (
                <div className="modal-fade">
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 600, color: '#1a6048', margin: '10px 0 6px' }}>
                    Pengajuan Berhasil
                  </p>
                  <p style={{ fontSize: '11.5px', color: '#8a9e98', margin: '0 0 24px', lineHeight: 1.4 }}>
                    Pembayaran via <b>{metodePilihan}</b> telah tercatat di sistem. Status tagihan berubah menjadi <b>Pending</b>. Sisa saldo akan diperbarui setelah mendapatkan persetujuan Admin RT.
                  </p>
                  <button 
                    onClick={() => setShowPayModal(false)}
                    style={{ backgroundColor: '#18291f', color: '#f5f0e8', border: 'none', width: '100%', padding: '11px', borderRadius: '12px', fontWeight: 600, fontSize: '12.5px', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
                  >
                    Selesai & Tutup
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Header */}
        <div className="anim-0" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
          <div>
            <p style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: '#9ab5b0', margin: '0 0 4px' }}>
              Tirta Asri Residence
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 600, color: '#18291f', lineHeight: 1.15, margin: 0 }}>
              Dashboard Warga
            </h1>
            <p style={{ fontSize: '11px', color: '#8a9e98', margin: '4px 0 0' }}>Blok B17 — Widaningrum</p>
          </div>
          <Link href="/" className="btn-out" style={{ fontSize: '11px', fontWeight: 500, color: '#8a9e98', background: '#fff', border: '.5px solid #dde8e3', padding: '8px 14px', borderRadius: '20px', textDecoration: 'none', flexShrink: 0, transition: 'all .2s' }}>
            Keluar
          </Link>
        </div>

        {/* Data Keluarga */}
        <div className="anim-1" style={{ background: '#fff', borderRadius: '18px', border: '.5px solid #e0ebe5', overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{ padding: '15px 18px', borderBottom: '.5px solid #f0ede6' }}>
            <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#18291f', margin: 0 }}>Data Keluarga</p>
            <p style={{ fontSize: '10px', color: '#b0c8c3', margin: '2px 0 0' }}>Sesuai Kartu Keluarga</p>
          </div>
          <div style={{ padding: '4px 18px 14px' }}>
            {anggotaKeluarga.map((a, i) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < anggotaKeluarga.length - 1 ? '.5px solid #f0ede6' : 'none' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#18291f' }}>{a.nama}</span>
                <span style={{ fontSize: '10px', fontWeight: 600, padding: '3px 9px', borderRadius: '4px', ...(a.status === 'Kepala Keluarga' ? { background: '#e4f2ed', color: '#2a7a62' } : { background: '#f0ede6', color: '#5a7a72' }) }}>
                  {a.status === 'Kepala Keluarga' ? 'Kepala Keluarga' : 'Anggota'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Iuran Bulanan */}
        <div className="anim-2" style={{ background: '#fff', borderRadius: '18px', border: '.5px solid #e0ebe5', overflow: 'hidden' }}>
          <div style={{ padding: '15px 18px', borderBottom: '.5px solid #f0ede6' }}>
            <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#18291f', margin: 0 }}>Iuran Bulanan</p>
            <p style={{ fontSize: '10px', color: '#b0c8c3', margin: '2px 0 0' }}>History Pembayaran</p>
          </div>

          <div style={{ padding: '0 12px 12px' }}>
            {tagihanWarga.map((t, i) => (
              <div key={t.id} className="tcard" style={{ background: '#f8f6f2', borderRadius: '14px', padding: '14px', marginTop: '10px', border: '.5px solid transparent', animationDelay: `${i * 0.06}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '11px' }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 500, color: '#18291f' }}>{t.bulan}</span>
                  <span style={{ padding: '3px 9px', borderRadius: '5px', fontSize: '9.5px', fontWeight: 700, letterSpacing: '.02em', flexShrink: 0, ...badgeStyle(t.status) }}>{t.status}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '11px', borderTop: '.5px solid #e8e4dc' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: '#8a9e98', margin: 0 }}>Jumlah tagihan</p>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#18291f', margin: '2px 0 0' }}>Rp {t.nominal.toLocaleString('id-ID')}</p>
                  </div>
                  {t.status === 'Belum Bayar' ? (
                    <button onClick={() => handleBukaPaymentGateway(t.id)} className="btn-bayar" style={{ background: '#18291f', color: '#f5f0e8', border: 'none', padding: '7px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all .15s', letterSpacing: '.01em' }}>
                      Bayar Sekarang
                    </button>
                  ) : t.status === 'Pending' ? (
                    <span style={{ fontSize: '10.5px', color: '#9a6010', fontStyle: 'italic' }}>Menunggu RT...</span>
                  ) : (
                    <span style={{ fontSize: '10.5px', color: '#b0c8c3', fontStyle: 'italic' }}>Selesai</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}