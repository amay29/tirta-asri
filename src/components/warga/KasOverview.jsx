'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function KasOverview() {
  const [kasData, setKasData] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/tagihan'),
      fetch('/api/pengeluaran'),
    ])
      .then(async ([allTRes, expRes]) => {
        if (allTRes.ok && expRes.ok) {
          const allTagihan = (await allTRes.json()).tagihan || []
          const allPengeluaran = (await expRes.json()).riwayatPengeluaran || []
          
          const lunas = allTagihan.filter(t => t.pembayaran?.status === 'SUCCESS')
          const masuk = lunas.reduce((s, t) => s + t.jumlah, 0)
          const keluar = allPengeluaran.reduce((s, p) => s + p.nominal, 0)
          
          setKasData({
            totalMasuk: masuk,
            totalKeluar: keluar,
            saldo: masuk - keluar,
          })
        }
      })
      .catch(console.error)
  }, [])

  if (!kasData) return null

  return (
    <div className="card animate-fade-up delay-1 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-9 h-9 rounded-[10px] bg-[#e0f0ea] flex items-center justify-center">
          <i className="ri-safe-2-line text-xl text-[#1a6048]" />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-[var(--color-text)] m-0">
            Transparansi Kas RT
          </p>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5 m-0">
            Rp {kasData.saldo.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
      
      <Link href="/warga/kas" className="btn btn-secondary w-full justify-center">
        Lihat Rincian per Bulan
      </Link>
    </div>
  )
}
