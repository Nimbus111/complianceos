'use client'

import { useState } from 'react'

interface Props {
  siteOrgId: string
  enterpriseOrgId: string
  hasPending: boolean
}

export default function SendReminderButton({ siteOrgId, enterpriseOrgId, hasPending }: Props) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'sent' | 'loading'>(
    hasPending ? 'pending' : 'idle'
  )

  const send = async () => {
    if (status === 'pending' || status === 'loading') return
    setStatus('loading')
    const res = await fetch('/api/enterprise/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_org_id: siteOrgId, enterprise_org_id: enterpriseOrgId })
    })
    const data = await res.json()
    setStatus(data.status === 'already_pending' ? 'pending' : 'sent')
  }

  if (status === 'pending') return (
    <span style={{ fontSize: '11px', color: '#9a3510', background: '#fff6e8', border: '1px solid #f0d4a0', borderRadius: '20px', padding: '3px 10px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      ⏳ Reminder pending
    </span>
  )

  if (status === 'sent') return (
    <span style={{ fontSize: '11px', color: '#2d6a4f', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '20px', padding: '3px 10px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      ✓ Reminder sent
    </span>
  )

  return (
    <button onClick={send} disabled={status === 'loading'}
      style={{ fontSize: '11px', color: '#4a6d8c', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '3px 10px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {status === 'loading' ? 'Sending...' : '🔔 Send reminder'}
    </button>
  )
}