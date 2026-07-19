export default function KasStats({ totalSaldo, kasUangTunai, kasSaldoBank }) {
  return (
    <div className="animate-fade-up delay-1 admin-stat-grid">
      <div className="stat-card stat-card-dark">
        <p className="stat-label stat-label-primary"><i className="ri-wallet-3-line" /> Total Saldo</p>
        <p className="stat-value">Rp {totalSaldo.toLocaleString('id-ID')}</p>
        <p className="stat-footnote stat-footnote-primary">Cash + Bank</p>
      </div>
      <div className="stat-card stat-card-light">
        <p className="stat-label"><i className="ri-money-dollar-circle-line" /> Kas Tunai</p>
        <p className="stat-value">Rp {kasUangTunai.toLocaleString('id-ID')}</p>
        <p className="stat-footnote">Uang Tunai</p>
      </div>
      <div className="stat-card stat-card-light">
        <p className="stat-label"><i className="ri-bank-card-line" /> Saldo Bank</p>
        <p className="stat-value">Rp {kasSaldoBank.toLocaleString('id-ID')}</p>
        <p className="stat-footnote">Transfer Manual & QRIS</p>
      </div>
    </div>
  )
}
