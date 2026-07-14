'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado',
  'Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho',
  'Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana',
  'Maine','Maryland','Massachusetts','Michigan','Minnesota',
  'Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York',
  'North Carolina','North Dakota','Ohio','Oklahoma','Oregon',
  'Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington',
  'West Virginia','Wisconsin','Wyoming','District of Columbia'
]

export default function StateFormsPage() {
  const [forms, setForms] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [orgName, setOrgName] = useState('')
  const [orgState, setOrgState] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [spOnly, setSpOnly] = useState(false)
  const router = useRouter()

  const fetchForms = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) { router.push('/onboarding'); return }

    const { data: org } = await supabase
      .from('organizations').select('name, facility_state').eq('id', profile.org_id).single()
    if (org) {
      setOrgName(org.name)
      setOrgState(org.facility_state || '')
      setStateFilter(org.facility_state || '')
    }

    const { data } = await supabase
      .from('state_forms')
      .select('*')
      .order('sort_order', { ascending: true })

    setForms(data || [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchForms() }, [fetchForms])

  useEffect(() => {
    let result = [...forms]
    if (stateFilter) result = result.filter(f => f.state_name === stateFilter)
    if (typeFilter) result = result.filter(f => f.classification === typeFilter)
    if (spOnly) result = result.filter(f => f.for_service_providers)
    setFiltered(result)
  }, [forms, stateFilter, typeFilter, spOnly])

  const classifications = [...new Set(forms.map(f => f.classification).filter(Boolean))].sort()

  const CLASSIFICATION_COLORS: Record<string, { color: string; bg: string; border: string }> = {
    'Registration':  { color: '#0d2d5e', bg: '#e8f3fb', border: '#c2ddf0' },
    'Inspection':    { color: '#2d6a4f', bg: '#edfaf3', border: '#b8e8cc' },
    'Rules':         { color: '#4c1d95', bg: '#f5f3ff', border: '#c4b5fd' },
    'Forms':         { color: '#9a3510', bg: '#fff6e8', border: '#f0d4a0' },
    'Notification':  { color: '#1a5fa8', bg: '#e8f3fb', border: '#c2ddf0' },
  }

  const getClassColor = (cls: string) =>
    CLASSIFICATION_COLORS[cls] || { color: '#827d76', bg: '#f4f7fb', border: '#e8e6e2' }

  if (loading) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#a8a39c', fontSize: '13px' }}>Loading state documents...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '500', marginLeft: '10px' }}>ComplianceOS</span>
        </div>
        <a href="/dashboard" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</a>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>State Documents</h1>
          <p style={{ fontSize: '13px', color: '#827d76' }}>
            {orgName} · Registration forms, inspection applications, rules, and regulatory documents
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#1a5fa8', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>State</label>
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)}
              style={{ width: '100%', height: '38px', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '0 10px', fontSize: '13px', color: '#0d2d5e', background: '#fff', cursor: 'pointer', outline: 'none' }}>
              <option value="">All states</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '140px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#1a5fa8', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Document type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              style={{ width: '100%', height: '38px', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '0 10px', fontSize: '13px', color: '#0d2d5e', background: '#fff', cursor: 'pointer', outline: 'none' }}>
              <option value="">All types</option>
              {classifications.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingBottom: '4px' }}>
            <input type="checkbox" checked={spOnly} onChange={e => setSpOnly(e.target.checked)}
              style={{ width: '15px', height: '15px', accentColor: '#0d2d5e' }} />
            <span style={{ fontSize: '13px', color: '#0d2d5e' }}>Service provider forms only</span>
          </label>
          <div style={{ paddingBottom: '4px' }}>
            <span style={{ fontSize: '12px', color: '#a8a39c' }}>{filtered.length} document{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>No documents found</p>
            <p style={{ fontSize: '13px', color: '#827d76' }}>
              {forms.length === 0
                ? 'Run the State Forms sync to load documents.'
                : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(form => {
              const clsColor = getClassColor(form.classification || '')
              return (
                <div key={form.id} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px', alignItems: 'center' }}>
                      {form.state_name && (
                        <span style={{ fontSize: '11px', fontWeight: '500', color: '#0d2d5e', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '2px 9px' }}>
                          {form.state_name}
                        </span>
                      )}
                      {form.classification && (
                        <span style={{ fontSize: '11px', fontWeight: '500', color: clsColor.color, background: clsColor.bg, border: `1px solid ${clsColor.border}`, borderRadius: '20px', padding: '2px 9px' }}>
                          {form.classification}
                        </span>
                      )}
                      {form.form_type && (
                        <span style={{ fontSize: '11px', color: '#827d76', background: '#f4f7fb', border: '1px solid #e8e6e2', borderRadius: '20px', padding: '2px 9px' }}>
                          {form.form_type}
                        </span>
                      )}
                      {form.for_service_providers && (
                        <span style={{ fontSize: '10px', fontWeight: '500', color: '#9a3510', background: '#fff6e8', border: '1px solid #f0d4a0', borderRadius: '20px', padding: '2px 9px' }}>
                          Service provider
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>
                      {form.form_name || 'Untitled form'}
                    </p>
                    {form.form_description && (
                      <p style={{ fontSize: '13px', color: '#4a6d8c', lineHeight: '1.6' }}>
                        {form.form_description}
                      </p>
                    )}
                  </div>
                  {form.form_link && (
                    <a
                      href={form.form_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', height: '36px', padding: '0 16px', background: '#0d2d5e', color: '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: '500', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      Open →
                    </a>
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