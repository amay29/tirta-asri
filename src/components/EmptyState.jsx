export default function EmptyState({ icon = 'ri-inbox-line', title = 'Belum ada data', description = '' }) {
  return (
    <div className="empty-state">
      <i className={icon} />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  )
}
