'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi',
  'Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico',
  'New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
  'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming'
]

const PERIODS = ['Q1 2025','Q2 2025','Q3 2025','Q4 2025','Q1 2026','Q2 2026','Q3 2026','Q4 2026']

const inp: React.CSSProperties = {
  width: '100%', height: '38px', border: '1px solid #c2ddf0', borderRadius: '8px',
  padding: '0 10px', fontSize: '13px', color: '#0d2d5e', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '10px', fontWeight: '500', color: '#a8a39c',
  marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.07em',
}

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [orgName, setOrgName] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const [period, setPeriod] = useState('')
  const [state, setState] = useState('')
  const [installations, setInstallations] = useState('')

  const fetchAll = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) { router.push('/onboarding'); return }
    const { data: org } = await supabase.from('organizations').select('name').eq('id', profile.org_id).single()
    if (org) setOrgName(org.name)
    const { data } = await supabase.from('service_provider_reports').select('*').eq('org_id', profile.org_id).order('created_at', { ascending: false })
    setReports(data || [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  const resetForm = () => { setPeriod(''); setState(''); setInstallations(''); setShowForm(false) }

  const handleCreate = async () => {
    if (!period || !state) return
    setSaving(true)
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_period: period, state, installations })
    })
    if (res.ok) { resetForm(); fetchAll() }
    else { const r = await res.json(); alert(r.error || 'Error') }
    setSaving(false)
  }

  const handleSubmit = async (id: string) => {
    if (!confirm('Mark this report as submitted to the state? This cannot be undone.')) return
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'submit', id })
    })
    fetchAll()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report? Cannot be undone.')) return
    await fetch('/api/reports', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchAll()
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#a8a39c' }}>Loading reports...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', marginLeft: '10px' }}>ComplianceOS</span>
        </div>
        <a href="/dashboard" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</a>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>Quarterly Reports</h1>
            <p style={{ fontSize: '13px', color: '#827d76' }}>{orgName} · State installation reports</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            style={{ height: '36px', padding: '0 16px', background: showForm ? '#fff' : '#0d2d5e', color: showForm ? '#0d2d5e' : '#fff', border: `1px solid ${showForm ? '#c2ddf0' : '#0d2d5e'}`, borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
            {showForm ? 'Cancel' : '+ Create report'}
          </button>
        </div>

        <div style={{ background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '12px', color: '#1a5fa8', lineHeight: '1.6' }}>
          Some states require x-ray service providers to submit periodic reports listing equipment they have installed or serviced. Use this page to draft, track, and record your submissions.
        </div>

        {showForm && (
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '14px' }}>Create state installation report</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={lbl}>Report period *</label>
                <select style={inp} value={period} onChange={e => setPeriod(e.target.value)}>
                  <option value="">Select period</option>
                  {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>State *</label>
                <select style={inp} value={state} onChange={e => setState(e.target.value)}>
                  <option value="">Select state</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Installations — facility name, modality, serial number, date</label>
                <textarea
                  value={installations}
                  onChange={e => setInstallations(e.target.value)}
                  placeholder={`One installation per line, e.g.:\nSunrise Dental — CBCT — SN: 2024-0042 — Installed: 03/15/2026\nBrookside Podiatry — General Radiography — SN: BD-1190 — Installed: 04/02/2026`}
                  rows={6}
                  style={{ width: '100%', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '10px', fontSize: '13px', color: '#0d2d5e', background: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: '1.6', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <button onClick={handleCreate} disabled={!period || !state || saving}
              style={{ height: '36px', padding: '0 18px', background: (!period || !state) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: (!period || !state) ? 'default' : 'pointer' }}>
              {saving ? 'Creating...' : 'Create report'}
            </button>
          </div>
        )}

        {reports.length === 0 && !showForm ? (
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>No reports yet</p>
            <p style={{ fontSize: '13px', color: '#827d76', maxWidth: '380px', margin: '0 auto' }}>Create your first quarterly state installation report to track and document your x-ray equipment installations.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reports.map(rep => {
              const isDraft = rep.status === 'draft'
              return (
                <div key={rep.id} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: rep.installations ? '12px' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>{rep.report_period} — {rep.state}</p>
                      <span style={{ fontSize: '10px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px', border: '1px solid', color: isDraft ? '#9a3510' : '#2d6a4f', background: isDraft ? '#fff6e8' : '#edfaf3', borderColor: isDraft ? '#f0d4a0' : '#b8e8cc' }}>
                        {isDraft ? 'Draft' : 'Submitted'}
                      </span>
                      {rep.submitted_at && (
                        <span style={{ fontSize: '11px', color: '#a8a39c' }}>
                          Submitted {new Date(rep.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {isDraft && (
                        <button onClick={() => handleSubmit(rep.id)}
                          style={{ padding: '4px 12px', border: '1px solid #b8e8cc', borderRadius: '6px', background: '#edfaf3', color: '#2d6a4f', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}>
                          Mark submitted
                        </button>
                      )}
                      <button onClick={() => handleDelete(rep.id)}
                        style={{ padding: '4px 10px', border: '1px solid #f5c6c9', borderRadius: '6px', background: '#fff', color: '#931621', fontSize: '11px', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                  {rep.installations && (
                    <div style={{ background: '#f4f7fb', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#1e1c1a', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                      {rep.installations}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}