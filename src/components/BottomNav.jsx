'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav({ onLogout, user }) {
  const pathname = usePathname()

  const tabs = [
    { href: '/warga', icon: 'ri-home-5', label: 'Beranda', exact: true },
    { href: '/warga/surat', icon: 'ri-file-text', label: 'Surat' },
  ]

  const isAdmin = user?.role === 'ADMIN_RT' || user?.role === 'ADMIN_IURAN'

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href)

        return (
          <Link key={tab.href} href={tab.href} className={`bottom-nav-item${isActive ? ' active' : ''}`}>
            <i className={`${tab.icon}-${isActive ? 'fill' : 'line'}`} />
            <span>{tab.label}</span>
          </Link>
        )
      })}
      {isAdmin && (
        <Link href="/admin" className="bottom-nav-item">
          <i className="ri-settings-4-line" />
          <span>Admin</span>
        </Link>
      )}
      <button className="bottom-nav-item" onClick={onLogout}>
        <i className="ri-logout-box-r-line" />
        <span>Keluar</span>
      </button>
    </nav>
  )
}
