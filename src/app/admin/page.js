'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/Toast'
import Modal from '@/components/Modal'
import { SkeletonDashboard } from '@/components/Skeleton'

import DashboardHeader from '@/components/admin/DashboardHeader'
import KasStats from '@/components/admin/KasStats'
import PendingSurat from '@/components/admin/PendingSurat'
import PendingPayments from '@/components/admin/PendingPayments'
import ExpenseManager from '@/components/admin/ExpenseManager'
import AllInvoices from '@/components/admin/AllInvoices'

function statusTampilan(t) {
  if (!t.pembayaran) return 'Belum Bayar'
  if (t.pembayaran.status === 'PENDING') return 'Pending'
  if (t.pembayaran.status === 'SUCCESS') return 'Lunas'
  return 'Belum Bayar'
}

export default function AdminDashboard() {
  const { user } = useAuth(['ADMIN_IURAN', 'ADMIN_RT'])
  const toast = useToast()
  const [tagihanList, setTagihanList] = useState([])
  const [pengeluaran, setPengeluaran] = useState([])
  const [suratList, setSuratList] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  const [confirmApprove, setConfirmApprove] = useState(null)
  const [cancelT, setCancelT] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [buktiUrl, setBuktiUrl] = useState(null)

  const isRT = user?.role === 'ADMIN_RT'
  const isIuran = user?.role === 'ADMIN_IURAN'

  const ambilData = async () => {
    try {
      const fetches = [
        fetch('/api/tagihan'),
        fetch('/api/pengeluaran'),
      ]

      if (isRT) {
        fetches.push(fetch('/api/surat'))
      }

      const results = await Promise.all(fetches)
      if (results[0].ok) { const d = await results[0].json(); setTagihanList(d.tagihan || []) }
      if (results[1].ok) { const d = await results[1].json(); setPengeluaran(d.riwayatPengeluaran || []) }
      if (isRT && results[2] && results[2].ok) {
        const d = await results[2].json()
        setSuratList(d.surat || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => { if (user) ambilData() }, [user])

  const handleSetujui = async (pembayaranId) => {
    try {
      const res = await fetch('/api/pembayaran', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pembayaranId }),
      })
      if (res.ok) {
        toast.success('Pembayaran disetujui')
        setConfirmApprove(null)
        ambilData()
      } else {
        toast.error('Gagal menyetujui')
      }
    } catch { toast.error('Gagal memproses') }
  }

  const handleBatalPembayaran = async (e) => {
    e.preventDefault()
    setCancelLoading(true)
    try {
      const res = await fetch(`/api/pembayaran/${cancelT.pembayaran.id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alasan: cancelReason }),
      })
      if (res.ok) {
        toast.success(cancelT.pembayaran.status === 'SUCCESS' ? 'Pembayaran dibatalkan' : 'Pembayaran ditolak')
        setCancelT(null)
        setCancelReason('')
        ambilData()
      } else {
        const d = await res.json()
        toast.error(d.pesan || 'Gagal membatalkan')
      }
    } catch {
      toast.error('Gagal memproses')
    } finally {
      setCancelLoading(false)
    }
  }

  if (!user || loadingData) return <SkeletonDashboard />

  const tagihanLunas = tagihanList.filter(t => statusTampilan(t) === 'Lunas')
  const masukTunai = tagihanLunas.filter(t => t.pembayaran?.metodeBayar === 'Tunai').reduce((s, t) => s + t.jumlah, 0)
  const masukBank = tagihanLunas.filter(t => t.pembayaran?.metodeBayar === 'QRIS Gateway' || t.pembayaran?.metodeBayar === 'Transfer Manual').reduce((s, t) => s + t.jumlah, 0)
  const keluarTunai = pengeluaran.filter(p => p.sumber === 'Cash').reduce((s, p) => s + p.nominal, 0)
  const keluarBank = pengeluaran.filter(p => p.sumber === 'Transfer').reduce((s, p) => s + p.nominal, 0)
  const kasUangTunai = masukTunai - keluarTunai
  const kasSaldoBank = masukBank - keluarBank
  const totalSaldo = kasUangTunai + kasSaldoBank

  const pendingList = tagihanList.filter(t => statusTampilan(t) === 'Pending')
  const suratPending = suratList.filter(s => s.status === 'PENDING')

  const dashboardTitle = isRT ? 'Dashboard Ketua RT' : 'Dashboard Admin Iuran'
  const roleBadge = isRT ? 'Ketua RT' : 'Admin Iuran'

  return (
    <>
      <DashboardHeader isRT={isRT} dashboardTitle={dashboardTitle} roleBadge={roleBadge} />
      
      <KasStats 
        totalSaldo={totalSaldo} 
        kasUangTunai={kasUangTunai} 
        kasSaldoBank={kasSaldoBank} 
      />
      
      <PendingSurat suratPending={suratPending} isRT={isRT} />
      
      <PendingPayments 
        pendingList={pendingList} 
        setBuktiUrl={setBuktiUrl} 
        setCancelT={setCancelT} 
        setConfirmApprove={setConfirmApprove} 
      />
      
      <ExpenseManager pengeluaran={pengeluaran} onRefresh={ambilData} />
      
      <AllInvoices 
        tagihanList={tagihanList} 
        setCancelT={setCancelT} 
        setConfirmApprove={setConfirmApprove} 
      />

      <Modal isOpen={!!confirmApprove} onClose={() => setConfirmApprove(null)} title="Konfirmasi Persetujuan" size="sm">
        {confirmApprove && (
          <>
            <div className="card-flat admin-modal-content">
              <p className="admin-modal-text">
                Setujui pembayaran dari <strong>{confirmApprove.user.nama}</strong> (Blok {confirmApprove.user.noRumah})?
              </p>
              <p className="admin-modal-period">{confirmApprove.bulan} {confirmApprove.tahun}</p>
              <p className="admin-modal-amount">
                Rp {confirmApprove.jumlah.toLocaleString('id-ID')}
              </p>
            </div>
            <div className="admin-modal-actions">
              <button onClick={() => setConfirmApprove(null)} className="btn btn-secondary btn-sm admin-modal-btn">Batal</button>
              <button onClick={() => handleSetujui(confirmApprove.pembayaran.id)} className="btn btn-primary btn-sm admin-modal-btn admin-btn-center">
                <i className="ri-check-line" /> Ya, Setujui
              </button>
            </div>
          </>
        )}
      </Modal>

      <Modal isOpen={!!cancelT} onClose={() => { setCancelT(null); setCancelReason('') }} title={cancelT?.pembayaran?.status === 'SUCCESS' ? 'Batalkan Persetujuan' : 'Tolak Pembayaran'} size="sm">
        {cancelT && (
          <form onSubmit={handleBatalPembayaran}>
            <div className="card-flat admin-cancel-card">
              <p className="admin-cancel-text">
                Anda akan {cancelT.pembayaran.status === 'SUCCESS' ? 'membatalkan status LUNAS' : 'menolak pembayaran'} atas nama <strong>{cancelT.user.nama}</strong> untuk iuran {cancelT.bulan} {cancelT.tahun}.
              </p>
            </div>
            <div className="admin-cancel-input-group">
              <label className="form-label">
                Alasan Pembatalan {cancelT.pembayaran.status === 'SUCCESS' && <span className="admin-req-asterisk">*wajib</span>}
              </label>
              <textarea 
                value={cancelReason} 
                onChange={e => setCancelReason(e.target.value)} 
                className="textarea-field" 
                placeholder="Misal: Uang belum masuk ke rekening..." 
                rows={3} 
                required={cancelT.pembayaran.status === 'SUCCESS'}
              />
              <p className="admin-cancel-hint">Alasan ini akan dikirim ke warga sebagai notifikasi.</p>
            </div>
            <div className="admin-modal-actions">
              <button type="button" onClick={() => { setCancelT(null); setCancelReason('') }} className="btn btn-secondary admin-modal-btn">Kembali</button>
              <button type="submit" disabled={cancelLoading} className="btn btn-danger admin-modal-btn admin-btn-center">
                {cancelLoading ? 'Memproses...' : 'Ya, Batalkan'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={!!buktiUrl} onClose={() => setBuktiUrl(null)} title="Bukti Transfer" size="md">
        {buktiUrl && (
          <div className="admin-bukti-container">
            <img 
              src={buktiUrl} 
              alt="Bukti Transfer" 
              className="admin-bukti-img" 
            />
            <button onClick={() => setBuktiUrl(null)} className="btn btn-outline admin-bukti-close">
              Tutup
            </button>
          </div>
        )}
      </Modal>
    </>
  )
}