import PWAInstallButton from '@/components/PWAInstallButton'
import NotificationButton from '@/components/NotificationButton'

export default function DashboardHeader({ isRT, dashboardTitle, roleBadge }) {
  const currentDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
      <div className="animate-fade-up admin-header-section">
        <div className="admin-header-label">
          <p className="label-small mb-0">Tirta Asri Residence</p>
          <span className="badge badge-accent admin-badge">{roleBadge}</span>
        </div>
        <h1 className="section-title admin-title">{dashboardTitle}</h1>
        <p className="section-subtitle">{currentDate}</p>
      </div>
      <div className="animate-fade-up admin-action-bar">
        <PWAInstallButton />
        <NotificationButton />
        {isRT && (
          <a href="/api/backup" target="_blank" className="btn btn-secondary btn-sm no-underline">
            <i className="ri-file-excel-2-line success-icon" /> Download Rekap Excel
          </a>
        )}
      </div>
    </>
  )
}
