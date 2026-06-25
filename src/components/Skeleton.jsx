export function SkeletonText({ width = '100%', height = '16px', className = '' }) {
  return <div className={`skeleton ${className}`} style={{ width, height, borderRadius: '6px' }} />
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
        <SkeletonText width="45%" height="18px" />
        <SkeletonText width="70px" height="22px" />
      </div>
      <SkeletonText width="60%" height="13px" />
      <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed var(--color-border-light)', display: 'flex', justifyContent: 'space-between' }}>
        <SkeletonText width="40%" height="14px" />
        <SkeletonText width="90px" height="36px" />
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-xl)' }} />
        <div className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-xl)' }} />
      </div>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )
}

export function SkeletonList({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
