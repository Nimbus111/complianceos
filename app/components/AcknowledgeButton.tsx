'use client'

import { useState } from 'react'

export default function AcknowledgeButton({ notificationId }: { notificationId: string }) {
  const [done, setDone] = useState(false)

  const acknowledge = async () => {
    await fetch('/api/enterprise/notify/acknowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_id: notificationId })
    })
    setDone(true)
  }

  if (done) return (
    <span style={{ fontSize: '11px', color: '#2d6a4f', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '20px', padding: '3px 10px', whiteSpace: 'nowrap', fontFamily: 'Inter, system-ui, sans-serif' }}>
      ✓ Acknowledged
    </span>
  )

  return (
    <button onClick={acknowledge}
      style={{ fontSize: '11px', color: '#9a3510', background: '#fff6e8', border: '1px solid #f0d4a0', borderRadius: '20px', padding: '3px 10px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
      Mark as addressed
    </button>
  )
}