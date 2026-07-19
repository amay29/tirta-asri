import { useState } from 'react'
import { useToast } from '@/components/Toast'

export default function ExpenseManager({ pengeluaran, onRefresh }) {
  const toast = useToast()
  const [inputKeperluan, setInputKeperluan] = useState('')
  const [inputNominal, setInputNominal] = useState('')
  const [sumberDana, setSumberDana] = useState('Cash')

  const handleTambahPengeluaran = async (e) => {
    e.preventDefault()
    if (!inputKeperluan || !inputNominal) return
    try {
      const res = await fetch('/api/pengeluaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keperluan: inputKeperluan, nominal: parseInt(inputNominal), sumber: sumberDana }),
      })
      if (res.ok) {
        setInputKeperluan('')
        setInputNominal('')
        toast.success('Pengeluaran tercatat!')
        onRefresh()
      }
    } catch { toast.error('Gagal mencatat pengeluaran') }
  }

  const handleHapusPengeluaran = async (id) => {
    if (!window.confirm('Yakin ingin membatalkan pengeluaran ini? Data yang sudah dihapus tidak bisa dikembalikan.')) return
    try {
      const res = await fetch('/api/pengeluaran', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) { toast.info('Pengeluaran dibatalkan'); onRefresh() }
    } catch { toast.error('Gagal membatalkan') }
  }

  return (
    <div className="card animate-fade-up delay-3 admin-expense-card">
      <p className="admin-expense-title">
        <i className="ri-arrow-up-circle-line admin-expense-icon" />
        Input Pengeluaran
      </p>
      <form onSubmit={handleTambahPengeluaran} className="admin-expense-form">
        <input type="text" placeholder="Keperluan pengeluaran" value={inputKeperluan} onChange={(e) => setInputKeperluan(e.target.value)} className="input-field" required />
        <input type="text" inputMode="numeric" placeholder="Nominal (Rp)" value={inputNominal} onChange={(e) => setInputNominal(e.target.value.replace(/\\D/g, ''))} className="input-field" required />
        <div>
          <label className="form-label">Sumber Dana</label>
          <select value={sumberDana} onChange={(e) => setSumberDana(e.target.value)} className="select-field">
            <option value="Cash">Uang Tunai / Cash</option>
            <option value="Transfer">Rekening / Hasil QRIS</option>
          </select>
        </div>
        <button type="submit" className="btn btn-danger admin-btn-center">
          <i className="ri-subtract-line" /> Catat Pengeluaran
        </button>
      </form>

      {pengeluaran.length > 0 && (
        <div className="admin-expense-list-container">
          {pengeluaran.slice(0, 5).map(exp => (
            <div key={exp.id} className="card-flat admin-expense-item">
              <div>
                <p className="admin-expense-item-title">{exp.keperluan}</p>
                <p className="admin-expense-item-amount">
                  - Rp {exp.nominal.toLocaleString('id-ID')}
                  <span className="badge badge-neutral admin-badge-sm admin-badge-margin">{exp.sumber}</span>
                </p>
                <p className="admin-expense-item-date">
                  {new Date(exp.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => handleHapusPengeluaran(exp.id)} className="btn btn-ghost admin-btn-cancel">
                Batalkan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
