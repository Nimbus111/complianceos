'use client'
import { useState } from 'react'

const inp = { width: '100%', padding: '7px 10px', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif', boxSizing: 'border-box' as const }

interface Props { onSent: (packet: any) => void }

export default function SPInstallationForm({ onSent }: Props) {
  const [siteEmails, setSiteEmails] = useState([''])
  const [machines, setMachines] = useState([{ manufacturer: '', model: '', serial_number: '', purchase_date: '', warranty_expiry_date: '', room_location: '' }])
  const [calEvents, setCalEvents] = useState([{ type: 'calibration', date: '' }])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const addEmail = () => setSiteEmails(p => [...p, ''])
  const removeEmail = (i: number) => setSiteEmails(p => p.filter((_, idx) => idx !== i))
  const updateEmail = (i: number, v: string) => setSiteEmails(p => p.map((x, idx) => idx === i ? v : x))

  const addMachine = () => setMachines(p => [...p, { manufacturer: '', model: '', serial_number: '', purchase_date: '', warranty_expiry_date: '', room_location: '' }])
  const removeMachine = (i: number) => setMachines(p => p.filter((_, idx) => idx !== i))
  const updateMachine = (i: number, key: string, v: string) => setMachines(p => p.map((x, idx) => idx === i ? { ...x, [key]: v } : x))

  const addEvent = () => setCalEvents(p => [...p, { type: 'qa', date: '' }])
  const removeEvent = (i: number) => setCalEvents(p => p.filter((_, idx) => idx !== i))
  const updateEvent = (i: number, key: string, v: string) => setCalEvents(p => p.map((x, idx) => idx === i ? { ...x, [key]: v } : x))

  const handleSubmit = async () => {
    const validEmails = siteEmails.filter(e => e.trim())
    const validMachines = machines.filter(m => m.manufacturer && m.model)
    if (!validEmails.length || !validMachines.length) {
      alert('Please add at least one site email and one machine.')
      return
    }
    setSending(true)
    const validEvents = calEvents.filter(e => e.date)
    for (const email of validEmails) {
      const res = await fetch('/api/sp/installation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinic_email: email.trim(), equipment_list: validMachines, calendar_events: validEvents })
      })
      const data = await res.json()
      if (data.packet) onSent(data.packet)
    }
    setSiteEmails([''])
    setMachines([{ manufacturer: '', model: '', serial_number: '', purchase_date: '', warranty_expiry_date: '', room_location: '' }])
    setCalEvents([{ type: 'calibration', date: '' }])
    setSent(true)
    setTimeout(() => setSent(false), 4000)
    setSending(false)
  }

  return (
    <div style={{ padding: '16px' }}>
      {sent && (
        <div style={{ padding: '10px 14px', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '8px', fontSize: '13px', color: '#2d6a4f', marginBottom: '12px' }}>
          ✓ Installation packet sent — clinic will see it when they log in
        </div>
      )}

      <p style={{ fontSize: '11px', fontWeight: '600', color: '#4a6d8c', textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 8px' }}>Clinic / site email(s) *</p>
      {siteEmails.map((email, i) => (
        <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
          <input type="email" placeholder="manager@clinic.com" value={email}
            onChange={ev => updateEmail(i, ev.target.value)} style={{ ...inp, flex: 1 }} />
          {siteEmails.length > 1 && (
            <button onClick={() => removeEmail(i)}
              style={{ padding: '7px 10px', background: '#fefafb', border: '1px solid #f5c6c9', borderRadius: '7px', color: '#931621', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>✕</button>
          )}
        </div>
      ))}
      <button onClick={addEmail}
        style={{ fontSize: '12px', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '4px 12px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', marginBottom: '16px' }}>
        + Add another site
      </button>

      <p style={{ fontSize: '11px', fontWeight: '600', color: '#4a6d8c', textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 8px' }}>X-ray equipment *</p>
      {machines.map((m, i) => (
        <div key={i} style={{ padding: '12px', background: '#f8fbfe', borderRadius: '8px', border: '1px solid #dce8f5', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e' }}>Machine {i + 1}</span>
            {machines.length > 1 && (
              <button onClick={() => removeMachine(i)}
                style={{ fontSize: '11px', color: '#931621', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>Remove</button>
            )}
          </div>
          <input placeholder="Manufacturer *" value={m.manufacturer} onChange={ev => updateMachine(i, 'manufacturer', ev.target.value)} style={{ ...inp, marginBottom: '6px' }} />
          <input placeholder="Model *" value={m.model} onChange={ev => updateMachine(i, 'model', ev.target.value)} style={{ ...inp, marginBottom: '6px' }} />
          <input placeholder="Serial number" value={m.serial_number} onChange={ev => updateMachine(i, 'serial_number', ev.target.value)} style={{ ...inp, marginBottom: '6px' }} />
          <input placeholder="Room location" value={m.room_location} onChange={ev => updateMachine(i, 'room_location', ev.target.value)} style={{ ...inp, marginBottom: '6px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#4a6d8c', display: 'block', marginBottom: '3px' }}>Purchase date</label>
              <input type="date" value={m.purchase_date} onChange={ev => updateMachine(i, 'purchase_date', ev.target.value)} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#4a6d8c', display: 'block', marginBottom: '3px' }}>Warranty expiry</label>
              <input type="date" value={m.warranty_expiry_date} onChange={ev => updateMachine(i, 'warranty_expiry_date', ev.target.value)} style={inp} />
            </div>
          </div>
        </div>
      ))}
      <button onClick={addMachine}
        style={{ fontSize: '12px', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '4px 12px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', marginBottom: '16px' }}>
        + Add another machine
      </button>

      <p style={{ fontSize: '11px', fontWeight: '600', color: '#4a6d8c', textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 8px' }}>Calendar events</p>
      {calEvents.map((ev, i) => (
        <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
          <select value={ev.type} onChange={e => updateEvent(i, 'type', e.target.value)}
            style={{ padding: '7px 10px', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif' }}>
            <option value="calibration">Annual calibration</option>
            <option value="qa">Equipment QA</option>
            <option value="renewal">Registration renewal</option>
            <option value="dosimetry">Dosimetry reading</option>
            <option value="lead_apron">Lead apron check</option>
          </select>
          <input type="date" value={ev.date} onChange={e => updateEvent(i, 'date', e.target.value)}
            style={{ ...inp, flex: 1 }} />
          {calEvents.length > 1 && (
            <button onClick={() => removeEvent(i)}
              style={{ padding: '7px 10px', background: '#fefafb', border: '1px solid #f5c6c9', borderRadius: '7px', color: '#931621', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>✕</button>
          )}
        </div>
      ))}
      <button onClick={addEvent}
        style={{ fontSize: '12px', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '4px 12px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', marginBottom: '16px' }}>
        + Add calendar event
      </button>

      <button onClick={handleSubmit} disabled={sending}
        style={{ width: '100%', padding: '10px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {sending ? 'Sending...' : `Send to ${siteEmails.filter(e => e.trim()).length || 1} site${siteEmails.filter(e => e.trim()).length > 1 ? 's' : ''} →`}
      </button>
    </div>
  )
}