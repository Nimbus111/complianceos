'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{ background: '#fff', color: '#0d2d5e', border: 'none', borderRadius: '6px', padding: '6px 16px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
      Print / Save PDF
    </button>
  )
}