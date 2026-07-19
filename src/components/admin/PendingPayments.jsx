export default function PendingPayments({ pendingList, setBuktiUrl, setCancelT, setConfirmApprove }) {
  if (pendingList.length === 0) return null

  return (
    <div className="card animate-fade-up delay-2 admin-pending-card">
      <p className="admin-pending-title">
        <i className="ri-time-line admin-pending-icon" />
        Menunggu Persetujuan ({pendingList.length})
      </p>
      {pendingList.map(t => (
        <div key={t.id} className="card-flat admin-pending-item">
          <div>
            <p className="admin-item-name">{t.user.nama}</p>
            <p className="admin-item-details">
              Blok {t.user.noRumah} · {t.bulan} {t.tahun} · {t.pembayaran?.metodeBayar} · Rp {t.jumlah.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="admin-action-group">
            {t.pembayaran?.buktiTransfer && (
              <button
                onClick={() => setBuktiUrl(t.pembayaran.buktiTransfer)}
                className="btn btn-outline btn-sm"
              >
                <i className="ri-image-line" /> Lihat Bukti
              </button>
            )}
            <button
              onClick={() => setCancelT(t)}
              className="btn btn-secondary btn-sm admin-btn-reject"
            >
              <i className="ri-close-line" /> Tolak
            </button>
            <button
              onClick={() => setConfirmApprove(t)}
              className="btn btn-primary btn-sm"
            >
              <i className="ri-check-line" /> Setujui
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
