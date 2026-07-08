'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

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

export default function HomePage() {
  const [state, setState] = useState('')
  const [modality, setModality] = useState('')
  const [facilityType, setFacilityType] = useState('')
  const [modalities, setModalities] = useState<any[]>([])
  const [facilityTypes, setFacilityTypes] = useState<any[]>([])
  const [results, setResults] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('modalities')
      .select('*')
      .order('sort_order')
      .then(({ data }) => { if (data) setModalities(data) })
    supabase
      .from('facility_types')
      .select('*')
      .order('sort_order')
      .then(({ data }) => { if (data) setFacilityTypes(data) })
  }, [])

  const handleSearch = async () => {
    if (!state && !modality && !facilityType) return
    setLoading(true)
    setSearched(true)
    const supabase = createClient()
    let query = supabase.from('regulations').select('*')
    if (state) query = query.eq('state_name', state)
    if (modality) query = query.eq('modality_name', modality)
    if (facilityType) query = query.eq('facility_type_name', facilityType)
    const { data } = await query.limit(20)
    setResults(data || [])
    setLoading(false)
  }

  const canSearch = state || modality || facilityType

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f4f7fb' }}>

      {/* Navigation */}
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>
            The Radiology Coach
          </span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '500', letterSpacing: '0.05em' }}>
            ComplianceOS
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/login" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>
            Log in
          </a>
          <a href="/signup" style={{ background: '#fff', color: '#0d2d5e', fontSize: '13px', fontWeight: '500', padding: '7px 18px', borderRadius: '8px', textDecoration: 'none' }}>
            Get started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: '#0d2d5e', padding: '64px 24px 80px', textAlign: 'center' }}>
        <p style={{ color: '#8bb4d4', fontSize: '11px', fontWeight: '500', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>
          X-ray compliance · All 50 states
        </p>
        <h1 style={{ color: '#fff', fontSize: '34px', fontWeight: '500', lineHeight: '1.2', margin: '0 auto 14px', maxWidth: '560px' }}>
          Know exactly what your state requires
        </h1>
        <p style={{ color: '#8bb4d4', fontSize: '15px', lineHeight: '1.65', maxWidth: '460px', margin: '0 auto 44px' }}>
          Search compliance requirements for any x-ray modality, in any state, for any facility type — free.
        </p>

        {/* Search card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '500', color: '#a8a39c', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                State
              </label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                style={{ width: '100%', height: '40px', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '0 10px', fontSize: '13px', color: '#0d2d5e', background: '#fff', cursor: 'pointer', outline: 'none' }}
              >
                <option value="">Select state</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '500', color: '#a8a39c', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Modality
              </label>
              <select
                value={modality}
                onChange={e => setModality(e.target.value)}
                style={{ width: '100%', height: '40px', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '0 10px', fontSize: '13px', color: '#0d2d5e', background: '#fff', cursor: 'pointer', outline: 'none' }}
              >
                <option value="">All modalities</option>
                {modalities.map(m => <option key={m.id} value={m.modality_name}>{m.modality_name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: '500', color: '#a8a39c', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Facility type
              </label>
              <select
                value={facilityType}
                onChange={e => setFacilityType(e.target.value)}
                style={{ width: '100%', height: '40px', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '0 10px', fontSize: '13px', color: '#0d2d5e', background: '#fff', cursor: 'pointer', outline: 'none' }}
              >
                <option value="">All facility types</option>
                {facilityTypes.map(f => <option key={f.id} value={f.facility_type_name}>{f.facility_type_name}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={!canSearch || loading}
            style={{
              width: '100%', height: '44px',
              background: canSearch ? '#0d2d5e' : '#e8f3fb',
              color: canSearch ? '#fff' : '#a8a39c',
              border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: '500',
              cursor: canSearch ? 'pointer' : 'default',
              transition: 'background 0.15s'
            }}
          >
            {loading ? 'Searching...' : 'Search compliance requirements'}
          </button>
        </div>
      </div>

      {/* Results / Feature cards */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Empty results */}
        {searched && !loading && results && results.length === 0 && (
          <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '40px 24px', textAlign: 'center' }}>
            <p style={{ color: '#0d2d5e', fontWeight: '500', marginBottom: '8px' }}>No results found</p>
            <p style={{ color: '#827d76', fontSize: '13px', lineHeight: '1.6' }}>
              Try adjusting your filters. Regulation data is being added state by state — check back as coverage expands.
            </p>
          </div>
        )}

        {/* Search results */}
        {results && results.length > 0 && (
          <div>
            <p style={{ fontSize: '12px', color: '#a8a39c', marginBottom: '12px' }}>
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </p>
            {results.map(reg => (
              <div key={reg.id} style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '20px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  {reg.state_name && (
                    <span style={{ background: '#e8f3fb', color: '#0d2d5e', fontSize: '11px', fontWeight: '500', padding: '2px 10px', borderRadius: '20px', border: '1px solid #c2ddf0' }}>
                      {reg.state_name}
                    </span>
                  )}
                  {reg.modality_name && (
                    <span style={{ background: '#f4f7fb', color: '#1a5fa8', fontSize: '11px', fontWeight: '500', padding: '2px 10px', borderRadius: '20px', border: '1px solid #c2ddf0' }}>
                      {reg.modality_name}
                    </span>
                  )}
                  {reg.facility_type_name && (
                    <span style={{ background: '#f4f7fb', color: '#827d76', fontSize: '11px', padding: '2px 10px', borderRadius: '20px', border: '1px solid #e8e6e2' }}>
                      {reg.facility_type_name}
                    </span>
                  )}
                </div>
                {reg.plain_language_summary ? (
                  <p style={{ fontSize: '13px', color: '#1e1c1a', lineHeight: '1.65', marginBottom: reg.legal_citation ? '10px' : '0' }}>
                    {reg.plain_language_summary}
                  </p>
                ) : (
                  <p style={{ fontSize: '13px', color: '#827d76', lineHeight: '1.65', fontStyle: 'italic' }}>
                    Detailed compliance data available — sign up to view full requirements.
                  </p>
                )}
                {reg.legal_citation && (
                  <p style={{ fontSize: '11px', color: '#a8a39c', marginTop: '8px' }}>{reg.legal_citation}</p>
                )}
              </div>
            ))}
            <div style={{ background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '16px', textAlign: 'center', marginTop: '16px' }}>
              <p style={{ fontSize: '13px', color: '#0d2d5e', marginBottom: '10px' }}>
                Get the full compliance picture — calendar, documents, AI assistant, and RSP builder.
              </p>
              <a href="/signup" style={{ background: '#0d2d5e', color: '#fff', fontSize: '13px', fontWeight: '500', padding: '8px 20px', borderRadius: '8px', textDecoration: 'none', display: 'inline-block' }}>
                Start free — Medical Facilities
              </a>
            </div>
          </div>
        )}

        {/* Feature cards — shown before first search */}
        {!searched && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {[
              { label: 'RSP builder', desc: 'Generate your full Radiation Protection Program in minutes', color: '#e8f3fb', border: '#c2ddf0', text: '#0d2d5e' },
              { label: 'Compliance calendar', desc: 'Never miss a renewal, inspection, or QA deadline again', color: '#edfaf3', border: '#b8e8cc', text: '#1a4731' },
              { label: 'AI assistant', desc: 'Get cited, state-specific answers to compliance questions', color: '#f5f3ff', border: '#c4b5fd', text: '#3b0764' },
            ].map(card => (
              <div key={card.label} style={{ background: card.color, border: `1px solid ${card.border}`, borderRadius: '12px', padding: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: card.text, marginBottom: '6px' }}>{card.label}</p>
                <p style={{ fontSize: '12px', color: '#827d76', lineHeight: '1.55' }}>{card.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e8e6e2', padding: '24px', textAlign: 'center', marginTop: '40px' }}>
        <p style={{ fontSize: '12px', color: '#a8a39c' }}>
          The Radiology Coach · ComplianceOS · theradiologycoach.com
        </p>
      </div>

    </div>
  )
}