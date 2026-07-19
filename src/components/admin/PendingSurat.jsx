import Link from 'next/link'

function statusSuratLabel(s) {
  if (s === 'PENDING') return 'Menunggu'
  if (s === 'DIPROSES') return 'Diproses'
  if (s === 'SELESAI') return 'Selesai'
  if (s === 'DITOLAK') return 'Ditolak'
  return s
}

export default function PendingSurat({ suratPending, isRT }) {
  if (!isRT || suratPending.length === 0) return null

  return (
    <div className="card animate-fade-up delay-2 admin-surat-card">
      <div className="admin-surat-header">
        <p className="admin-surat-title">
          <i className="ri-file-text-line admin-surat-icon" />
          Surat Menunggu ({suratPending.length})
        </p>
        <Link href="/admin/surat" className="admin-surat-link">
          Lihat Semua →
        </Link>
      </div>
      {suratPending.slice(0, 3).map(s => (
        <div key={s.id} className="card-flat admin-surat-item">
          <div>
            <p className="admin-surat-name">{s.user.nama}</p>
            <p className="admin-surat-details">
              {s.jenisSurat} · Blok {s.user.noRumah}
            </p>
          </div>
          <span className="badge badge-warning badge-sm">{statusSuratLabel(s.status)}</span>
        </div>
      ))}
    </div>
  )
}
