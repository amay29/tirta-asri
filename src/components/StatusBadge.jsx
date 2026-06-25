export default function StatusBadge({ status, size = 'sm' }) {
  const map = {
    'Lunas':        { cls: 'badge-success', label: 'Lunas' },
    'SUDAH_BAYAR':  { cls: 'badge-success', label: 'Lunas' },
    'SUCCESS':      { cls: 'badge-success', label: 'Berhasil' },
    'SELESAI':      { cls: 'badge-success', label: 'Selesai' },
    'Pending':      { cls: 'badge-warning', label: 'Menunggu' },
    'PENDING':      { cls: 'badge-warning', label: 'Menunggu' },
    'DIPROSES':     { cls: 'badge-warning', label: 'Diproses' },
    'Belum Bayar':  { cls: 'badge-danger',  label: 'Belum Bayar' },
    'BELUM_BAYAR':  { cls: 'badge-danger',  label: 'Belum Bayar' },
    'DITOLAK':      { cls: 'badge-danger',  label: 'Ditolak' },
    'FAILED':       { cls: 'badge-danger',  label: 'Gagal' },
  }

  const info = map[status] || { cls: 'badge-neutral', label: status }

  return (
    <span className={`badge ${info.cls}`} style={size === 'md' ? { fontSize: '13px', padding: '5px 12px' } : undefined}>
      {info.label}
    </span>
  )
}
