'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', icon: 'ri-dashboard-line', label: 'Dashboard', exact: true },
  { href: '/admin/warga', icon: 'ri-group-line', label: 'Kelola Warga' },
  { href: '/admin/surat', icon: 'ri-file-text-line', label: 'Surat Masuk' },
  { href: '/admin/riwayat', icon: 'ri-history-line', label: 'Riwayat Dana' },
  { href: '/admin/pengumuman', icon: 'ri-megaphone-line', label: 'Pengumuman' },
]

export default function AdminSidebar({ isOpen, onClose, onLogout }) {
  const pathname = usePathname()

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 600, color: '#f5f0e8', margin: 0 }}>
            Tirta Asri
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
            Panel Admin RT
          </p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item${isActive ? ' active' : ''}`}
                onClick={onClose}
              >
                <i className={item.icon} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-item" onClick={onLogout} style={{ color: 'rgba(255,255,255,0.4)' }}>
            <i className="ri-logout-box-r-line" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  )
}
