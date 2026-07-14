'use client'

import { useRouter } from 'next/navigation'

export default function TopNav({ title = 'Kembali', hideOnDesktop = false }) {
  const router = useRouter()

  return (
    <div 
      className={`top-nav-header ${hideOnDesktop ? 'mobile-only' : ''}`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(245, 241, 235, 0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        margin: '-24px -16px 20px -16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}
    >
      <button 
        onClick={() => router.back()} 
        style={{
          background: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: '10px',
          padding: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          color: 'var(--color-primary)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        }}
      >
        <i className="ri-arrow-left-s-line" style={{ fontSize: '20px' }} />
      </button>
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
        {title}
      </h2>
    </div>
  )
}
