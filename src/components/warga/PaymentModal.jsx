'use client'
import { useState } from 'react'
import Modal from '@/components/Modal'
import { QRCodeSVG } from 'qrcode.react'
import { useToast } from '@/components/Toast'

export default function PaymentModal({ isOpen, onClose, tagihan, onSuccess }) {
  const toast = useToast()
  const [metodePilihan, setMetodePilihan] = useState('QRIS Gateway')
  const [paymentStep, setPaymentStep] = useState('select')
  const [buktiFile, setBuktiFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const kirimPembayaran = async (metode, fileUrl = null) => {
    try {
      const res = await fetch('/api/pembayaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tagihanId: tagihan.id, 
          metodeBayar: metode,
          buktiTransfer: fileUrl
        }),
      })
      if (res.ok) {
        setPaymentStep('success')
        toast.success('Pembayaran berhasil dicatat!')
      } else {
        const data = await res.json()
        toast.error(data.pesan || 'Gagal memproses pembayaran')
        onClose()
      }
    } catch {
      toast.error('Gagal mengirim pembayaran')
      onClose()
    }
  }

  const handleProsesMetode = async () => {
    if (metodePilihan === 'QRIS Gateway') {
      setPaymentStep('scanning')
    } else if (metodePilihan === 'Transfer Manual') {
      if (!buktiFile) {
        toast.error('Harap unggah bukti transfer terlebih dahulu')
        return
      }
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', buktiFile)
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (res.ok) {
          const data = await res.json()
          await kirimPembayaran('Transfer Manual', data.url)
        } else {
          const errorData = await res.json()
          toast.error(errorData.pesan || 'Gagal mengunggah bukti transfer')
        }
      } catch (e) {
        toast.error('Terjadi kesalahan saat mengunggah file')
      } finally {
        setIsUploading(false)
      }
    } else {
      kirimPembayaran('Tunai')
    }
  }

  const handleQrisPaid = () => {
    kirimPembayaran('QRIS Gateway')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={paymentStep === 'success' ? undefined : paymentStep === 'scanning' ? 'QRIS Tirta Asri' : 'Metode Pembayaran'}
      size="sm"
    >
      {paymentStep === 'select' && (
        <>
          <p className="text-[13px] text-[var(--color-text-secondary)] m-0 mb-4">
            Iuran {tagihan?.bulan} {tagihan?.tahun} — Rp {tagihan?.jumlah?.toLocaleString('id-ID')}
          </p>
          <select
            value={metodePilihan}
            onChange={(e) => setMetodePilihan(e.target.value)}
            className="select-field mb-4"
          >
            <option value="QRIS Gateway">QRIS Gateway (Scan QR)</option>
            <option value="Tunai">Uang Tunai</option>
            <option value="Transfer Manual">Transfer Manual (Bukti Transfer)</option>
          </select>
          
          {metodePilihan === 'Transfer Manual' && (
            <div className="card-flat mb-4 bg-[var(--color-bg)]">
              <p className="text-[13px] font-semibold text-[var(--color-text)] m-0 mb-1">Bank BCA</p>
              <p className="text-lg font-bold text-[var(--color-primary)] m-0 mb-1 tracking-wide">1234567890</p>
              <p className="text-xs text-[var(--color-text-secondary)] m-0 mb-3">a/n Tirta Asri</p>
              
              <label className="form-label text-[13px]">Unggah Bukti Transfer (Max 2MB)</label>
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/jpg"
                onChange={e => setBuktiFile(e.target.files[0])}
                className="input-field text-[13px] p-2" 
              />
            </div>
          )}

          <button onClick={handleProsesMetode} disabled={isUploading || (metodePilihan === 'Transfer Manual' && !buktiFile)} className="btn btn-primary w-full justify-center">
            {isUploading ? 'Mengunggah...' : 'Lanjutkan Pembayaran'}
          </button>
        </>
      )}

      {paymentStep === 'scanning' && (
        <div className="text-center">
          <div className="w-[180px] h-[180px] mx-auto mb-4 bg-white rounded-[var(--radius-lg)] p-[14px] flex items-center justify-center border border-[var(--color-border-light)]">
            <QRCodeSVG
              value={typeof window !== 'undefined' ? `${window.location.origin}/payment` : 'https://tirta-asri.local/payment'}
              size={152}
              fgColor="#18291f"
            />
          </div>
          <p className="text-[13px] text-[var(--color-text-secondary)] m-0 mb-4">
            Scan dengan aplikasi e-wallet Anda
          </p>
          
          <button onClick={handleQrisPaid} className="btn btn-primary w-full justify-center">
            Saya Sudah Membayar
          </button>
        </div>
      )}

      {paymentStep === 'success' && (
        <div className="text-center py-3">
          <div className="w-14 h-14 rounded-full bg-[var(--color-success-bg)] mx-auto mb-4 flex items-center justify-center">
            <i className="ri-check-line text-[28px] text-[var(--color-success)]" />
          </div>
          <h3 className="font-heading text-xl font-semibold text-[var(--color-success)] m-0 mb-2">
            Berhasil Tercatat
          </h3>
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed m-0 mb-5">
            Pembayaran via <strong>{metodePilihan}</strong> telah tercatat.
            Status akan berubah setelah dikonfirmasi pengurus RT.
          </p>
          <button onClick={onSuccess} className="btn btn-primary w-full justify-center">
            Selesai
          </button>
        </div>
      )}
    </Modal>
  )
}
