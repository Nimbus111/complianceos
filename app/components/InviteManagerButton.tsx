'use client'
import { useState } from 'react'

export default function InviteManagerButton({ siteOrgId, siteName }: { siteOrgId: string, siteName: string }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')
  const [inviteUrl, setInviteUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    const res = await fetch('/api/enterprise/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_org_id: siteOrgId, email, site_name: siteName })
    })
    const data = await res.json()
    setInviteUrl(data.inviteUrl)
    setStatus('done')
  }

  const copy = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      style={{ fontSize: '11px', color: '#2d6a4f', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '20px', padding: '3px 10px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
      + Invite manager
    </button>
  )

  if (status === 'done') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '11px', color: '#4a6d8c', fontFamily: 'Inter, system-ui, sans-serif' }}>Link ready —</span>
      <button onClick={copy}
        style={{ fontSize: '11px', color: copied ? '#2d6a4f' : '#1a5fa8', background: copied ? '#edfaf3' : '#e8f3fb', border: `1px solid ${copied ? '#b8e8cc' : '#c2ddf0'}`, borderRadius: '20px', padding: '3px 10px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {copied ? '✓ Copied!' : 'Copy invite link'}
      </button>
      <button onClick={() => { setOpen(false); setStatus('idle'); setEmail('') }}
        style={{ fontSize: '11px', color: '#a8a39c', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
        Done
      </button>
    </div>
  )

  return (
    <form onSubmit={send} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
      <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
        placeholder="manager@clinic.com"
        style={{ fontSize: '12px', padding: '4px 10px', border: '1px solid #c2ddf0', borderRadius: '6px', fontFamily: 'Inter, system-ui, sans-serif', width: '180px' }} />
      <button type="submit" disabled={status === 'loading'}
        style={{ fontSize: '11px', color: '#fff', background: '#2d6a4f', border: 'none', borderRadius: '20px', padding: '3px 10px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {status === 'loading' ? '...' : 'Send'}
      </button>
      <button type="button" onClick={() => setOpen(false)}
        style={{ fontSize: '11px', color: '#a8a39c', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
        Cancel
      </button>
    </form>
  )
}