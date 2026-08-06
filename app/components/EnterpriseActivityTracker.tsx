'use client'
import { useState } from 'react'

const ACTIVITIES = [
  { type: 'monthly_dosimetry', label: 'Dosimetry badge exchange', frequency: 'monthly' },
  { type: 'monthly_equipment_qa', label: 'Equipment QA procedures', frequency: 'monthly' },
  { type: 'annual_calibration', label: 'Equipment calibration', frequency: 'annual' },
  { type: 'annual_renewal', label: 'Equipment registration renewal', frequency: 'annual' },
]

interface Site {
  site_org_id: string
  name: string
}

interface Completion {
  org_id: string
  activity_type: string
  period: string
}

interface Props {
  sites: Site[]
  completions: Completion[]
}

export default function EnterpriseActivityTracker({ sites, completions }: Props) {
  const [open, setOpen] = useState(false)
  const [freq, setFreq] = useState<'monthly' | 'annual'>('monthly')

  const now = new Date()
  const periods = freq === 'monthly'
    ? Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleString('default', { month: 'short', year: '2-digit' }) }
      })
    : Array.from({ length: 3 }, (_, i) => {
        const y = now.getFullYear() - i
        return { key: String(y), label: String(y) }
      })

  const currentPeriod = periods[0]
  const activities = ACTIVITIES.filter(a => a.frequency === freq)

  const isDone = (orgId: string, type: string, period: string) =>
    completions.some(c => c.org_id === orgId && c.activity_type === type && c.period === period)

  const sitesDone = (type: string, period: string) =>
    sites.filter(s => isDone(s.site_org_id, type, period)).length

  return (
    <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, system-ui, sans-serif', display: 'block', textAlign: 'left' }}>
        <div style={{ padding: '14px 20px', background: '#0d2d5e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#fff', margin: '0 0 2px' }}>Activity Tracker</p>
            <p style={{ fontSize: '11px', color: '#8bb4d4', margin: 0 }}>Monthly dosimetry · Equipment QA · Annual calibrations · Renewals</p>
          </div>
          <span style={{ color: '#8bb4d4', fontSize: '16px' }}>{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div>
          {/* Frequency toggle */}
          <div style={{ padding: '12px 20px', display: 'flex', gap: '8px', borderBottom: '1px solid #f4f7fb' }}>
            {(['monthly', 'annual'] as const).map(f => (
              <button key={f} onClick={() => setFreq(f)}
                style={{ fontSize: '12px', padding: '5px 14px', borderRadius: '20px', border: `1px solid ${freq === f ? '#0d2d5e' : '#c2ddf0'}`, background: freq === f ? '#0d2d5e' : '#fff', color: freq === f ? '#fff' : '#4a6d8c', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
                {f === 'monthly' ? 'Monthly' : 'Annual'}
              </button>
            ))}
          </div>

          {/* Activity grid */}
          {activities.map(activity => (
            <div key={activity.type} style={{ borderBottom: '1px solid #f4f7fb' }}>
              <div style={{ padding: '12px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e' }}>{activity.label}</span>
                <span style={{ fontSize: '11px', color: '#4a6d8c' }}>
                  {sitesDone(activity.type, currentPeriod.key)} of {sites.length} sites current
                </span>
              </div>

              <div style={{ padding: '0 20px 12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {sites.map(site => (
                  <div key={site.site_org_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {periods.map(p => {
                        const done = isDone(site.site_org_id, activity.type, p.key)
                        return (
                          <div key={p.key} title={`${site.name} — ${p.label}: ${done ? 'Complete' : 'Pending'}`}
                            style={{ width: '22px', height: '22px', borderRadius: '4px', background: done ? '#2d6a4f' : '#f0f4f8', border: `1px solid ${done ? '#b8e8cc' : '#dce8f5'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: done ? '#fff' : '#a8a39c' }}>
                            {done ? '✓' : p.label.slice(0, 1)}
                          </div>
                        )
                      })}
                    </div>
                    <span style={{ fontSize: '10px', color: '#4a6d8c', textAlign: 'center', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{site.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ padding: '10px 20px', background: '#f8fbfe' }}>
            <p style={{ fontSize: '11px', color: '#4a6d8c', margin: 0 }}>
              Squares show the last {freq === 'monthly' ? '6 months' : '3 years'}. Green = complete · Facility staff logs activities from their dashboard.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}