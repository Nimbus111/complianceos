'use client'

import { useState } from 'react'

export default function SubscribeButton({ plan }: { plan: string }) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Something went wrong')
    } catch {
      alert('Something went wrong — please try again')
    }
    setLoading(false)
  }

  return (
    <button onClick={handleSubscribe} disabled={loading}
      style={{ width: '100%', height: '50px', background: loading ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '500', cursor: loading ? 'default' : 'pointer', fontFamily: 'Inter, system-ui, sans-serif', transition: 'background .15s' }}>
      {loading ? 'Setting up your account...' : 'Start 14-day free trial →'}
    </button>
  )
}