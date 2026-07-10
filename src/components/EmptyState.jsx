export default function EmptyState({ icon = 'ri-inbox-line', title = 'Belum ada data', description = '' }) {
  return (
    <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', textAlign: 'center' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f5f1eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
        <i className={icon} style={{ fontSize: '32px', color: '#c9a84c' }} />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#18291f', margin: '0 0 6px' }}>{title}</h3>
      {description && <p style={{ fontSize: '13px', color: '#5a7a72', margin: 0, lineHeight: 1.5, maxWidth: '250px' }}>{description}</p>}
    </div>
  )
}
