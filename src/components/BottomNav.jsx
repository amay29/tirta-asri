'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav({ user }) {
  const pathname = usePathname()

  const tabs = [
    { href: '/warga', icon: 'ri-home-5', label: 'Beranda', exact: true },
    { href: '/warga/pengumuman', icon: 'ri-notification-3', label: 'Info' },
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
        <Link href="/admin" className={`bottom-nav-item${pathname.startsWith('/admin') ? ' active' : ''}`}>
          <i className={`ri-settings-4-${pathname.startsWith('/admin') ? 'fill' : 'line'}`} />
          <span>Admin</span>
        </Link>
      )}
      <Link href="/warga/profil" className={`bottom-nav-item${pathname.startsWith('/warga/profil') ? ' active' : ''}`}>
        <i className={`ri-user-3-${pathname.startsWith('/warga/profil') ? 'fill' : 'line'}`} />
        <span>Profil</span>
      </Link>
    </nav>
  )
}
