'use client'
import { useState, useEffect } from 'react'

const inp = { padding: '6px 10px', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '12px', fontFamily: 'Inter, system-ui, sans-serif', width: '100%', boxSizing: 'border-box' as const }

export default function SPRegistrationsTable() {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [allStateRules, setAllStateRules] = useState<any[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newState, setNewState] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const res = await fetch('/api/sp/registrations')
    const data = await res.json()
    setRegistrations(data.registrations || [])
    setAllStateRules(data.allStateRules || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const startEdit = (reg: any) => {
    setEditing(reg.state_name)
    setEditForm({ dealer_id: reg.dealer_id || '', renewal_date: reg.renewal_date || '', notes: reg.notes || '' })
  }

  const saveEdit = async (stateName: string) => {
    setSaving(true)
    await fetch('/api/sp/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state_name: stateName, ...editForm })
    })
    await load()
    setEditing(null)
    setSaving(false)
  }

  const addState = async () => {
    if (!newState) return
    setSaving(true)
    await fetch('/api/sp/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state_name: newState, dealer_id: '', renewal_date: '', notes: '' })
    })
    await load()
    setNewState('')
    setAdding(false)
    setSaving(false)
  }

  const unregisteredStates = allStateRules.filter(s => !registrations.find(r => r.state_name === s.state_name))

  const renewalColor = (date: string) => {
    if (!date) return '#a8a39c'
    const d = new Date(date)
    const now = new Date()
    const days = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (days < 0) return '#931621'
    if (days < 60) return '#9a3510'
    return '#2d6a4f'
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e', margin: '0 0 2px' }}>My State Registrations</p>
          <p style={{ fontSize: '12px', color: '#4a6d8c', margin: 0 }}>Track your dealer IDs, renewal dates, and reporting requirements per state</p>
        </div>
        <button onClick={() => setAdding(!adding)}
          style={{ fontSize: '12px', fontWeight: '500', padding: '7px 14px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
          + Add State
        </button>
      </div>

      {adding && (
        <div style={{ background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select value={newState} onChange={e => setNewState(e.target.value)}
            style={{ ...inp, flex: 1 }}>
            <option value="">Select a state...</option>
            {unregisteredStates.map(s => (
              <option key={s.state_name} value={s.state_name}>{s.state_name}</option>
            ))}
          </select>
          <button onClick={addState} disabled={!newState || saving}
            style={{ padding: '6px 14px', background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', whiteSpace: 'nowrap' }}>
            {saving ? 'Adding...' : 'Add'}
          </button>
          <button onClick={() => setAdding(false)}
            style={{ padding: '6px 10px', background: '#fff', color: '#4a6d8c', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <p style={{ fontSize: '13px', color: '#a8a39c', padding: '24px', textAlign: 'center' }}>Loading registrations...</p>
      ) : registrations.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '10px', padding: '40px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', margin: '0 0 8px' }}>No state registrations yet</p>
          <p style={{ fontSize: '13px', color: '#4a6d8c', margin: 0 }}>Click "+ Add State" to track your dealer registrations, IDs, and renewal dates.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '10px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#0d2d5e' }}>
                {['State', 'Dealer ID', 'Renewal Frequency', 'Renewal Date', 'Reporting Requirement', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'rgba(255,255,255,.85)', fontWeight: '500', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg, i) => (
                <tr key={reg.state_name} style={{ borderBottom: '1px solid #f0f4f8', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                  <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0d2d5e' }}>{reg.state_name}</td>

                  <td style={{ padding: '12px 14px', color: '#1e1c1a' }}>
                    {editing === reg.state_name ? (
                      <input value={editForm.dealer_id} onChange={e => setEditForm((p: any) => ({ ...p, dealer_id: e.target.value }))}
                        placeholder="Enter dealer ID" style={inp} />
                    ) : (
                      <span style={{ color: reg.dealer_id ? '#1e1c1a' : '#a8a39c' }}>{reg.dealer_id || '—'}</span>
                    )}
                  </td>

                  <td style={{ padding: '12px 14px' }}>
                    {reg.renewal_frequency ? (
                      <span style={{ background: '#e8f3fb', color: '#1a5fa8', borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: '500' }}>
                        {reg.renewal_frequency}
                      </span>
                    ) : <span style={{ color: '#a8a39c' }}>—</span>}
                  </td>

                  <td style={{ padding: '12px 14px' }}>
                    {editing === reg.state_name ? (
                      <input type="date" value={editForm.renewal_date} onChange={e => setEditForm((p: any) => ({ ...p, renewal_date: e.target.value }))}
                        style={inp} />
                    ) : (
                      <span style={{ color: renewalColor(reg.renewal_date), fontWeight: reg.renewal_date ? '500' : '400' }}>
                        {reg.renewal_date ? new Date(reg.renewal_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : reg.annual_renewal_date || '—'}
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '12px 14px', color: '#4a6d8c', maxWidth: '240px', lineHeight: '1.5' }}>
                    {reg.reporting || <span style={{ color: '#a8a39c' }}>No reporting required</span>}
                  </td>

                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    {editing === reg.state_name ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => saveEdit(reg.state_name)} disabled={saving}
                          style={{ fontSize: '11px', padding: '4px 10px', background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
                          {saving ? '...' : 'Save'}
                        </button>
                        <button onClick={() => setEditing(null)}
                          style={{ fontSize: '11px', padding: '4px 10px', background: '#fff', color: '#4a6d8c', border: '1px solid #c2ddf0', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(reg)}
                        style={{ fontSize: '11px', padding: '4px 10px', background: '#e8f3fb', color: '#1a5fa8', border: '1px solid #c2ddf0', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ fontSize: '11px', color: '#a8a39c', marginTop: '10px' }}>
        Renewal dates shown in <span style={{ color: '#931621' }}>red</span> are past due · <span style={{ color: '#9a3510' }}>amber</span> = within 60 days · <span style={{ color: '#2d6a4f' }}>green</span> = current
      </p>
    </div>
  )
}