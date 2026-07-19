export default function Loading() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100dvh', padding: '24px', backgroundColor: 'var(--color-bg)'
    }}>
      <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px', marginBottom: '16px' }} />
      <p style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Memuat data...</p>
    </div>
  )
}
