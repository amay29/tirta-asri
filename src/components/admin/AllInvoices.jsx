import { useState } from 'react'
import EmptyState from '@/components/EmptyState'
import StatusBadge from '@/components/StatusBadge'

function statusTampilan(t) {
  if (!t.pembayaran) return 'Belum Bayar'
  if (t.pembayaran.status === 'PENDING') return 'Pending'
  if (t.pembayaran.status === 'SUCCESS') return 'Lunas'
  return 'Belum Bayar'
}

export default function AllInvoices({ tagihanList, setCancelT, setConfirmApprove }) {
  const [searchQuery, setSearchQuery] = useState('')

  const tagihanTersaring = tagihanList.filter(t =>
    t.user.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user.noRumah.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="animate-fade-up delay-4">
      <div className="admin-search-container">
        <input
          type="text"
          placeholder="Cari nama atau nomor rumah warga..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field admin-search-input"
        />
      </div>

      <p className="admin-invoices-title">
        Semua Tagihan Warga
      </p>

      {tagihanTersaring.length === 0 ? (
        <div className="card">
          <EmptyState icon="ri-search-line" title="Tidak ditemukan" description="Coba kata kunci lain" />
        </div>
      ) : (
        <div className="admin-invoices-list">
          {tagihanTersaring.map(t => {
            const status = statusTampilan(t)
            return (
              <div key={t.id} className="card admin-invoice-card">
                <div className="admin-invoice-header">
                  <div>
                    <p className="admin-invoice-name">{t.user.nama}</p>
                    <div className="admin-invoice-badges">
                      <span className="badge badge-neutral admin-badge-sm">Blok {t.user.noRumah}</span>
                      {t.pembayaran && <span className="badge badge-neutral admin-badge-sm">{t.pembayaran.metodeBayar}</span>}
                    </div>
                  </div>
                  <StatusBadge status={status} />
                </div>
                <div className="divider" />
                <div className="admin-invoice-footer">
                  <div>
                    <p className="admin-invoice-period">{t.bulan} {t.tahun}</p>
                    <p className="admin-invoice-amount">Rp {t.jumlah.toLocaleString('id-ID')}</p>
                  </div>
                  {status === 'Pending' && (
                    <div className="admin-action-group">
                      <button onClick={() => setCancelT(t)} className="btn btn-secondary btn-sm admin-btn-reject">
                        <i className="ri-close-line" /> Tolak
                      </button>
                      <button onClick={() => setConfirmApprove(t)} className="btn btn-primary btn-sm">
                        <i className="ri-check-line" /> Setujui
                      </button>
                    </div>
                  )}
                  {status === 'Lunas' && (
                    <div className="admin-invoice-success">
                      <span className="admin-invoice-valid">Valid ✓</span>
                      <button onClick={() => setCancelT(t)} className="btn btn-ghost btn-sm admin-btn-cancel-small">
                        Batal
                      </button>
                    </div>
                  )}
                  {status === 'Belum Bayar' && <span className="admin-invoice-waiting">Menunggu warga</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
