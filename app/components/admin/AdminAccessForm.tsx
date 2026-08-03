'use client'
import { useState } from 'react'

export default function AdminAccessForm() {
  const [form, setForm] = useState({ email: '', expiry: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    const res = await fetch('/api/admin/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (data.error) { setStatus('error'); setMessage(data.error) }
    else { setStatus('success'); setMessage('Complimentary access granted.'); setForm({ email: '', expiry: '' }) }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', background: '#0d2d5e' }}>
        <p style={{ fontSize: '13px', fontWeight: '500', color: '#fff', margin: 0 }}>Grant Complimentary Access</p>
        <p style={{ fontSize: '11px', color: '#8bb4d4', margin: '2px 0 0' }}>Bypasses Stripe payment requirement</p>
      </div>
      <form onSubmit={submit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#4a6d8c', fontWeight: '500', display: 'block', marginBottom: '4px' }}>User email</label>
          <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} required type="email" placeholder="user@company.com"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif' }} />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#4a6d8c', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Access expiry</label>
          <input value={form.expiry} onChange={e => setForm({...form, expiry: e.target.value})} required type="date"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif' }} />
        </div>
        {message && <p style={{ fontSize: '12px', color: status === 'success' ? '#2d6a4f' : '#931621', margin: 0 }}>{message}</p>}
        <button type="submit" disabled={status === 'loading'}
          style={{ background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '7px', padding: '9px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {status === 'loading' ? 'Granting...' : 'Grant access'}
        </button>
      </form>
    </div>
  )
}