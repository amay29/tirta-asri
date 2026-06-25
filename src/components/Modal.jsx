'use client'

import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const maxW = size === 'sm' ? '340px' : size === 'lg' ? '520px' : '420px'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: maxW }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Tutup">
          <i className="ri-close-line" />
        </button>
        {title && (
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '20px',
            fontWeight: 600,
            color: 'var(--color-text)',
            margin: '0 0 16px',
            paddingRight: '32px',
          }}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}
