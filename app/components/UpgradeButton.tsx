'use client'

export default function UpgradeButton() {
  const handleClick = async () => {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'professional' })
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  return (
    <button onClick={handleClick}
      style={{ background: '#fff', color: '#0d2d5e', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' }}>
      Start free trial →
    </button>
  )
}