'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const CATEGORIES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  registration_licensing: { label: 'Registration & licensing', color: '#0d2d5e', bg: '#e8f3fb', border: '#c2ddf0' },
  equipment_qa:           { label: 'Equipment QA',             color: '#2d6a4f', bg: '#edfaf3', border: '#b8e8cc' },
  personnel:              { label: 'Personnel',                 color: '#4c1d95', bg: '#f5f3ff', border: '#c4b5fd' },
  safety_equipment:       { label: 'Safety equipment',          color: '#9a3510', bg: '#fff6e8', border: '#f0d4a0' },
  program_review:         { label: 'Program review',            color: '#1a5fa8', bg: '#e8f3fb', border: '#c2ddf0' },
}

const EVENT_TYPES = [
  { value: 'facility_registration_renewal', label: 'Facility registration renewal', category: 'registration_licensing' },
  { value: 'equipment_registration_renewal', label: 'Equipment registration renewal', category: 'registration_licensing' },
  { value: 'business_license_renewal', label: 'Business license renewal', category: 'registration_licensing' },
  { value: 'annual_equipment_evaluation', label: 'Annual equipment evaluation', category: 'equipment_qa' },
  { value: 'semi_annual_qa_testing', label: 'Semi-annual QA testing', category: 'equipment_qa' },
  { value: 'weekly_qa_checks', label: 'Weekly QA checks', category: 'equipment_qa' },
  { value: 'equipment_service', label: 'Equipment service / maintenance', category: 'equipment_qa' },
  { value: 'acceptance_testing', label: 'Acceptance testing (new equipment)', category: 'equipment_qa' },
  { value: 'rso_training_renewal', label: 'RSO training renewal', category: 'personnel' },
  { value: 'operator_ceu', label: 'Operator CEU credits', category: 'personnel' },
  { value: 'dosimetry_badge_exchange', label: 'Dosimetry badge exchange', category: 'personnel' },
  { value: 'staff_training', label: 'Staff training documentation', category: 'personnel' },
  { value: 'lead_apron_inspection', label: 'Lead apron inspection', category: 'safety_equipment' },
  { value: 'dosimetry_calibration', label: 'Dosimetry calibration', category: 'safety_equipment' },
  { value: 'rsp_annual_review', label: 'RSP / RPP annual review', category: 'program_review' },
  { value: 'compliance_self_audit', label: 'Annual compliance self-audit', category: 'program_review' },
]

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [orgName, setOrgName] = useState('')
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [eventType, setEventType] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')

  const selectedType = EVENT_TYPES.find(t => t.value === eventType)

  const fetchEvents = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) { router.push('/onboarding'); return }

    const { data: org } = await supabase
      .from('organizations').select('name').eq('id', profile.org_id).single()
    if (org) setOrgName(org.name)

    const { data } = await supabase
      .from('compliance_calendar')
      .select('*')
      .eq('org_id', profile.org_id)
      .is('completed_at', null)
      .order('due_date', { ascending: true })

    setEvents(data || [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const handleAdd = async () => {
    if (!title || !eventType || !dueDate) return
    setSaving(true)
    const res = await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        event_type: eventType,
        event_category: selectedType?.category || 'program_review',
        due_date: dueDate,
        description,
      })
    })
    if (res.ok) {
      setTitle(''); setEventType(''); setDueDate(''); setDescription('')
      setShowForm(false)
      fetchEvents()
    }
    setSaving(false)
  }

  const handleComplete = async (id: string) => {
    await fetch('/api/calendar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    fetchEvents()
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const overdue   = events.filter(e => new Date(e.due_date) < today)
  const thisMonth = events.filter(e => { const d = new Date(e.due_date); return d >= today && d <= endOfMonth })
  const upcoming  = events.filter(e => new Date(e.due_date) > endOfMonth)

  const inp = { width: '100%', height: '38px', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '0 10px', fontSize: '13px', color: '#0d2d5e', background: '#fff', outline: 'none', boxSizing: 'border-box' as const }

  const EventCard = ({ event }: { event: any }) => {
    const cat = CATEGORIES[event.event_category] || CATEGORIES.program_review
    const due = new Date(event.due_date)
    const isOverdue = due < today
    return (
      <div style={{ background: '#fff', border: `1px solid ${isOverdue ? '#f5c6c9' : '#c2ddf0'}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e' }}>{event.title}</span>
            <span style={{ fontSize: '10px', fontWeight: '500', color: cat.color, background: cat.bg, border: `1px solid ${cat.border}`, borderRadius: '20px', padding: '1px 7px' }}>{cat.label}</span>
          </div>
          <span style={{ fontSize: '11px', color: isOverdue ? '#931621' : '#827d76', fontWeight: isOverdue ? '500' : '400' }}>
            {isOverdue ? `Overdue — ` : 'Due '}{due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          {event.description && <p style={{ fontSize: '11px', color: '#a8a39c', marginTop: '4px' }}>{event.description}</p>}
        </div>
        <button
          onClick={() => handleComplete(event.id)}
          style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', border: `2px solid ${isOverdue ? '#f5c6c9' : '#c2ddf0'}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#a8a39c' }}
          title="Mark complete"
        >
          ✓
        </button>
      </div>
    )
  }

  const Section = ({ title: t, items, color }: { title: string; items: any[]; color: string }) => items.length === 0 ? null : (
    <div style={{ marginBottom: '24px' }}>
      <p style={{ fontSize: '11px', fontWeight: '500', color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{t} · {items.length}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map(e => <EventCard key={e.id} event={e} />)}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f4f7fb' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '500', marginLeft: '10px' }}>ComplianceOS</span>
        </div>
        <a href="/dashboard" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</a>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>Compliance calendar</h1>
            <p style={{ fontSize: '13px', color: '#827d76' }}>{orgName}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ height: '40px', padding: '0 18px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
          >
            {showForm ? 'Cancel' : '+ Add event'}
          </button>
        </div>

        {showForm && (
          <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '14px' }}>New compliance event</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '500', color: '#a8a39c', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Event title</label>
                <input style={inp} type="text" placeholder="e.g. Annual facility registration renewal" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: '500', color: '#a8a39c', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Due date</label>
                <input style={inp} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '500', color: '#a8a39c', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Event type</label>
              <select style={inp} value={eventType} onChange={e => setEventType(e.target.value)}>
                <option value="">Select event type</option>
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <optgroup key={key} label={cat.label}>
                    {EVENT_TYPES.filter(t => t.category === key).map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '500', color: '#a8a39c', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Notes (optional)</label>
              <input style={inp} type="text" placeholder="Any additional notes" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <button
              onClick={handleAdd}
              disabled={!title || !eventType || !dueDate || saving}
              style={{ height: '38px', padding: '0 20px', background: (!title || !eventType || !dueDate) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: (!title || !eventType || !dueDate) ? 'default' : 'pointer' }}
            >
              {saving ? 'Saving...' : 'Save event'}
            </button>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: '#a8a39c', fontSize: '13px', padding: '40px' }}>Loading events...</p>
        ) : events.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>No events yet</p>
            <p style={{ fontSize: '13px', color: '#827d76', lineHeight: '1.6', maxWidth: '360px', margin: '0 auto 20px' }}>
              Add your compliance events manually, or they will auto-populate once your state regulations are connected.
            </p>
            <button onClick={() => setShowForm(true)} style={{ height: '40px', padding: '0 20px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
              Add your first event
            </button>
          </div>
        ) : (
          <>
            <Section title="Overdue" items={overdue} color="#931621" />
            <Section title="This month" items={thisMonth} color="#c44a1a" />
            <Section title="Upcoming" items={upcoming} color="#827d76" />
          </>
        )}
      </div>
    </div>
  )
}