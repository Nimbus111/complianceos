'use client'
import { useState } from 'react'

interface Packet {
  id: string
  clinic_email: string
  equipment_data: any
  calendar_events: any[]
  created_at: string
  sp_org_name?: string
}

interface Props {
  packets: Packet[]
  spName: string
}

export default function InstallationPacketBanner({ packets, spName }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [accepted, setAccepted] = useState<string[]>([])

  const pending = packets.filter(p => !accepted.includes(p.id))
  if (pending.length === 0) return null

  const handleAccept = async (packetId: string) => {
    setAccepting(packetId)
    const res = await fetch('/api/sp/installation/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packet_id: packetId })
    })
    const data = await res.json()
    if (data.error) {
      alert(`Could not accept: ${data.error}`)
    } else {
      setAccepted(prev => [...prev, packetId])
      setExpanded(null)
    }
    setAccepting(null)
  }

  return (
    <div style={{ marginBottom: '20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {pending.map(packet => {
        const eq = packet.equipment_data || {}
        const isOpen = expanded === packet.id
        return (
          <div key={packet.id} style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ padding: '12px 16px', background: '#e8f3fb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>📦</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>
                    Your service provider pre-filled your equipment data
                  </p>
                  <p style={{ fontSize: '11px', color: '#4a6d8c', margin: '2px 0 0' }}>
                    {eq.manufacturer} {eq.model} · {packet.calendar_events?.length || 0} calendar events included
                  </p>
                </div>
              </div>
              <button onClick={() => setExpanded(isOpen ? null : packet.id)}
                style={{ fontSize: '12px', color: '#1a5fa8', background: '#fff', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '4px 12px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
                {isOpen ? 'Hide' : 'Review →'}
              </button>
            </div>

            {isOpen && (
              <div style={{ padding: '16px 20px' }}>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#4a6d8c', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 12px' }}>Equipment details</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { label: 'Manufacturer', value: eq.manufacturer },
                    { label: 'Model', value: eq.model },
                    { label: 'Serial number', value: eq.serial_number },
                    { label: 'Modality', value: eq.modality || eq.type },
                    { label: 'Purchase date', value: eq.purchase_date },
                    { label: 'Warranty expiry', value: eq.warranty_expiry_date },
                  ].filter(f => f.value).map(field => (
                    <div key={field.label} style={{ padding: '8px 12px', background: '#f8fbfe', borderRadius: '6px' }}>
                      <p style={{ fontSize: '11px', color: '#4a6d8c', margin: '0 0 2px' }}>{field.label}</p>
                      <p style={{ fontSize: '13px', color: '#0d2d5e', margin: 0, fontWeight: '500' }}>{field.value}</p>
                    </div>
                  ))}
                </div>

                {packet.calendar_events?.length > 0 && (
                  <>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#4a6d8c', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 10px' }}>Calendar events to be added</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                      {packet.calendar_events.map((ev: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '8px 12px', background: '#f8fbfe', borderRadius: '6px' }}>
                          <span style={{ fontSize: '12px' }}>📅</span>
                          <span style={{ fontSize: '13px', color: '#0d2d5e', flex: 1 }}>{ev.title}</span>
                          <span style={{ fontSize: '12px', color: '#4a6d8c' }}>{ev.date}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleAccept(packet.id)} disabled={accepting === packet.id}
                    style={{ flex: 1, padding: '10px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {accepting === packet.id ? 'Adding to your account...' : 'Accept — add to my account'}
                  </button>
                  <button onClick={() => setExpanded(null)}
                    style={{ padding: '10px 16px', background: '#fff', color: '#4a6d8c', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
                    Review later
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}