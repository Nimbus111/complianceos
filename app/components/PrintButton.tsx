'use client'
export default function PrintButton() {
  return (
    <button onClick={() => window.print()}
      style={{ background: '#1a5fa8', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
      Print / Save PDF
    </button>
  )
}