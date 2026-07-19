'use client'
import { useState, useEffect } from 'react'
import Modal from '@/components/Modal'

export default function PengumumanSection() {
  const [pengumuman, setPengumuman] = useState([])
  const [fullscreenFoto, setFullscreenFoto] = useState(null)

  useEffect(() => {
    fetch('/api/pengumuman')
      .then(res => res.json())
      .then(data => setPengumuman(data.pengumuman || []))
      .catch(console.error)
  }, [])

  if (pengumuman.length === 0) return null

  return (
    <>
      <div className="animate-fade-up delay-1 mb-4">
        {pengumuman.slice(0, 2).map(p => (
          <div key={p.id} className={`announcement-card${p.penting ? ' penting' : ''} mb-2`}>
            <div className="flex items-start gap-2.5">
              <i className={`text-[18px] mt-0.5 shrink-0 ${p.penting ? 'ri-megaphone-fill text-[var(--color-accent)]' : 'ri-information-line text-[var(--color-text-muted)]'}`} />
              <div>
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <p className="text-[14px] font-semibold text-[var(--color-text)] m-0">{p.judul}</p>
                  {p.pembuatRole && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-semibold text-white ${p.pembuatRole === 'ADMIN_RT' ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-accent)]'}`}
                    >
                      {p.pembuatRole === 'ADMIN_RT' ? 'Ketua RT' : 'Admin Iuran'}
                    </span>
                  )}
                </div>
                {(p.lampiranType === 'image' || p.foto) && (
                  <div 
                    onClick={() => setFullscreenFoto(p.lampiranUrl || p.foto)}
                    className="mb-2 rounded-lg overflow-hidden h-[140px] bg-[#eee] cursor-pointer"
                  >
                    <img src={p.lampiranUrl || p.foto} alt="Foto Pengumuman" className="w-full h-full object-cover" />
                  </div>
                )}
                {p.lampiranType === 'document' && (
                  <a 
                    href={p.lampiranUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg no-underline text-[var(--color-primary)] text-[13px] font-semibold mb-2"
                  >
                    <i className="ri-file-download-line text-[16px]" />
                    {p.lampiranName || 'Unduh Dokumen'}
                  </a>
                )}
                <p className="text-[13px] text-[var(--color-text-secondary)] m-0 mb-1.5 leading-relaxed whitespace-pre-wrap">
                  {p.isi.length > 120 ? p.isi.slice(0, 120) + '...' : p.isi}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={!!fullscreenFoto} onClose={() => setFullscreenFoto(null)} title="Foto Pengumuman" size="lg">
        {fullscreenFoto && (
          <img src={fullscreenFoto} alt="Fullscreen" className="w-full h-auto rounded-lg" />
        )}
        <button onClick={() => setFullscreenFoto(null)} className="btn btn-secondary w-full mt-4 justify-center">
          Tutup
        </button>
      </Modal>
    </>
  )
}
