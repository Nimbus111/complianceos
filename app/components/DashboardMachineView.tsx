'use client'
import { useState } from 'react'
import FeatureCards from './FeatureCards'

const MACHINE_CARDS = ['Equipment & Safety', 'Equipment QA', 'Technique Charts']
const MACHINE_ROUTES: Record<string, string> = {
  'Equipment & Safety': '/dashboard/equipment',
  'Equipment QA': '/dashboard/equipment-qa',
  'Technique Charts': '/dashboard/technique-charts',
}

interface Machine {
  id: string
  manufacturer: string | null
  model: string | null
  type: string | null
}

interface Props {
  equipment: Machine[]
  features: any[]
  activityMap: Record<string, boolean>
}

export default function DashboardMachineView({ equipment, features, activityMap }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const atLimit = equipment.length >= 3
  const selectedMachine = equipment.find(e => e.id === selectedId)

  const activeFeatures = features.map(f => {
    if (selectedId && MACHINE_CARDS.includes(f.name)) {
      return { ...f, href: `${MACHINE_ROUTES[f.name] || f.href}?machine=${selectedId}` }
    }
    return f
  })

  return (
    <div>
      {equipment.length > 0 && (
        <div style={{ marginBottom: '20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={() => setSelectedId(null)}
              style={{ fontSize: '12px', fontWeight: '500', padding: '6px 14px', borderRadius: '20px', border: `1px solid ${!selectedId ? '#0d2d5e' : '#c2ddf0'}`, background: !selectedId ? '#0d2d5e' : '#fff', color: !selectedId ? '#fff' : '#4a6d8c', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', alignItems: 'center', gap: '5px' }}>
              🖥️ All Machines
            </button>

            {equipment.map(m => {
              const label = [m.manufacturer, m.model].filter(Boolean).join(' — ') || m.type || 'Machine'
              const isSelected = selectedId === m.id
              return (
                <button key={m.id} onClick={() => setSelectedId(m.id)}
                  style={{ fontSize: '12px', fontWeight: '500', padding: '6px 14px', borderRadius: '20px', border: `1px solid ${isSelected ? '#1a5fa8' : '#c2ddf0'}`, background: isSelected ? '#1a5fa8' : '#f0f4f8', color: isSelected ? '#fff' : '#0d2d5e', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {label}
                </button>
              )
            })}

            {atLimit ? (
              <span title="Your plan includes 3 machines per site. Contact us to add more."
                style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '20px', border: '1px dashed #c2ddf0', color: '#a8a39c', cursor: 'not-allowed', fontFamily: 'Inter, system-ui, sans-serif' }}>
                + Add Machine
              </span>
            ) : (
              <a href="/dashboard/equipment"
                style={{ fontSize: '12px', fontWeight: '500', padding: '6px 14px', borderRadius: '20px', border: '1px dashed #1a5fa8', background: '#fff', color: '#1a5fa8', textDecoration: 'none', fontFamily: 'Inter, system-ui, sans-serif' }}>
                + Add Machine
              </a>
            )}
          </div>

          {/* Machine context banner */}
          {selectedMachine && (
            <div style={{ marginTop: '10px', padding: '9px 14px', borderRadius: '8px', background: '#e8f3fb', border: '1px solid #c2ddf0', fontSize: '12px', color: '#0d2d5e', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '500' }}>
                📋 Viewing: {[selectedMachine.manufacturer, selectedMachine.model].filter(Boolean).join(' ')}
              </span>
              <span style={{ color: '#4a6d8c' }}>
                Equipment &amp; Safety, QA, and Technique Charts are filtered to this machine.
              </span>
              <button onClick={() => setSelectedId(null)}
                style={{ fontSize: '11px', color: '#4a6d8c', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
                View all →
              </button>
            </div>
          )}
        </div>
      )}

      <FeatureCards features={activeFeatures} activityMap={activityMap} />
    </div>
  )
}