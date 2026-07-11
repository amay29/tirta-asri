'use client'

import { useState, useEffect, use } from 'react'
import Script from 'next/script'

const ISI_TEMPLATE = {
  'Surat Keterangan Domisili': (nama, noRumah) =>
    `Dengan ini menerangkan bahwa yang tersebut di bawah ini:\n\nNama: ${nama}\nAlamat: Perumahan Tirta Asri Residence, Blok ${noRumah}\n\nBenar-benar berdomisili di alamat tersebut di atas. Surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.`,
  'Surat Keterangan Tidak Mampu': (nama, noRumah) =>
    `Dengan ini menerangkan bahwa:\n\nNama: ${nama}\nAlamat: Perumahan Tirta Asri Residence, Blok ${noRumah}\n\nBerdasarkan pengamatan kami, yang bersangkutan termasuk keluarga yang kurang mampu. Surat keterangan ini dibuat untuk keperluan administrasi.`,
  'Surat Pengantar RT': (nama, noRumah) =>
    `Dengan ini memberikan pengantar kepada:\n\nNama: ${nama}\nAlamat: Perumahan Tirta Asri Residence, Blok ${noRumah}\n\nYang bersangkutan adalah benar warga kami yang berdomisili di lingkungan RT kami. Surat pengantar ini dibuat untuk keperluan administrasi.`,
  'Surat Keterangan Usaha': (nama, noRumah) =>
    `Dengan ini menerangkan bahwa:\n\nNama: ${nama}\nAlamat: Perumahan Tirta Asri Residence, Blok ${noRumah}\n\nBerdasarkan data yang ada, yang bersangkutan memiliki usaha dan berdomisili di wilayah kami. Surat ini dibuat sebagai keterangan untuk keperluan administrasi.`,
}

export default function CetakSurat({ params }) {
  const { id } = use(params)
  const [surat, setSurat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetch(`/api/surat/${id}`)
      .then(r => r.json())
      .then(d => setSurat(d.surat))
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f1eb' }}>
      <p style={{ color: '#5a7a72' }}>Memuat surat...</p>
    </div>
  )

  if (!surat) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f1eb' }}>
      <p style={{ color: '#a03030' }}>Surat tidak ditemukan</p>
    </div>
  )

  const tanggal = new Date(surat.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const templateFn = ISI_TEMPLATE[surat.jenisSurat] || ISI_TEMPLATE['Surat Pengantar RT']
  const isiSurat = surat.isiSurat || templateFn(surat.user.nama, surat.user.noRumah)

  const handleDownloadPdf = () => {
    if (typeof window === 'undefined' || !window.html2pdf) {
      alert('Sistem sedang menyiapkan berkas PDF. Mohon coba sesaat lagi.')
      return
    }

    setDownloading(true)
    const element = document.getElementById('surat-content')
    const namaClean = surat.user.nama.replace(/\s+/g, '_')
    const jenisClean = surat.jenisSurat.replace(/\s+/g, '_')

    const opt = {
      margin:       [0.5, 0.5, 0.5, 0.5],
      filename:     `Surat_${jenisClean}_${namaClean}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    }

    window.html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => setDownloading(false))
      .catch(() => {
        setDownloading(false)
        alert('Gagal mengunduh berkas PDF')
      })
  }

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
        strategy="lazyOnload"
      />
      <div className="no-print" style={{
        position: 'fixed', bottom: '24px', right: '24px', zIndex: 100,
        display: 'flex', gap: '8px',
      }}>
        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          style={{
            background: '#0f2d26', color: '#f5f0e8', border: 'none', borderRadius: '14px',
            padding: '14px 28px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            opacity: downloading ? 0.7 : 1,
          }}
        >
          {downloading ? (
            <>
              <i className="ri-loader-4-line animate-spin" /> Mengunduh...
            </>
          ) : (
            <>
              <i className="ri-download-2-line" /> Unduh Berkas PDF
            </>
          )}
        </button>
      </div>
      <div style={{ minHeight: '100vh', background: '#e8e4de', padding: '32px 16px' }}>
        <div id="surat-content" style={{
          maxWidth: '210mm', margin: '0 auto', background: '#fff',
          padding: '48px 56px', boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
          fontFamily: 'Times New Roman, serif', color: '#111', lineHeight: 1.6,
        }}>
          <div style={{ textAlign: 'center', borderBottom: '3px double #333', paddingBottom: '16px', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '1px' }}>RUKUN TETANGGA (RT)</h1>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '4px 0 0' }}>PERUMAHAN TIRTA ASRI RESIDENCE</h2>
            <p style={{ fontSize: '12px', margin: '6px 0 0', color: '#444' }}>Sekretariat: Jl. Tirta Asri No. 1 — Kota Bandung, Jawa Barat</p>
          </div>

          {surat.isiSurat ? (
            <div style={{ fontSize: '14px', marginBottom: '48px', whiteSpace: 'pre-line' }}>
              {surat.isiSurat}
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, textDecoration: 'underline', margin: '0 0 4px' }}>
                  {surat.jenisSurat.toUpperCase()}
                </h3>
                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                  No: {String(surat.id).padStart(3, '0')}/RT-TA/{new Date(surat.createdAt).getFullYear()}
                </p>
              </div>
              <div style={{ fontSize: '14px', marginBottom: '16px', whiteSpace: 'pre-line' }}>
                {isiSurat}
              </div>

              <p style={{ fontSize: '14px', marginBottom: '48px' }}>
                Demikian surat ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
              </p>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'center', minWidth: '200px' }}>
              <p style={{ fontSize: '13px', margin: '0 0 4px' }}>Bandung, {tanggal}</p>
              <p style={{ fontSize: '13px', margin: '0 0 60px' }}>Ketua RT Tirta Asri</p>
              <p style={{ fontSize: '14px', fontWeight: 700, margin: 0, borderBottom: '1px solid #333', paddingBottom: '2px', display: 'inline-block' }}>Pengurus RT</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; margin: 0 !important; }
          #surat-content {
            box-shadow: none !important;
            padding: 20mm 25mm !important;
            max-width: none !important;
          }
          @page { margin: 0; size: A4; }
        }
      `}</style>
    </>
  )
}
