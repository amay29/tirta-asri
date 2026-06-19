'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Admin() {
  const [dataIuran, setDataIuran] = useState([
    { id: 1, nama: 'Budi Santoso', blok: 'B17', bulan: 'Juni 2026', nominal: 50000, metode: 'Tunai', status: 'Pending' },
    { id: 2, nama: 'Siti Rahma', blok: 'A05', bulan: 'Juni 2026', nominal: 50000, metode: 'QRIS Gateway', status: 'Lunas' },
    { id: 3, nama: 'Irma Noviana', blok: 'C12', bulan: 'Juni 2026', nominal: 50000, metode: 'QRIS Gateway', status: 'Lunas' },
    { id: 4, nama: 'Agus Setiawan', blok: 'B02', bulan: 'Mei 2026', nominal: 50000, metode: 'Tunai', status: 'Lunas' },
    { id: 5, nama: 'Hendra Wijaya', blok: 'D08', bulan: 'Juni 2026', nominal: 50000, metode: 'QRIS Gateway', status: 'Pending' },
  ])

  const [pengeluaran, setPengeluaran] = useState([
    { id: 1, keperluan: 'Bayar Insentif Satpam', nominal: 100000, sumber: 'Transfer' },
    { id: 2, keperluan: 'Beli Sapu Jalanan', nominal: 20000, sumber: 'Cash' },
  ])

  const [inputKeperluan, setInputKeperluan] = useState('')
  const [inputNominal, setInputNominal] = useState('')
  const [sumberDana, setSumberDana] = useState('Cash')
  const [searchQuery, setSearchQuery] = useState('')
  const [totalSaldo, setTotalSaldo] = useState(0)
  const [kasTunai, setKasTunai] = useState(0)

  useEffect(() => {
    const masukTotal = dataIuran.filter(d => d.status === 'Lunas').reduce((s, d) => s + d.nominal, 0)
    const masukCash  = dataIuran.filter(d => d.status === 'Lunas' && d.metode === 'Tunai').reduce((s, d) => s + d.nominal, 0)
    const keluarTotal = pengeluaran.reduce((s, d) => s + d.nominal, 0)
    const keluarCash  = pengeluaran.filter(d => d.sumber === 'Cash').reduce((s, d) => s + d.nominal, 0)
    setTotalSaldo(masukTotal - keluarTotal)
    setKasTunai(masukCash - keluarCash)
  }, [dataIuran, pengeluaran])

  const handleSetujui = (id) =>
    setDataIuran(prev => prev.map(d => d.id === id ? { ...d, status: 'Lunas' } : d))

  const handleTambah = (e) => {
    e.preventDefault()
    if (!inputKeperluan || !inputNominal) return
    setPengeluaran(prev => [...prev, { id: Date.now(), keperluan: inputKeperluan, nominal: parseInt(inputNominal), sumber: sumberDana }])
    setInputKeperluan('')
    setInputNominal('')
  }

  const handleHapus = (id) => setPengeluaran(prev => prev.filter(d => d.id !== id))

  const wargaTersaring = dataIuran.filter(w =>
    w.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.blok.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const inp = {
    width: '100%', padding: '9px 13px', border: '.5px solid #e0ebe5',
    borderRadius: '10px', fontSize: '13px', fontFamily: "'Inter', sans-serif",
    color: '#18291f', background: '#f8f6f2', outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ backgroundColor: '#f0ede6', minHeight: '100vh', padding: '24px 16px 48px', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=Inter:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .a0{animation:fadeUp .35s ease both}
        .a1{animation:fadeUp .35s .07s ease both}
        .a2{animation:fadeUp .35s .12s ease both}
        .a3{animation:fadeUp .35s .17s ease both}
        .a4{animation:fadeUp .35s .22s ease both}
        .wcard{animation:fadeUp .3s ease both}
        .inp:focus{border-color:#18291f !important;box-shadow:0 0 0 3px #18291f0d}
        .btn-pill:hover{color:#18291f !important;border-color:#b0c8c3 !important}
        .btn-submit:hover{background:#1a5c42 !important}
        .btn-setujui:hover{background:#1a5c42 !important;transform:scale(1.03)}
        .btn-setujui:active{transform:scale(.97)}
        .btn-cancel:hover{color:#b83030 !important}
        .wcard:hover{border-color:#d0e4dd !important}
      `}</style>

      <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}>

        {/* Header */}
        <div className="a0" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
          <div>
            <p style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: '#9ab5b0', margin: '0 0 4px' }}>
              Tirta Asri Residence
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '23px', fontWeight: 600, color: '#18291f', lineHeight: 1.2, margin: 0 }}>
              Dashboard Pengurus
            </h1>
            <p style={{ fontSize: '11px', color: '#8a9e98', margin: '3px 0 0' }}>Kelola kas dan iuran warga</p>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <Link href="/riwayat" className="btn-pill" style={{ fontSize: '11px', fontWeight: 500, color: '#8a9e98', background: '#fff', border: '.5px solid #dde8e3', padding: '7px 13px', borderRadius: '20px', textDecoration: 'none', position: 'relative', transition: 'all .2s' }}>
              Riwayat
            </Link>
            <Link href="/" className="btn-pill" style={{ fontSize: '11px', fontWeight: 500, color: '#8a9e98', background: '#fff', border: '.5px solid #dde8e3', padding: '7px 13px', borderRadius: '20px', textDecoration: 'none', transition: 'all .2s' }}>
              Keluar
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="a1" style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <div style={{ background: '#18291f', borderRadius: '18px', padding: '16px 18px', flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '8.5px', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5a9e8a', margin: '0 0 6px' }}>Total Saldo</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 600, color: '#f5f0e8', margin: '0 0 5px' }}>
              Rp {totalSaldo.toLocaleString('id-ID')}
            </p>
            <p style={{ fontSize: '8.5px', color: '#4a7a68', margin: 0 }}>Cash + QRIS</p>
          </div>
          <div style={{ background: '#fff', border: '.5px solid #e0ebe5', borderRadius: '18px', padding: '16px 18px', flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '8.5px', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9ab5b0', margin: '0 0 6px' }}>Kas Tunai</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 600, color: '#18291f', margin: '0 0 5px' }}>
              Rp {kasTunai.toLocaleString('id-ID')}
            </p>
            <p style={{ fontSize: '8.5px', color: '#b0c8c3', margin: 0 }}>Uang fisik</p>
          </div>
        </div>

        {/* Form Pengeluaran */}
        <div className="a2" style={{ background: '#fff', border: '.5px solid #e0ebe5', borderRadius: '18px', overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{ padding: '14px 18px', borderBottom: '.5px solid #f0ede6' }}>
            <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#18291f', margin: 0 }}>Catat Pengeluaran</p>
            <p style={{ fontSize: '10px', color: '#b0c8c3', margin: '2px 0 0' }}>Masukkan pengeluaran kas RT</p>
          </div>
          <div style={{ padding: '14px 18px' }}>
            <form onSubmit={handleTambah} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <p style={{ fontSize: '10.5px', fontWeight: 600, color: '#5a7a72', margin: '0 0 5px' }}>Keperluan</p>
                <input className="inp" style={inp} type="text" placeholder="Contoh: Bayar insentif satpam" value={inputKeperluan} onChange={e => setInputKeperluan(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <p style={{ fontSize: '10.5px', fontWeight: 600, color: '#5a7a72', margin: '0 0 5px' }}>Nominal (Rp)</p>
                  <input className="inp" style={inp} type="number" placeholder="50000" value={inputNominal} onChange={e => setInputNominal(e.target.value)} required />
                </div>
                <div>
                  <p style={{ fontSize: '10.5px', fontWeight: 600, color: '#5a7a72', margin: '0 0 5px' }}>Sumber Dana</p>
                  <select className="inp" style={{ ...inp, background: '#f8f6f2' }} value={sumberDana} onChange={e => setSumberDana(e.target.value)}>
                    <option value="Cash">Tunai / Cash</option>
                    <option value="Transfer">QRIS / Transfer</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-submit" style={{ width: '100%', padding: '10px', background: '#18291f', color: '#f5f0e8', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginTop: '4px', transition: 'background .2s' }}>
                Tambah Pengeluaran
              </button>
            </form>

            {pengeluaran.length > 0 && (
              <div style={{ borderTop: '.5px dashed #e8e4dc', marginTop: '14px', paddingTop: '10px' }}>
                {pengeluaran.map(e => (
                  <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f6f2', padding: '9px 12px', borderRadius: '10px', marginBottom: '6px' }}>
                    <div>
                      <p style={{ fontSize: '11.5px', fontWeight: 500, color: '#18291f', margin: 0 }}>{e.keperluan}</p>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: '#b83030', margin: '2px 0 0' }}>
                        - Rp {e.nominal.toLocaleString('id-ID')}
                        <span style={{ fontSize: '9px', fontWeight: 500, color: '#8a9e98', background: '#e8e4dc', padding: '1px 6px', borderRadius: '3px', marginLeft: '5px' }}>{e.sumber}</span>
                      </p>
                    </div>
                    <button className="btn-cancel" onClick={() => handleHapus(e.id)} style={{ background: 'none', border: 'none', fontSize: '10.5px', color: '#b0c8c3', cursor: 'pointer', transition: 'color .15s', whiteSpace: 'nowrap' }}>
                      Batalkan
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="a3" style={{ background: '#fff', border: '.5px solid #e0ebe5', borderRadius: '18px', padding: '12px 14px', marginBottom: '12px' }}>
          <input className="inp" style={inp} type="text" placeholder="Cari nama atau nomor blok..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        {/* Warga Cards */}
        <div className="a4" style={{ background: '#fff', border: '.5px solid #e0ebe5', borderRadius: '18px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '.5px solid #f0ede6' }}>
            <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#18291f', margin: 0 }}>Konfirmasi Iuran</p>
            <p style={{ fontSize: '10px', color: '#b0c8c3', margin: '2px 0 0' }}>Setujui pembayaran warga di sini</p>
          </div>
          <div style={{ padding: '0 12px 12px' }}>
            {wargaTersaring.map((w, i) => (
              <div key={w.id} className="wcard" style={{ background: '#f8f6f2', borderRadius: '14px', padding: '13px', marginTop: '9px', border: '.5px solid transparent', transition: 'border-color .2s', animationDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#18291f', margin: 0 }}>{w.nama}</p>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '9.5px', fontWeight: 600, background: '#e4f2ed', color: '#2a7a62', padding: '2px 7px', borderRadius: '4px' }}>{w.blok}</span>
                      <span style={{ fontSize: '9.5px', fontWeight: 600, background: '#e8e4dc', color: '#5a7a72', padding: '2px 7px', borderRadius: '4px' }}>{w.metode}</span>
                    </div>
                  </div>
                  <span style={{ padding: '3px 8px', borderRadius: '5px', fontSize: '9.5px', fontWeight: 700, flexShrink: 0, ...(w.status === 'Lunas' ? { background: '#e0f0ea', color: '#1a6048' } : { background: '#fdf0e0', color: '#9a6010' }) }}>
                    {w.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '.5px solid #e8e4dc' }}>
                  <div>
                    <p style={{ fontSize: '9.5px', color: '#8a9e98', margin: 0 }}>{w.bulan}</p>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#18291f', margin: '2px 0 0' }}>Rp {w.nominal.toLocaleString('id-ID')}</p>
                  </div>
                  {w.status === 'Pending' ? (
                    <button className="btn-setujui" onClick={() => handleSetujui(w.id)} style={{ background: '#18291f', color: '#f5f0e8', border: 'none', padding: '6px 13px', borderRadius: '9px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
                      Setujui
                    </button>
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