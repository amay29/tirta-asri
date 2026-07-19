'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { SkeletonDashboard } from '@/components/Skeleton'
import Link from 'next/link'

import WargaHeader from '@/components/warga/WargaHeader'
import PengumumanSection from '@/components/warga/PengumumanSection'
import KasOverview from '@/components/warga/KasOverview'
import TagihanSection from '@/components/warga/TagihanSection'
import ChangePinModal from '@/components/warga/ChangePinModal'

export default function WargaDashboard() {
  const { user } = useAuth(['WARGA', 'ADMIN_RT', 'ADMIN_IURAN'])
  const [showPinModal, setShowPinModal] = useState(false)

  if (!user) {
    return <SkeletonDashboard />
  }

  return (
    <>
      <WargaHeader user={user} />
      <PengumumanSection />
      <KasOverview />
      
      <Link href="/warga/surat" className="animate-fade-up delay-2 flex justify-between items-center bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[var(--radius-lg)] px-[18px] py-4 mb-2 no-underline transition-shadow hover:shadow-md">
        <div className="flex items-center gap-3">
          <i className="ri-file-text-line text-[22px] text-[var(--color-primary)]" />
          <div>
            <p className="text-[15px] font-semibold text-[var(--color-text)] m-0">Pengajuan Surat</p>
            <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5 m-0">Ajukan surat keterangan RT</p>
          </div>
        </div>
        <i className="ri-arrow-right-s-line text-[20px] text-[var(--color-text-muted)]" />
      </Link>

      <button onClick={() => setShowPinModal(true)} className="animate-fade-up delay-2 flex justify-between items-center bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-[var(--radius-lg)] px-[18px] py-4 mb-4 no-underline transition-shadow hover:shadow-md w-full cursor-pointer outline-none text-left">
        <div className="flex items-center gap-3">
          <i className="ri-lock-password-line text-[22px] text-[var(--color-primary)]" />
          <div>
            <p className="text-[15px] font-semibold text-[var(--color-text)] m-0">Ubah PIN Akun</p>
            <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5 m-0">Ganti password login Anda</p>
          </div>
        </div>
        <i className="ri-arrow-right-s-line text-[20px] text-[var(--color-text-muted)]" />
      </button>

      <TagihanSection user={user} />

      <ChangePinModal isOpen={showPinModal} onClose={() => setShowPinModal(false)} user={user} />
    </>
  )
}