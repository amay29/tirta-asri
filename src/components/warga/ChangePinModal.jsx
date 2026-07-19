'use client'
import { useState } from 'react'
import Modal from '@/components/Modal'
import { useToast } from '@/components/Toast'

export default function ChangePinModal({ isOpen, onClose, user }) {
  const toast = useToast()
  const [oldPin, setOldPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [showPin, setShowPin] = useState(false)

  const handleChangePin = async (e) => {
    e.preventDefault()
    if (newPin !== confirmPin) {
      toast.error('PIN baru dan konfirmasi tidak cocok')
      return
    }
    setPinLoading(true)
    try {
      const res = await fetch('/api/auth/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, oldPin, newPin }),
      })
      if (res.ok) {
        toast.success('PIN berhasil diubah')
        onClose()
        setOldPin('')
        setNewPin('')
        setConfirmPin('')
      } else {
        const data = await res.json()
        toast.error(data.pesan || 'Gagal mengubah PIN')
      }
    } catch {
      toast.error('Gagal mengubah PIN')
    } finally {
      setPinLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ubah PIN" size="sm">
      <form onSubmit={handleChangePin}>
        <div className="flex flex-col gap-3">
          <div className="flex justify-end -mb-2.5">
            <button type="button" onClick={() => setShowPin(!showPin)} className="btn btn-ghost btn-sm px-2 text-[13px]">
              <i className={`${showPin ? 'ri-eye-off-line' : 'ri-eye-line'} mr-1`} />
              {showPin ? 'Sembunyikan PIN' : 'Lihat PIN'}
            </button>
          </div>
          <div>
            <label className="form-label text-[14px]">PIN Lama</label>
            <input type={showPin ? 'text' : 'password'} value={oldPin} onChange={e => setOldPin(e.target.value)} className="input-field" placeholder="Masukkan PIN lama" maxLength={6} required />
          </div>
          <div>
            <label className="form-label text-[14px]">PIN Baru</label>
            <input type={showPin ? 'text' : 'password'} value={newPin} onChange={e => setNewPin(e.target.value)} className="input-field" placeholder="Masukkan PIN baru" maxLength={6} required />
          </div>
          <div>
            <label className="form-label text-[14px]">Konfirmasi PIN Baru</label>
            <input type={showPin ? 'text' : 'password'} value={confirmPin} onChange={e => setConfirmPin(e.target.value)} className="input-field" placeholder="Ketik ulang PIN baru" maxLength={6} required />
          </div>
          <button type="submit" disabled={pinLoading || !oldPin || !newPin || !confirmPin} className="btn btn-primary w-full justify-center">
            {pinLoading ? 'Memproses...' : 'Simpan PIN Baru'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
