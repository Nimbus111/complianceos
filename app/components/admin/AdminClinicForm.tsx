'use client'
import { useState } from 'react'

const STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming']
const FACILITY_TYPES = ['Medical Clinic','Chiropractic Clinic','Podiatry Clinic','Dental Office','Veterinary Clinic','Imaging Center','Urgent Care Center','Hospital','Surgery Center','Pain Medicine']
const MODALITIES = ['General Radiography','CT Scanner','CBCT','Portable X-ray','C-arm Fluoroscopy','Mini C-arm','Cone Beam CT','Mammography','MRI','Podiatric Weight-Bearing X-ray']

export default function AdminClinicForm({ enterprises }: { enterprises: any[] }) {
  const [form, setForm] = useState({ enterpriseId: '', name: '', state: '', facilityType: '', modalities: [] as string[], siteLabel: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const toggleMod = (m: string) => setForm(f => ({
    ...f,
    modalities: f.modalities.includes(m) ? f.modalities.filter(x => x !== m) : [...f.modalities, m]
  }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    const res = await fetch('/api/admin/clinic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (data.error) { setStatus('error'); setMessage(data.error) }
    else { setStatus('success'); setMessage(`Clinic added to portfolio.`); setForm({ enterpriseId: '', name: '', state: '', facilityType: '', modalities: [], siteLabel: '' }) }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', background: '#0d2d5e' }}>
        <p style={{ fontSize: '13px', fontWeight: '500', color: '#fff', margin: 0 }}>Add Clinic to Enterprise</p>
        <p style={{ fontSize: '11px', color: '#8bb4d4', margin: '2px 0 0' }}>Creates clinic and links to enterprise portfolio</p>
      </div>
      <form onSubmit={submit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#4a6d8c', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Enterprise</label>
          <select value={form.enterpriseId} onChange={e => setForm({...form, enterpriseId: e.target.value})} required
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <option value="">Select enterprise...</option>
            {enterprises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#4a6d8c', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Clinic name</label>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Atlanta Clinic — Main"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#4a6d8c', fontWeight: '500', display: 'block', marginBottom: '4px' }}>State</label>
            <select value={form.state} onChange={e => setForm({...form, state: e.target.value})} required
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif' }}>
              <option value="">State...</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', color: '#4a6d8c', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Facility type</label>
            <select value={form.facilityType} onChange={e => setForm({...form, facilityType: e.target.value})} required
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif' }}>
              <option value="">Type...</option>
              {FACILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#4a6d8c', fontWeight: '500', display: 'block', marginBottom: '6px' }}>Modalities</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {MODALITIES.map(m => (
              <button type="button" key={m} onClick={() => toggleMod(m)}
                style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', border: `1px solid ${form.modalities.includes(m) ? '#0d2d5e' : '#c2ddf0'}`, background: form.modalities.includes(m) ? '#0d2d5e' : '#fff', color: form.modalities.includes(m) ? '#fff' : '#4a6d8c', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#4a6d8c', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Portfolio display label (optional)</label>
          <input value={form.siteLabel} onChange={e => setForm({...form, siteLabel: e.target.value})} placeholder="Atlanta — Main"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif' }} />
        </div>
        {message && <p style={{ fontSize: '12px', color: status === 'success' ? '#2d6a4f' : '#931621', margin: 0 }}>{message}</p>}
        <button type="submit" disabled={status === 'loading'}
          style={{ background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '7px', padding: '9px 16px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {status === 'loading' ? 'Adding...' : 'Add clinic to portfolio'}
        </button>
      </form>
    </div>
  )
}