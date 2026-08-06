'use client'
import { useState } from 'react'

interface Activity {
  type: string
  label: string
  frequency: 'monthly' | 'annual'
}

const ACTIVITIES: Activity[] = [
  { type: 'monthly_dosimetry', label: 'Dosimetry badge exchange', frequency: 'monthly' },
  { type: 'monthly_equipment_qa', label: 'Equipment QA procedures', frequency: 'monthly' },
  { type: 'annual_calibration', label: 'Equipment calibration', frequency: 'annual' },
  { type: 'annual_renewal', label: 'Equipment registration renewal', frequency: 'annual' },
]

interface Props {
  completedActivities: { activity_type: string; period: string }[]
}

export default function ActivityLog({ completedActivities }: Props) {
  const now = new Date()
  const monthPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const yearPeriod = String(now.getFullYear())
  const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' })

  const [checked, setChecked] = useState<Set<string>>(
    new Set(completedActivities.map(a => `${a.activity_type}__${a.period}`))
  )
  const [loading, setLoading] = useState<string | null>(null)

  const toggle = async (activity: Activity) => {
    const period = activity.frequency === 'monthly' ? monthPeriod : yearPeriod
    const key = `${activity.type}__${period}`
    const isCompleted = !checked.has(key)
    setLoading(key)

    await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity_type: activity.type, period, completed: isCompleted })
    })

    setChecked(prev => {
      const next = new Set(prev)
      isCompleted ? next.add(key) : next.delete(key)
      return next
    })
    setLoading(null)
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{ padding: '14px 20px', background: '#0d2d5e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '14px', fontWeight: '500', color: '#fff', margin: 0 }}>Activity Log</p>
        <p style={{ fontSize: '11px', color: '#8bb4d4', margin: 0 }}>Check off recurring compliance activities</p>
      </div>

      <div style={{ padding: '4px 0' }}>
        {['monthly', 'annual'].map(freq => (
          <div key={freq}>
            <div style={{ padding: '10px 20px 6px', borderTop: freq === 'annual' ? '1px solid #f4f7fb' : 'none' }}>
              <span style={{ fontSize: '10px', fontWeight: '600', color: '#4a6d8c', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                {freq === 'monthly' ? `Monthly — ${monthLabel}` : `Annual — ${now.getFullYear()}`}
              </span>
            </div>
            {ACTIVITIES.filter(a => a.frequency === freq).map(activity => {
              const period = freq === 'monthly' ? monthPeriod : yearPeriod
              const key = `${activity.type}__${period}`
              const done = checked.has(key)
              const busy = loading === key
              return (
                <div key={activity.type}
                  onClick={() => !busy && toggle(activity)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', cursor: 'pointer', background: done ? '#f8fffe' : '#fff', borderBottom: '1px solid #f4f7fb' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '5px', border: `2px solid ${done ? '#2d6a4f' : '#c2ddf0'}`, background: done ? '#2d6a4f' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                    {done && <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}>✓</span>}
                  </div>
                  <span style={{ fontSize: '13px', color: done ? '#2d6a4f' : '#0d2d5e', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.8 : 1 }}>
                    {activity.label}
                  </span>
                  {busy && <span style={{ fontSize: '11px', color: '#a8a39c', marginLeft: 'auto' }}>Saving...</span>}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}