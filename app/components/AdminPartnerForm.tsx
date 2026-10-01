'use client'
import { useState } from 'react'

export default function AdminPartnerForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const lbl = { fontSize: '12px', fontWeight: '500', color: '#827d76', display: 'block', marginBottom: '4px' } as const
  const inp = { width: '100%', padding: '8px 12px', border: '1px solid #e8e6e2', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' as const }

  const handleSubmit = async () => {
    if (!name || !email) { alert('Name and email are required'); return }
    setLoading(true); setMsg('')
    const res = await fetch('/api/admin/add-partner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, notes })
    })
    const data = await res.json()
    if (data.error) { alert(data.error) }
    else {
      setMsg(`✓ ${name} added as a permanent partner. They will receive a password setup email.`)
      setName(''); setEmail(''); setNotes('')
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e8e6e2', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2d6a4f' }} />
        <h3 style={{ fontSize: '15px', fontWeight: '500', margin: 0 }}>Add Permanent Partner</h3>
      </div>
      <p style={{ fontSize: '13px', color: '#827d76', margin: '0 0 16px' }}>
        Creates a permanent SP account with no subscription fee. Use for preferred dealer partners. They receive a password setup email and land directly in the SP dashboard.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={lbl}>Dealership / Company Name *</label>
          <input style={inp} placeholder="Morning Flash X-ray Services" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label style={lbl}>Admin Email *</label>
          <input style={inp} type="email" placeholder="dealer@company.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={lbl}>Notes (optional)</label>
        <input style={inp} placeholder="e.g. Preferred dealer — Southeast region" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      <button onClick={handleSubmit} disabled={loading}
        style={{ padding: '9px 20px', background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {loading ? 'Adding...' : '+ Add Permanent Partner'}
      </button>
      {msg && <p style={{ fontSize: '13px', color: '#2d6a4f', marginTop: '12px', margin: '12px 0 0' }}>{msg}</p>}
    </div>
  )
}