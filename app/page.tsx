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

const MODALITY_SEARCH_TERMS: Record<string, string[]> = {
  'General Radiography':     ['General Radiograph', 'GenRad'],
  'C-arm Fluoroscopy':       ['C-arm'],
  'Mobile X-ray':            ['Mobile'],
  'Portable/Handheld X-ray': ['Portable', 'Handheld'],
  'CT':                      ['Tomography'],
  'CBCT':                    ['Cone Beam', 'CBCT'],
  'Fluoroscopy':             ['Fluoroscopy'],
}

const FACILITY_SEARCH: Record<string, string> = {
  'Physician Office': 'Medical Clinic',
}

export default function HomePage() {
  const [state, setState] = useState('')
  const [modality, setModality] = useState('')
  const [facilityType, setFacilityType] = useState('')
  const [modalities, setModalities] = useState<any[]>([])
  const [facilityTypes, setFacilityTypes] = useState<any[]>([])
  const [results, setResults] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [stateContact, setStateContact] = useState<any>(null)
  const [stateForms, setStateForms] = useState<any[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('modalities').select('*').order('sort_order')
      .then(({ data }) => { if (data) setModalities(data) })
    supabase.from('facility_types').select('*').order('sort_order')
      .then(({ data }) => { if (data) setFacilityTypes(data) })
  }, [])

  const handleSearch = async () => {
    if (!state && !modality && !facilityType) return
    setLoading(true)
    setSearched(true)
    const supabase = createClient()
    let query = supabase.from('regulations').select('*')

    if (state) query = query.eq('state_name', state)

    if (modality && MODALITY_SEARCH_TERMS[modality]) {
      const terms = MODALITY_SEARCH_TERMS[modality]
      if (terms.length === 1) {
        query = query.ilike('modality_name', `%${terms[0]}%`)
      } else {
        query = query.or(
          terms.map(t => `modality_name.ilike.%${t}%`).join(',')
        )
      }
    }

    if (facilityType) {
      const term = FACILITY_SEARCH[facilityType] || facilityType
      query = query.ilike('facility_type_name', `%${term}%`)
    }

    const { data } = await query.limit(10)
    setResults(data || [])

    if (state) {
      const { data: contact } = await supabase
        .from('states')
        .select('agency_name, agency_director, agency_phone, agency_email, agency_notes')
        .eq('state_name', state)
        .single()
      setStateContact(contact || null)
    } else {
      setStateContact(null)
    }
    if (state) {
  const { data: forms } = await supabase
    .from('state_forms')
    .select('form_name, form_description, classification, for_service_providers')
    .eq('state_name', state)
    .order('sort_order')
    .limit(6)
  setStateForms(forms || [])
} else {
  setStateForms([])
}
    setLoading(false)
  }

  const canSearch = state || modality || facilityType

  const lbl: React.CSSProperties = {
    fontSize: '10px', fontWeight: '500', color: '#1a5fa8',
    textTransform: 'uppercase', letterSpacing: '0.09em',
    marginBottom: '4px', display: 'block',
  }
  const val: React.CSSProperties = {
    fontSize: '13px', color: '#1e1c1a', lineHeight: '1.65', margin: 0,
  }
  const valReq: React.CSSProperties = {
    ...val, fontWeight: '500', color: '#0d2d5e',
  }

  function Item({ label, value, required }: { label: string; value: any; required?: boolean }) {
    if (value === null || value === undefined || value === false || value === '' || value === 'n/a') return null
    const display = value === true ? 'Required' : String(value)
    return (
      <div style={{ marginBottom: '14px' }}>
        <span style={lbl}>{label}</span>
        <p style={required || value === true ? valReq : val}>{display}</p>
      </div>
    )
  }

  function Panel({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
    return (
      <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '10px', padding: '18px 20px', flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #eef3fb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#1a5fa8' }}>◈</span>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e' }}>{title}</span>
          </div>
          <span style={{ fontSize: '11px', color: '#a8a39c' }}>Regulations table</span>
        </div>
        {children}
      </div>
    )
  }

  function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <span style={{ fontSize: '11px', fontWeight: '500', color: '#0d2d5e', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{title}</span>
          <div style={{ flex: 1, height: '1px', background: '#c2ddf0' }} />
        </div>
        <div style={{ display: 'flex', gap: '14px' }}>{children}</div>
      </div>
    )
  }

  function RegulationResult({ reg }: { reg: any }) {
    const hasLeftReg = reg.facility_registration_req || reg.registration_notes || reg.annual_renewal || reg.state_own_reg_form || reg.form_2579_rules || reg.renewal_timeline
    const hasRightReg = reg.shielding_plan_req || reg.shielding_approval_req || reg.shielding_party || reg.post_install_inspection || reg.shielding_expectations || reg.con_required
    const hasLeftEq = reg.post_install_requirements || reg.qa_testing || reg.service_notes || reg.retain_service_docs || reg.equipment_training_records
    const hasRightEq = reg.operator_credentials || reg.dosimetry_monitoring || reg.dosimetry_notes || reg.lead_aprons_req || reg.lead_apron_inspection || reg.lead_apron_notes
    const hasLeftSafety = reg.keep_exposure_records || reg.pregnancy_protocols || reg.service_provider_docs
    const hasRightSafety = reg.notify_state_timeframe || reg.notify_remove_unit || reg.termination_notes

    return (
      <div style={{ marginBottom: '32px' }}>
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '10px', padding: '18px 20px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '2px 10px' }}>
              Plain language summary
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#a8a39c', marginBottom: '4px' }}>
            {[reg.state_name, reg.facility_type_name, reg.modality_name].filter(Boolean).join(' · ')}
          </p>
          {reg.post_install_requirements && (
            <p style={{ fontSize: '11px', color: '#2d6a4f', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '20px', display: 'inline-block', padding: '2px 10px', marginBottom: '10px' }}>
              Applies to: {reg.post_install_requirements}
            </p>
          )}
          {reg.plain_language_summary ? (
            <p style={{ fontSize: '14px', color: '#1e1c1a', lineHeight: '1.75', margin: 0 }}>{reg.plain_language_summary}</p>
          ) : (
            <p style={{ fontSize: '13px', color: '#827d76', lineHeight: '1.65', margin: 0, fontStyle: 'italic' }}>
              Compliance summary available once AI field is populated in Airtable for this state and modality.
            </p>
          )}
        </div>

        {(hasLeftReg || hasRightReg) && (
          <Section title="Registration &amp; licensing">
            {hasLeftReg && (
              <Panel title="Machine registration" icon="certificate">
                <Item label="Facility registration" value={reg.facility_registration_req} required />
                <Item label="Registration notes" value={reg.registration_notes} />
                <Item label="Annual renewal" value={reg.annual_renewal} required />
                <Item label="Renewal timeline" value={reg.renewal_timeline} />
                <Item label="State registration form" value={reg.state_own_reg_form ? 'State provides its own registration form' : null} />
                <Item label="Form 2579 rules" value={reg.form_2579_rules} />
              </Panel>
            )}
            {hasRightReg && (
              <Panel title="Shielding &amp; installation" icon="shield">
                <Item label="Shielding plan required" value={reg.shielding_plan_req} required />
                <Item label="State approval required" value={reg.shielding_approval_req} required />
                <Item label="Shielding party" value={reg.shielding_party} />
                <Item label="Post-installation inspection" value={reg.post_install_inspection} required />
                <Item label="Shielding requirements" value={reg.shielding_expectations} />
                <Item label="Certificate of need" value={reg.con_required} />
              </Panel>
            )}
          </Section>
        )}

        {(hasLeftEq || hasRightEq) && (
          <Section title="Equipment &amp; operations">
            {hasLeftEq && (
              <Panel title="X-ray machine care" icon="tool">
                <Item label="Quality assurance testing" value={reg.qa_testing} required />
                <Item label="Service notes" value={reg.service_notes} />
                <Item label="Retain service documents" value={reg.retain_service_docs ? 'Yes — all maintenance records, repair invoices, and service reports retained on-site.' : null} required />
                <Item label="Equipment training records" value={reg.equipment_training_records} required />
              </Panel>
            )}
            {hasRightEq && (
              <Panel title="X-ray operator protocols" icon="user">
                <Item label="Operator credentials" value={reg.operator_credentials} />
                <Item label="Dosimetry monitoring" value={reg.dosimetry_monitoring} required />
                <Item label="Dosimetry notes" value={reg.dosimetry_notes} />
                <Item label="Lead aprons required" value={reg.lead_aprons_req && reg.lead_aprons_req !== 'n/a' ? reg.lead_aprons_req : null} required />
                <Item label="Lead apron inspection" value={reg.lead_apron_inspection} />
                <Item label="Lead apron notes" value={reg.lead_apron_notes} />
              </Panel>
            )}
          </Section>
        )}

        {(hasLeftSafety || hasRightSafety) && (
          <Section title="Safety &amp; compliance documentation">
            {hasLeftSafety && (
              <Panel title="Personnel &amp; safety" icon="shield-lock">
                <Item label="Keep exposure records" value={reg.keep_exposure_records} required />
                <Item label="Pregnancy protocols" value={reg.pregnancy_protocols} />
                <Item label="Service provider documentation" value={reg.service_provider_docs} required />
              </Panel>
            )}
            {hasRightSafety && (
              <Panel title="Notifications &amp; reporting" icon="bell">
                <Item label="Timeframe to notify state" value={reg.notify_state_timeframe} />
                <Item label="Procedure for removing x-ray unit" value={reg.notify_remove_unit} />
                <Item label="Theft/vandalism reporting" value={reg.termination_notes} />
              </Panel>
            )}
          </Section>
        )}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>

      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '18px', color: '#8bb4d4' }}>◈</span>
            </div>
            <div>
              <p style={{ color: '#fff', fontSize: '14px', fontWeight: '500', margin: 0 }}>X-ray Compliance Hub</p>
              <p style={{ color: '#8bb4d4', fontSize: '11px', margin: 0 }}>Powered by The Radiology Coach</p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="/about" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>About</a>
          <a href="/pricing" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>Pricing</a>
          <a href="/login" style={{ color: '#fff', fontSize: '13px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', padding: '6px 16px', borderRadius: '8px' }}>Sign in</a>
          <a href="/get-started" style={{ background: '#1a72e8', color: '#fff', fontSize: '13px', fontWeight: '500', padding: '7px 18px', borderRadius: '8px', textDecoration: 'none' }}>Get started</a>
        </div>
      </nav>

      <div style={{ background: '#f0f4f8', padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '4px 12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#1a5fa8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Free compliance search — all 50 states</span>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '500', color: '#0d2d5e', lineHeight: '1.2', marginBottom: '12px', maxWidth: '640px' }}>
            Find your X-ray compliance requirements — instantly
          </h1>
          <p style={{ fontSize: '15px', color: '#4a6d8c', lineHeight: '1.65', maxWidth: '580px', marginBottom: '32px' }}>
            Select your state, facility type, and imaging modality for a complete, field-level compliance overview drawn from official state radiation control regulations.
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#1a5fa8', marginBottom: '6px' }}>State</label>
              <select value={state} onChange={e => setState(e.target.value)}
                style={{ width: '100%', height: '44px', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '0 12px', fontSize: '13px', color: '#0d2d5e', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                <option value="">Select state...</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#1a5fa8', marginBottom: '6px' }}>Facility type</label>
              <select value={facilityType} onChange={e => setFacilityType(e.target.value)}
                style={{ width: '100%', height: '44px', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '0 12px', fontSize: '13px', color: '#0d2d5e', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                <option value="">All facility types</option>
                {facilityTypes.map(f => <option key={f.id} value={f.facility_type_name}>{f.facility_type_name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#1a5fa8', marginBottom: '6px' }}>Imaging modality</label>
              <select value={modality} onChange={e => setModality(e.target.value)}
                style={{ width: '100%', height: '44px', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '0 12px', fontSize: '13px', color: '#0d2d5e', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                <option value="">All modalities</option>
                {modalities.map(m => <option key={m.id} value={m.modality_name}>{m.modality_name}</option>)}
              </select>
            </div>
            <button onClick={handleSearch} disabled={!canSearch || loading}
              style={{ height: '44px', padding: '0 28px', background: canSearch ? '#0d2d5e' : '#c2ddf0', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: canSearch ? 'pointer' : 'default', whiteSpace: 'nowrap' }}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '16px 24px 60px' }}>

        {searched && !loading && results && results.length === 0 && (
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '10px', padding: '48px 24px', textAlign: 'center', marginBottom: '32px' }}>
            <p style={{ color: '#0d2d5e', fontWeight: '500', marginBottom: '8px', fontSize: '15px' }}>No results found</p>
            <p style={{ color: '#827d76', fontSize: '13px', lineHeight: '1.6', maxWidth: '360px', margin: '0 auto' }}>
              Try adjusting your filters or searching by state only. Regulation data is being added state by state.
            </p>
          </div>
        )}

        {results && results.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#4a6d8c', fontWeight: '500' }}>
                {results.length} compliance record{results.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {results.map(reg => <RegulationResult key={reg.id} reg={reg} />)}

            {stateContact && (stateContact.agency_name || stateContact.agency_phone) && (
              <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '10px', padding: '20px 24px', marginBottom: '28px' }}>
                <p style={{ fontSize: '10px', fontWeight: '500', color: '#4a6d8c', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '10px' }}>
                  State radiation control agency
                </p>
                {stateContact.agency_name && (
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '3px' }}>{stateContact.agency_name}</p>
                )}
                {stateContact.agency_director && (
                  <p style={{ fontSize: '12px', color: '#827d76', marginBottom: '10px' }}>{stateContact.agency_director}</p>
                )}
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  {stateContact.agency_phone && (
                    <a href={`tel:${stateContact.agency_phone}`} style={{ fontSize: '13px', color: '#1a5fa8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      ☎ {stateContact.agency_phone}
                    </a>
                  )}
                  {stateContact.agency_email && (
                    <a href={`mailto:${stateContact.agency_email}`} style={{ fontSize: '13px', color: '#1a5fa8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      ✉ {stateContact.agency_email}
                    </a>
                  )}
                </div>
                {stateContact.agency_notes && (
                  <p style={{ fontSize: '12px', color: '#827d76', marginTop: '10px', lineHeight: '1.55', paddingTop: '10px', borderTop: '1px solid #eef3fb' }}>{stateContact.agency_notes}</p>
                )}
              </div>
            )}

            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: '500', color: '#0d2d5e', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Members-only access</span>
                <div style={{ flex: 1, height: '1px', background: '#c2ddf0' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                {[
                  { title: 'State forms & applications', desc: 'Downloadable registration applications, renewal forms, CON submission packets, and shielding plan checklists pre-identified for your state and modality.' },
                  { title: 'Regulatory update alerts', desc: 'Get notified when your state updates radiation control regulations, matched to your facility type and modalities.' },
                  { title: 'AI compliance assistant', desc: 'Ask unlimited questions about your specific compliance situation and get instant, citation-backed answers.' },
                ].map(item => (
                  <div key={item.title} style={{ background: '#fff', border: '1px dashed #c2ddf0', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '500', color: '#827d76', background: '#f4f7fb', border: '1px solid #e8e6e2', borderRadius: '20px', padding: '2px 8px' }}>Members only</span>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>{item.title}</p>
                    <p style={{ fontSize: '12px', color: '#827d76', lineHeight: '1.55', marginBottom: '12px' }}>{item.desc}</p>
                    <a href="/get-started" style={{ fontSize: '12px', fontWeight: '500', color: '#1a5fa8', textDecoration: 'none' }}>
                      Unlock with membership →
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '16px', padding: '12px 16px', background: '#f4f7fb', borderRadius: '8px', border: '1px solid #dce8f5' }}>
              <p style={{ fontSize: '12px', color: '#4a6d8c', lineHeight: '1.6', margin: 0 }}>
                Results sourced from official state radiation control regulations. Verify current requirements with your state agency before acting on compliance decisions. Data current as of {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
              </p>
            </div>
          </>
        )}

        {!searched && (
  <div>

    {/* Authority section */}
    <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '28px 32px', marginBottom: '20px', display: 'flex', gap: '28px', alignItems: 'center' }}>
      {process.env.NEXT_PUBLIC_INSTRUCTOR_PHOTO && (
        <img
          src={process.env.NEXT_PUBLIC_INSTRUCTOR_PHOTO}
          alt="Gregory Turner"
          style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', border: '3px solid #c2ddf0', flexShrink: 0 }}
        />
      )}
      <div>
        <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px', lineHeight: '1.5' }}>
          "X-ray compliance doesn't have to be confusing. I built ComplianceOS so that every facility — regardless of size — can know exactly what their state requires and prove it."
        </p>
        <p style={{ fontSize: '12px', color: '#4a6d8c', fontWeight: '500' }}>Gregory Turner · The Radiology Coach · X-ray Compliance Specialist</p>
      </div>
    </div>

    {/* What members get */}
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', fontWeight: '500', color: '#0d2d5e', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Everything in a Professional membership</span>
        <div style={{ flex: 1, height: '1px', background: '#c2ddf0' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {[
          { title: 'Compliance calendar', desc: 'Every registration renewal, QA deadline, inspection date, and dosimetry exchange auto-tracked for your state and modality.', highlight: true },
          { title: 'RSP / RPP builder', desc: 'Generate your complete Radiation Protection Program as a professional PDF in minutes — not the weeks it takes starting from scratch.', highlight: true },
          { title: 'AI compliance assistant', desc: 'Ask any compliance question and get a cited, state-specific answer instantly. No more guessing or waiting for callbacks.', highlight: false },
          { title: 'Document repository', desc: 'Store all your compliance documents — registrations, inspection reports, dosimetry records, equipment logs — with expiration tracking.', highlight: false },
          { title: 'Equipment inventory', desc: 'Track every x-ray unit with its registration numbers, service history, and QA records. Copy registration numbers in one tap during inspections.', highlight: false },
          { title: 'State documents', desc: 'Every form, application, and regulatory document for your state — pre-identified and one click away. No more searching state websites.', highlight: false },
          { title: 'Keys to Success checklist', desc: 'A guided 21-item compliance checklist with expert video guidance from The Radiology Coach. Watch your compliance score climb toward Inspection Ready.', highlight: false },
          { title: 'Inspection report', desc: 'A single printable compliance report showing everything — equipment, documents, calendar, checklist — ready for any state inspector in seconds.', highlight: false },
        ].map(item => (
          <div key={item.title} style={{ background: item.highlight ? '#0d2d5e' : '#fff', border: `1px solid ${item.highlight ? '#0d2d5e' : '#dce8f5'}`, borderRadius: '10px', padding: '16px 18px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '16px', color: item.highlight ? '#8bb4d4' : '#c2ddf0', flexShrink: 0, marginTop: '2px' }}>✓</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: item.highlight ? '#fff' : '#0d2d5e', marginBottom: '4px' }}>{item.title}</p>
              <p style={{ fontSize: '12px', color: item.highlight ? '#8bb4d4' : '#827d76', lineHeight: '1.55' }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Pricing CTA */}
    <div style={{ background: '#0d2d5e', borderRadius: '12px', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', marginBottom: '20px' }}>
      <div>
        <p style={{ color: '#fff', fontSize: '17px', fontWeight: '500', marginBottom: '6px' }}>Cancel anytime</p>
        <p style={{ color: '#8bb4d4', fontSize: '13px', lineHeight: '1.6', maxWidth: '480px' }}>
          Search all 50 states free, forever. Upgrade to a Professional membership for your facility's full compliance toolkit — calendar, documents, AI, forms, RPP builder, and more.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
        <a href="/get-started" style={{ background: '#fff', color: '#0d2d5e', fontSize: '13px', fontWeight: '500', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Create free account
        </a>
        <a href="/login" style={{ background: 'transparent', color: '#8bb4d4', fontSize: '13px', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>
          Sign in
        </a>
      </div>
    </div>

    {/* Trust signals */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
      {[
        { stat: '862+', label: 'Regulation records', sub: 'Across all 50 states' },
        { stat: '48', label: 'State agencies', sub: 'With direct contact info' },
        { stat: '100s', label: 'State forms', sub: 'Pre-identified for your state' },
      ].map(item => (
        <div key={item.stat} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '26px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>{item.stat}</p>
          <p style={{ fontSize: '13px', fontWeight: '500', color: '#1a5fa8', marginBottom: '2px' }}>{item.label}</p>
          <p style={{ fontSize: '11px', color: '#a8a39c' }}>{item.sub}</p>
        </div>
      ))}
    </div>

  </div>
)}

      </div>

      {searched && results && results.length > 0 && (
        <div style={{ background: '#0d2d5e', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ color: '#fff', fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>Ready to take action on what you just found?</p>
            <p style={{ color: '#8bb4d4', fontSize: '13px', margin: 0 }}>Members get forms, update alerts, AI assistance, compliance calendar, document repository, and more.</p>
          </div>
          <a href="/get-started" style={{ background: '#fff', color: '#0d2d5e', fontSize: '13px', fontWeight: '500', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Become a member
          </a>
        </div>
      )}

    </div>
  )
}