'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const APRON_TYPES: Record<string, string> = {
  full_apron: 'Full apron', half_apron: 'Half apron',
  thyroid_shield: 'Thyroid shield', lead_gloves: 'Lead gloves',
  gonad_shield: 'Gonad shield', other: 'Other',
}

export default function InspectorReportPage() {
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [taskPct, setTaskPct] = useState(0)
  const router = useRouter()

  const fetchAll = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles').select('org_id, onboarding_completed').eq('id', user.id).single()
      if (!profile?.onboarding_completed || !profile?.org_id) { router.push('/onboarding'); return }

      const orgId = profile.org_id

      const [orgRes, equipRes, apronRes, docRes, eventRes, ktsRes, checkRes] = await Promise.all([
        supabase.from('organizations').select('*').eq('id', orgId).single(),
        supabase.from('equipment').select('*').eq('org_id', orgId).neq('status', 'retired').order('created_at'),
        supabase.from('lead_aprons').select('*').eq('org_id', orgId).order('created_at'),
        supabase.from('documents').select('*').eq('org_id', orgId).order('created_at', { ascending: false }),
        supabase.from('compliance_calendar').select('*').eq('org_id', orgId).is('completed_at', null).order('due_date'),
        supabase.from('keys_to_success').select('id, topic, sort_order').order('sort_order'),
        supabase.from('compliance_checklists').select('guidance_id').eq('org_id', orgId).eq('completed', true),
      ])

      setReportData({
        org: orgRes.data,
        equipment: equipRes.data || [],
        aprons: apronRes.data || [],
        documents: docRes.data || [],
        events: eventRes.data || [],
        ktsItems: ktsRes.data || [],
        ktsCompleted: new Set((checkRes.data || []).map((c: any) => c.guidance_id)),
      })
    } catch (e: any) {
      setError(e.message || 'Failed to load report data')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
      if (!profile?.org_id) return
      const [{ data: tasks }, { data: completions }] = await Promise.all([
        supabase.from('facility_tasks').select('id'),
        supabase.from('user_task_completions').select('task_id').eq('org_id', profile.org_id),
      ])
      const pct = tasks?.length ? Math.round(((completions?.length || 0) / tasks.length) * 100) : 0
      setTaskPct(pct)
    })
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  if (loading) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#a8a39c', fontSize: '14px' }}>Generating compliance report...</p>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', border: '1px solid #f5c6c9', borderRadius: '12px', padding: '32px', maxWidth: '400px', textAlign: 'center' }}>
        <p style={{ color: '#931621', fontWeight: '500', marginBottom: '8px' }}>Could not load report</p>
        <p style={{ color: '#827d76', fontSize: '13px', marginBottom: '16px' }}>{error}</p>
        <a href="/dashboard" style={{ color: '#1a5fa8', fontSize: '13px' }}>← Back to dashboard</a>
      </div>
    </div>
  )

  if (!reportData) return null

  const { org, equipment, aprons, documents, events, ktsItems, ktsCompleted } = reportData
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const overdueEvents = events.filter((e: any) => new Date(e.due_date) < today)
  const upcomingEvents = events.filter((e: any) => new Date(e.due_date) >= today).slice(0, 20)
  const generatedAt = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
const ktsPct = taskPct
  const th: React.CSSProperties = {
    background: '#0d2d5e', color: '#fff', fontSize: '11px', fontWeight: '500',
    padding: '8px 12px', textAlign: 'left', letterSpacing: '0.05em',
  }
  const td: React.CSSProperties = { fontSize: '12px', color: '#1e1c1a', padding: '8px 12px', borderBottom: '1px solid #eef3fb' }
  const tdAlt: React.CSSProperties = { ...td, background: '#fafcff' }
  const sectionTitle: React.CSSProperties = {
    fontSize: '11px', fontWeight: '500', color: '#0d2d5e', textTransform: 'uppercase',
    letterSpacing: '0.1em', marginBottom: '10px', marginTop: '28px',
    paddingBottom: '6px', borderBottom: '2px solid #c2ddf0', display: 'block',
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif', background: '#f0f4f8' }}>

      <div style={{ background: '#0d2d5e', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ color: '#8bb4d4', fontSize: '11px' }}>ComplianceOS</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/dashboard" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</a>
          <button onClick={() => window.print()}
            style={{ background: '#fff', color: '#0d2d5e', border: 'none', borderRadius: '6px', padding: '6px 16px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
            Print / Save PDF
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }} id="report">

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', paddingBottom: '20px', borderBottom: '2px solid #0d2d5e' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: '500', color: '#a8a39c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Compliance Inspection Report</p>
            <h1 style={{ fontSize: '26px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>{org?.name}</h1>
            <p style={{ fontSize: '13px', color: '#4a6d8c' }}>
              {[org?.facility_type_name, org?.facility_state, ...(org?.modality_names || [])].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: '#a8a39c', marginBottom: '4px' }}>Generated</p>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e' }}>{generatedAt}</p>
            <p style={{ fontSize: '11px', color: '#a8a39c', marginTop: '8px' }}>Powered by The Radiology Coach ComplianceOS</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '8px' }}>
          {[
            { label: 'Compliance score', value: `${ktsPct}%`, color: ktsPct >= 90 ? '#40916c' : ktsPct >= 60 ? '#1a5fa8' : '#c44a1a' },
            { label: 'Keys to Success', value: `${ktsCompleted.size} of ${ktsItems.length} complete`, color: '#0d2d5e' },
            { label: 'Overdue items', value: String(overdueEvents.length), color: overdueEvents.length > 0 ? '#c44a1a' : '#40916c' },
          ].map(m => (
            <div key={m.label} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '8px', padding: '14px 16px' }}>
              <p style={{ fontSize: '11px', color: '#a8a39c', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</p>
              <p style={{ fontSize: '22px', fontWeight: '500', color: m.color }}>{m.value}</p>
            </div>
          ))}
        </div>

        <span style={sectionTitle}>1. Facility &amp; RSO Information</span>
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '8px', overflow: 'hidden', marginBottom: '4px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                ['Facility name', org?.name],
                ['Facility type', org?.facility_type_name],
                ['State', org?.facility_state],
                ['Modalities', (org?.modality_names || []).join(', ')],
                ['Radiation Safety Officer', org?.rso_name],
                ['RSO email', org?.rso_email],
                ['RSO phone', org?.rso_phone],
              ].filter(([, v]) => v).map(([label, value], i) => (
                <tr key={String(label)}>
                  <td style={{ ...(i % 2 === 0 ? td : tdAlt), width: '40%', fontWeight: '500', color: '#4a6d8c' }}>{label}</td>
                  <td style={i % 2 === 0 ? td : tdAlt}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <span style={sectionTitle}>2. X-ray Equipment</span>
        {equipment.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#a8a39c', fontStyle: 'italic' }}>No equipment on record.</p>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '8px', overflow: 'hidden', marginBottom: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Manufacturer / Model', 'Serial Number', 'Facility Reg #', 'Machine Reg #', 'Location', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {equipment.map((eq: any, i: number) => (
                  <tr key={eq.id}>
                    <td style={i % 2 === 0 ? td : tdAlt}>{eq.manufacturer} {eq.model}</td>
                    <td style={i % 2 === 0 ? td : tdAlt}>{eq.serial_number || '—'}</td>
                    <td style={{ ...(i % 2 === 0 ? td : tdAlt), fontWeight: '500' }}>{eq.facility_registration_number || '—'}</td>
                    <td style={{ ...(i % 2 === 0 ? td : tdAlt), fontWeight: '500' }}>{eq.machine_registration_number || '—'}</td>
                    <td style={i % 2 === 0 ? td : tdAlt}>{eq.room_location || '—'}</td>
                    <td style={i % 2 === 0 ? td : tdAlt}>{(eq.status || 'active').replace(/_/g, ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <span style={sectionTitle}>3. Lead Apron Inventory</span>
        {aprons.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#a8a39c', fontStyle: 'italic' }}>No lead aprons on record.</p>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '8px', overflow: 'hidden', marginBottom: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Type', 'ID Tag', 'Manufacturer', 'Size', 'Condition', 'Last Inspected'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {aprons.map((ap: any, i: number) => (
                  <tr key={ap.id}>
                    <td style={i % 2 === 0 ? td : tdAlt}>{APRON_TYPES[ap.item_type] || ap.item_type}</td>
                    <td style={i % 2 === 0 ? td : tdAlt}>{ap.id_tag || '—'}</td>
                    <td style={i % 2 === 0 ? td : tdAlt}>{ap.manufacturer || '—'}</td>
                    <td style={i % 2 === 0 ? td : tdAlt}>{ap.size || '—'}</td>
                    <td style={{ ...(i % 2 === 0 ? td : tdAlt), fontWeight: '500', color: ap.condition === 'good' ? '#40916c' : ap.condition === 'damaged' ? '#c44a1a' : '#1e1c1a' }}>
                      {ap.condition ? ap.condition.charAt(0).toUpperCase() + ap.condition.slice(1) : '—'}
                    </td>
                    <td style={i % 2 === 0 ? td : tdAlt}>
                      {ap.last_inspection_date ? new Date(ap.last_inspection_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <span style={sectionTitle}>4. Compliance Calendar</span>
        {overdueEvents.length === 0 && upcomingEvents.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#a8a39c', fontStyle: 'italic' }}>No calendar events on record.</p>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '8px', overflow: 'hidden', marginBottom: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Event', 'Category', 'Due Date', 'Status'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {[...overdueEvents, ...upcomingEvents].map((ev: any, i: number) => {
                  const isOverdue = new Date(ev.due_date) < today
                  return (
                    <tr key={ev.id}>
                      <td style={i % 2 === 0 ? td : tdAlt}>{ev.title}</td>
                      <td style={i % 2 === 0 ? td : tdAlt}>{(ev.event_category || '').replace(/_/g, ' ')}</td>
                      <td style={i % 2 === 0 ? td : tdAlt}>{new Date(ev.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td style={{ ...(i % 2 === 0 ? td : tdAlt), fontWeight: '500', color: isOverdue ? '#c44a1a' : '#40916c' }}>
                        {isOverdue ? 'Overdue' : 'Upcoming'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <span style={sectionTitle}>5. Documents on File</span>
        {documents.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#a8a39c', fontStyle: 'italic' }}>No documents on record.</p>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '8px', overflow: 'hidden', marginBottom: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>{['Document', 'Category', 'Uploaded', 'Expires'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>
                {documents.map((doc: any, i: number) => {
                  const expired = doc.expiration_date && new Date(doc.expiration_date) < today
                  return (
                    <tr key={doc.id}>
                      <td style={i % 2 === 0 ? td : tdAlt}>{doc.filename}</td>
                      <td style={i % 2 === 0 ? td : tdAlt}>{(doc.category || '').replace(/_/g, ' ')}</td>
                      <td style={i % 2 === 0 ? td : tdAlt}>{new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td style={{ ...(i % 2 === 0 ? td : tdAlt), fontWeight: '500', color: expired ? '#c44a1a' : doc.expiration_date ? '#40916c' : '#a8a39c' }}>
                        {doc.expiration_date ? new Date(doc.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No expiration'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <span style={sectionTitle}>6. Keys to Success — Compliance Checklist</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '4px' }}>
          {ktsItems.map((item: any) => {
            const done = ktsCompleted.has(item.id)
            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: done ? '#edfaf3' : '#fff', border: `1px solid ${done ? '#b8e8cc' : '#dce8f5'}`, borderRadius: '6px' }}>
                <span style={{ fontSize: '13px', color: done ? '#40916c' : '#a8a39c', flexShrink: 0 }}>{done ? '✓' : '○'}</span>
                <span style={{ fontSize: '12px', color: done ? '#1a4731' : '#4a6d8c', fontWeight: done ? '500' : '400' }}>{item.topic}</span>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #0d2d5e' }}>
          <p style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e', marginBottom: '20px' }}>Inspector Signature &amp; Date</p>
          <div style={{ display: 'flex', gap: '40px' }}>
            {['Inspector Signature', 'Printed Name', 'Date of Inspection', 'Badge / ID Number'].map(label => (
              <div key={label} style={{ flex: 1 }}>
                <div style={{ borderBottom: '1px solid #333', height: '32px', marginBottom: '4px' }} />
                <p style={{ fontSize: '10px', color: '#a8a39c' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#a8a39c' }}>
            Generated by The Radiology Coach ComplianceOS · theradiologycoach.com · {generatedAt}
          </p>
        </div>

      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  )
}