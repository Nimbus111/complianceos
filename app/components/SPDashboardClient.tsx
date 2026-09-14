'use client'
import { useState } from 'react'

const TEACHABLE_URL = 'https://g-turner-consultants.teachable.com/p/x-ray-positioning-and-techniques-for-the-basic-operator1?coupon_code=COMPHUB&product_id=6645011'

type Tab = 'forms' | 'sp-rules' | 'states' | 'contacts' | 'fees'
type MainTab = 'resources' | 'tools' | 'installations' | 'revenue'

interface Props {
  forms: any[]
  spRules: any[]
  states: any[]
  contacts: any[]
  fees: any[]
  revenue: any
  org: any
}

function Badge({ value, trueLabel = 'Yes', falseLabel = 'No' }: { value: boolean, trueLabel?: string, falseLabel?: string }) {
  return (
    <span style={{ fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px', background: value ? '#edfaf3' : '#f4f7fb', color: value ? '#2d6a4f' : '#a8a39c', border: `1px solid ${value ? '#b8e8cc' : '#e8e6e2'}` }}>
      {value ? trueLabel : falseLabel}
    </span>
  )
}

export default function SPDashboardClient({ forms, spRules, states, contacts, fees, revenue, org }: Props) {
  const [mainTab, setMainTab] = useState<MainTab>('resources')
  const [resourceTab, setResourceTab] = useState<Tab>('sp-rules')
  const [search, setSearch] = useState('')
  const [expandedRule, setExpandedRule] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [machines, setMachines] = useState([{ manufacturer: '', model: '', serial_number: '', type: 'General Radiography', purchase_date: '', warranty_expiry_date: '', room_location: '' }])
  const [calEvents, setCalEvents] = useState([{ type: 'calibration', date: '', title: '' }])
  const [siteEmails, setSiteEmails] = useState([''])
  const [instSending, setInstSending] = useState(false)
  const [instSent, setInstSent] = useState(false)
  const [instPackets, setInstPackets] = useState<any[]>([])
  const [instLoaded, setInstLoaded] = useState(false)

  const loadPackets = async () => {
    if (instLoaded) return
    const res = await fetch('/api/sp/installation')
    const data = await res.json()
    setInstPackets(data)
    setInstLoaded(true)
  }

  const submitInstallation = async () => {
    const validEmails = siteEmails.filter(e => e.trim())
    const validMachines = machines.filter(m => m.manufacturer && m.model)
    if (validEmails.length === 0 || validMachines.length === 0) {
      alert('Please add at least one site email and one machine.')
      return
    }}
    setInstSending(true)
    setInstSending(true)
    const validCalEvents = calEvents.filter(e => e.date)
    const results = await Promise.all(validEmails.map(email =>
      fetch('/api/sp/installation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic_email: email.trim(),
          equipment_list: validMachines,
          calendar_events: validCalEvents
        })
      }).then(r => r.json())
    ))
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      alert(`Some submissions failed: ${errors.map((e: any) => e.error).join(', ')}`)
    } else {
      setInstSent(true)
      const newPackets = results.map(r => r.packet).filter(Boolean)
      setInstPackets(prev => [...newPackets, ...prev])
      setMachines([{ manufacturer: '', model: '', serial_number: '', type: 'General Radiography', purchase_date: '', warranty_expiry_date: '', room_location: '' }])
      setCalEvents([{ type: 'calibration', date: '', title: '' }])
      setSiteEmails([''])
      setTimeout(() => setInstSent(false), 4000)
    }
    setInstSending(false)
  }
  const [stateList, setStateList] = useState<string[]>([])
  const [stateForms, setStateForms] = useState<any[]>([])
  const [formsLoading, setFormsLoading] = useState(false)

  const loadStates = async () => {
    if (stateList.length > 0) return
    const res = await fetch('/api/sp/forms')
    const data = await res.json()
    setStateList(data.states || [])
  }

  const loadForms = async (state: string) => {
    setFormsLoading(true)
    const res = await fetch(`/api/sp/forms?state=${encodeURIComponent(state)}`)
    const data = await res.json()
    setStateForms(data)
    setFormsLoading(false)
  }

  const filter = (items: any[], key = 'state_name') =>
    items.filter(i => !search || (i[key] || '').toLowerCase().includes(search.toLowerCase()))

  const copyTeachable = () => {
    navigator.clipboard.writeText(TEACHABLE_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', maxWidth: '1100px', margin: '0 auto', padding: '28px 20px' }}>

      {/* Main tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', borderBottom: '1px solid #dce8f5', paddingBottom: '0' }}>
        {([['resources', 'State Resources'], ['tools', 'Customer Tools'],
        ['installations', 'Installations'], ['revenue', 'Revenue']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setMainTab(t as MainTab)}
            style={{ fontSize: '13px', fontWeight: '500', padding: '10px 18px', background: 'none', border: 'none', borderBottom: `2px solid ${mainTab === t ? '#0d2d5e' : 'transparent'}`, color: mainTab === t ? '#0d2d5e' : '#4a6d8c', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', marginBottom: '-1px' }}>
            {label}
          </button>
        ))}
      </div>

      {/* STATE RESOURCES */}
      {mainTab === 'resources' && (
        <div>
          {/* Search + sub-tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {([['sp-rules', 'SP Rules'], ['forms', 'State Forms'], ['states', 'States'], ['contacts', 'State Contacts'], ['fees', 'Fees']] as [Tab, string][]).map(([t, label]) => (
                <button key={t} onClick={() => setResourceTab(t)}
                  style={{ fontSize: '12px', padding: '5px 14px', borderRadius: '20px', border: `1px solid ${resourceTab === t ? '#0d2d5e' : '#c2ddf0'}`, background: resourceTab === t ? '#0d2d5e' : '#fff', color: resourceTab === t ? '#fff' : '#4a6d8c', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {label}
                </button>
              ))}
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by state..."
              style={{ fontSize: '12px', padding: '6px 12px', border: '1px solid #c2ddf0', borderRadius: '7px', width: '180px', fontFamily: 'Inter, system-ui, sans-serif' }} />
          </div>

          {/* SP RULES */}
          {resourceTab === 'sp-rules' && (
            <div>
              {!search ? (
                <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
                  <p style={{ fontSize: '20px', marginBottom: '8px' }}>📋</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#0d2d5e', marginBottom: '6px' }}>X-ray Service Provider State Rules</p>
                  <p style={{ fontSize: '13px', color: '#4a6d8c', marginBottom: '6px', lineHeight: '1.6' }}>Registration requirements, application fees, renewal schedules, floor plan privileges, dosimetry requirements, out-of-state reciprocity rules, and leasing protocols — one state at a time.</p>
                  <p style={{ fontSize: '12px', color: '#a8a39c', marginBottom: '20px' }}>Select a state below or type in the filter box above</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', maxWidth: '700px', margin: '0 auto' }}>
                    {[...new Set(spRules.map((r: any) => r.state_name).filter(Boolean))].sort().map((state: any) => (
                      <button key={state} onClick={() => { setSearch(state); loadForms(state) }}
                        style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', border: '1px solid #c2ddf0', background: '#f0f4f8', color: '#0d2d5e', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {state}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ padding: '12px 16px', background: '#f0f4f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px 12px 0 0', border: '1px solid #dce8f5', borderBottom: 'none' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e' }}>SP Rules — {search}</span>
                    <button onClick={() => { setSearch(''); setExpandedRule(null) }} style={{ fontSize: '11px', color: '#4a6d8c', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>← All states</button>
                  </div>
                  <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#0d2d5e' }}>
                      {['State', 'Reg Required', 'Certificate', 'App Fee', 'Renewal', 'Floor Plans', 'Dosimetry', 'Reporting', 'Details'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'rgba(255,255,255,.82)', fontWeight: '500', fontSize: '11px', letterSpacing: '.04em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filter(spRules).map((r, i) => (
                      <>
                        <tr key={r.id} style={{ borderBottom: '1px solid #f4f7fb', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                          <td style={{ padding: '10px 12px', fontWeight: '500', color: '#0d2d5e' }}>{r.state_name}</td>
                          <td style={{ padding: '10px 12px' }}><Badge value={r.vendor_registration_req} /></td>
                          <td style={{ padding: '10px 12px' }}><Badge value={r.agency_issues_cert} /></td>
                          <td style={{ padding: '10px 12px', color: r.application_fee ? '#0d2d5e' : '#a8a39c' }}>{r.application_fee || 'TBD'}</td>
                          <td style={{ padding: '10px 12px', color: '#4a6d8c' }}>{r.renewal_frequency || '—'}</td>
                          <td style={{ padding: '10px 12px' }}><Badge value={r.sp_may_draw_floor_plans} trueLabel="Yes" falseLabel="No" /></td>
                          <td style={{ padding: '10px 12px' }}><Badge value={r.dosimetry_for_engineers} trueLabel="Required" falseLabel="Not req." /></td>
                          <td style={{ padding: '10px 12px', color: '#4a6d8c' }}>{r.reporting || '—'}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <button onClick={() => setExpandedRule(expandedRule === r.id ? null : r.id)}
                              style={{ fontSize: '11px', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '2px 10px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
                              {expandedRule === r.id ? 'Close' : 'View all'}
                            </button>
                          </td>
                        </tr>
                        {expandedRule === r.id && (
                          <tr key={`${r.id}-expand`} style={{ background: '#f8fbfe' }}>
                            <td colSpan={9} style={{ padding: '16px 20px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                {[
                                  { label: 'Registration Notes', value: r.registration_notes },
                                  { label: 'Compliance Notes', value: r.compliance_notes },
                                  { label: 'Credentials Required', value: r.credentials_required ? 'Yes — credentials must be submitted' : 'Not required' },
                                  { label: 'Baseline SP Credentials', value: r.baseline_creds },
                                  { label: 'Out-of-State Must Register', value: r.out_of_state_must_register ? 'Yes' : 'No' },
                                  { label: 'Out-of-State Reciprocity', value: r.out_of_state_reciprocity ? 'Yes — reciprocity applies' : 'No' },
                                  { label: 'Reciprocity Rules', value: r.out_of_state_reciprocity_rules },
                                  { label: 'Leasing Equipment Rules', value: r.leasing_equipment_rules },
                                ].filter(item => item.value).map(item => (
                                  <div key={item.label}>
                                    <p style={{ fontSize: '10px', fontWeight: '600', color: '#4a6d8c', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '4px' }}>{item.label}</p>
                                    <p style={{ fontSize: '12px', color: '#0d2d5e', lineHeight: '1.6', margin: 0 }}>{item.value}</p>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
           </div>
              )}
            </div>
          )}


          {resourceTab === 'forms' && (
            <div>
              {!search ? (
            <div onMouseEnter={loadStates}>
                <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>Select a state to view its forms</p>
                  <p style={{ fontSize: '12px', color: '#4a6d8c', marginBottom: '20px' }}>Type a state name in the filter box above</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
                    {stateList.length === 0
                      ? <span style={{ fontSize: '12px', color: '#a8a39c' }}>Loading states...</span>
                      : stateList.map((state: any) => (
                      <button key={state} onClick={() => { setSearch(state); loadForms(state) }}
                        style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', border: '1px solid #c2ddf0', background: '#f0f4f8', color: '#0d2d5e', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {state}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              ) : (
                <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', background: '#f0f4f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e' }}>Forms for {search}</span>
                    <button onClick={() => setSearch('')} style={{ fontSize: '11px', color: '#4a6d8c', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>← All states</button>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#0d2d5e' }}>
                        {['Form Name', 'Classification', 'Form Type', 'Link'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'rgba(255,255,255,.82)', fontWeight: '500', fontSize: '11px', letterSpacing: '.04em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {formsLoading ? (
                        <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#a8a39c', fontSize: '13px' }}>Loading forms...</td></tr>
                      ) : stateForms.map((f: any, i: number) => (
                        <tr key={f.id} style={{ borderBottom: '1px solid #f4f7fb', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                          <td style={{ padding: '10px 14px', color: '#1e1c1a' }}>{f.form_name}</td>
                          <td style={{ padding: '10px 14px', color: '#4a6d8c' }}>{f.classification || '—'}</td>
                          <td style={{ padding: '10px 14px', color: '#4a6d8c' }}>{f.form_type || '—'}</td>
                          <td style={{ padding: '10px 14px' }}>
                            {f.form_link
                              ? <a href={f.form_link} target="_blank" rel="noopener" style={{ fontSize: '11px', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '2px 10px', textDecoration: 'none' }}>Open →</a>
                              : <span style={{ fontSize: '11px', color: '#a8a39c' }}>No link</span>}
                          </td>
                        </tr>
                      ))}
                      {stateForms.length === 0 && !formsLoading && (
                        <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#a8a39c', fontSize: '13px' }}>No forms found for {search}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* STATES */}
          {resourceTab === 'states' && (
            <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#0d2d5e' }}>
                    {['State', 'Program Name', 'Address', 'Phone', 'Website'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'rgba(255,255,255,.82)', fontWeight: '500', fontSize: '11px', letterSpacing: '.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filter(states).map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f4f7fb', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '500', color: '#0d2d5e' }}>{s.state_name}</td>
                      <td style={{ padding: '10px 14px', color: '#1e1c1a' }}>{s.program_name || '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#4a6d8c', fontSize: '11px' }}>{s.address || '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#4a6d8c' }}>{s.phone || '—'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        {s.website
                          ? <a href={s.website} target="_blank" rel="noopener" style={{ fontSize: '11px', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '2px 10px', textDecoration: 'none' }}>Visit →</a>
                          : <span style={{ fontSize: '11px', color: '#a8a39c' }}>No website</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* STATE CONTACTS */}
          {resourceTab === 'contacts' && (
            <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#0d2d5e' }}>
                    {['State', 'Director', 'Registration Email', 'Phone', 'SP Contact Email'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'rgba(255,255,255,.82)', fontWeight: '500', fontSize: '11px', letterSpacing: '.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filter(contacts).map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f4f7fb', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '500', color: '#0d2d5e' }}>
                        {c.state_name && !c.state_name.startsWith('rec') ? c.state_name : <span style={{ color: '#a8a39c' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#1e1c1a' }}>{c.director || '—'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        {c.registration_email
                          ? <a href={`mailto:${c.registration_email}`} style={{ color: '#1a5fa8', textDecoration: 'none', fontSize: '12px' }}>{c.registration_email}</a>
                          : <span style={{ color: '#a8a39c' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#4a6d8c' }}>{c.phone_number || '—'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        {c.sp_contact_email
                          ? <a href={`mailto:${c.sp_contact_email}`} style={{ color: '#1a5fa8', textDecoration: 'none', fontSize: '12px' }}>{c.sp_contact_email}</a>
                          : <span style={{ fontSize: '11px', color: '#a8a39c', fontStyle: 'italic' }}>Not yet available</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* FEES */}
          {resourceTab === 'fees' && (
            <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#0d2d5e' }}>
                    {['State', 'Registration Fee', 'Renewal Fee', 'Permit Fee', 'Late Fee', 'Notes'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'rgba(255,255,255,.82)', fontWeight: '500', fontSize: '11px', letterSpacing: '.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filter(fees).map((f, i) => (
                    <tr key={f.id} style={{ borderBottom: '1px solid #f4f7fb', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '500', color: '#0d2d5e' }}>{f.state_name}</td>
                      <td style={{ padding: '10px 14px', color: '#2d6a4f', fontWeight: '500' }}>{f.registration_fee ? `$${f.registration_fee}` : '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#2d6a4f', fontWeight: '500' }}>{f.renewal_fee ? `$${f.renewal_fee}` : '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#2d6a4f', fontWeight: '500' }}>{f.permit_fee ? `$${f.permit_fee}` : '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#9a3510' }}>{f.late_fee ? `$${f.late_fee}` : '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#4a6d8c', fontSize: '11px' }}>{f.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* INSTALLATIONS */}
      {mainTab === 'installations' && (
        <div onMouseEnter={loadPackets}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* New Installation Form */}
            <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', background: '#0d2d5e' }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#fff', margin: 0 }}>New installation</p>
                <p style={{ fontSize: '11px', color: '#8bb4d4', margin: '2px 0 0' }}>Pre-fill a clinic's equipment and calendar data</p>
              </div>
              <div style={{ padding: '16px' }}>
                {instSent && (
                  <div style={{ padding: '10px 14px', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '8px', fontSize: '13px', color: '#2d6a4f', marginBottom: '12px' }}>
                    ✓ Installation packet sent — clinic will see it when they log in
                  </div>
                )}
                {/* Site emails */}
                <p style={{ fontSize: '11px', fontWeight: '600', color: '#4a6d8c', textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 8px' }}>Clinic / site email(s) *</p>
                {siteEmails.map((email, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <input type="email" placeholder="manager@clinic.com" value={email}
                      onChange={e => setSiteEmails(prev => prev.map((v, idx) => idx === i ? e.target.value : v))}
                      style={{ flex: 1, padding: '7px 10px', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif' }} />
                    {siteEmails.length > 1 && (
                      <button onClick={() => setSiteEmails(prev => prev.filter((_, idx) => idx !== i))}
                        style={{ padding: '7px 10px', background: '#fefafb', border: '1px solid #f5c6c9', borderRadius: '7px', color: '#931621', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif' }}>✕</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setSiteEmails(prev => [...prev, ''])}
                  style={{ fontSize: '12px', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '4px 12px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', marginBottom: '16px' }}>
                  + Add another site
                </button>

                {/* Machines */}
                <p style={{ fontSize: '11px', fontWeight: '600', color: '#4a6d8c', textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 8px' }}>X-ray equipment *</p>
                {machines.map((m, i) => (
                  <div key={i} style={{ padding: '12px', background: '#f8fbfe', borderRadius: '8px', border: '1px solid #dce8f5', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e' }}>Machine {i + 1}</span>
                      {machines.length > 1 && (
                        <button onClick={() => setMachines(prev => prev.filter((_, idx) => idx !== i))}
                          style={{ fontSize: '11px', color: '#931621', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>Remove</button>
                      )}
                    </div>
                    {[
                      { key: 'manufacturer', placeholder: 'GE Healthcare', label: 'Manufacturer *' },
                      { key: 'model', placeholder: 'Discovery XR656', label: 'Model *' },
                      { key: 'serial_number', placeholder: 'Serial number', label: 'Serial number' },
                      { key: 'room_location', placeholder: 'Room 1', label: 'Room location' },
                    ].map(field => (
                      <input key={field.key} placeholder={field.label} value={(m as any)[field.key]}
                        onChange={e => setMachines(prev => prev.map((v, idx) => idx === i ? { ...v, [field.key]: e.target.value } : v))}
                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif', marginBottom: '6px', boxSizing: 'border-box' as const }} />
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: '#4a6d8c', display: 'block', marginBottom: '3px' }}>Purchase date</label>
                        <input type="date" value={m.purchase_date}
                          onChange={e => setMachines(prev => prev.map((v, idx) => idx === i ? { ...v, purchase_date: e.target.value } : v))}
                          style={{ width: '100%', padding: '7px 10px', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif', boxSizing: 'border-box' as const }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: '#4a6d8c', display: 'block', marginBottom: '3px' }}>Warranty expiry</label>
                        <input type="date" value={m.warranty_expiry_date}
                          onChange={e => setMachines(prev => prev.map((v, idx) => idx === i ? { ...v, warranty_expiry_date: e.target.value } : v))}
                          style={{ width: '100%', padding: '7px 10px', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif', boxSizing: 'border-box' as const }} />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setMachines(prev => [...prev, { manufacturer: '', model: '', serial_number: '', type: 'General Radiography', purchase_date: '', warranty_expiry_date: '', room_location: '' }])}
                  style={{ fontSize: '12px', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '4px 12px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', marginBottom: '16px' }}>
                  + Add another machine
                </button>

                {/* Calendar events */}
                <p style={{ fontSize: '11px', fontWeight: '600', color: '#4a6d8c', textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 8px' }}>Calendar events</p>
                {calEvents.map((ev, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                    <select value={ev.type}
                      onChange={e => setCalEvents(prev => prev.map((v, idx) => idx === i ? { ...v, type: e.target.value, title: e.target.options[e.target.selectedIndex].text } : v))}
                      style={{ padding: '7px 10px', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif' }}>
                      <option value="calibration">Annual calibration</option>
                      <option value="qa">Equipment QA</option>
                      <option value="renewal">Registration renewal</option>
                      <option value="dosimetry">Dosimetry reading</option>
                      <option value="lead_apron">Lead apron check</option>
                      <option value="software_update">Software update</option>
                    </select>
                    <input type="date" value={ev.date}
                      onChange={e => setCalEvents(prev => prev.map((v, idx) => idx === i ? { ...v, date: e.target.value } : v))}
                      style={{ flex: 1, padding: '7px 10px', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif' }} />
                    {calEvents.length > 1 && (
                      <button onClick={() => setCalEvents(prev => prev.filter((_, idx) => idx !== i))}
                        style={{ padding: '7px 10px', background: '#fefafb', border: '1px solid #f5c6c9', borderRadius: '7px', color: '#931621', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif' }}>✕</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setCalEvents(prev => [...prev, { type: 'qa', date: '', title: 'Equipment QA' }])}
                  style={{ fontSize: '12px', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '4px 12px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', marginBottom: '16px' }}>
                  + Add calendar event
                </button>

                <button onClick={submitInstallation} disabled={instSending}
                  style={{ width: '100%', padding: '10px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {instSending ? 'Sending...' : `Send to ${siteEmails.filter(e => e.trim()).length || 1} site${siteEmails.filter(e => e.trim()).length > 1 ? 's' : ''} →`}
                </button>
              </div>
            </div>

            {/* Sent Packets List */}
            <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', background: '#0d2d5e' }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#fff', margin: 0 }}>Sent installations</p>
                <p style={{ fontSize: '11px', color: '#8bb4d4', margin: '2px 0 0' }}>Track which clinics have accepted</p>
              </div>
              <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
                {instPackets.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#a8a39c', fontSize: '13px' }}>
                    No installations sent yet
                  </div>
                ) : instPackets.map((p: any) => (
                  <div key={p.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f4f7fb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: '0 0 2px' }}>
                          {p.equipment_data?.manufacturer} {p.equipment_data?.model}
                        </p>
                        <p style={{ fontSize: '11px', color: '#4a6d8c', margin: 0 }}>{p.clinic_email}</p>
                      </div>
                      <span style={{
                        fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px',
                        background: p.status === 'accepted' ? '#edfaf3' : '#f0f4f8',
                        color: p.status === 'accepted' ? '#2d6a4f' : '#4a6d8c',
                        border: `1px solid ${p.status === 'accepted' ? '#b8e8cc' : '#c2ddf0'}`
                      }}>
                        {p.status === 'accepted' ? '✓ Accepted' : 'Pending'}
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#a8a39c', margin: '4px 0 0' }}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER TOOLS */}
      {mainTab === 'tools' && (
        <div>
          <p style={{ fontSize: '13px', color: '#4a6d8c', marginBottom: '20px' }}>Resources to share with your clinic clients.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>📊</div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0d2d5e', marginBottom: '8px' }}>Technique Chart</h3>
              <p style={{ fontSize: '13px', color: '#4a6d8c', lineHeight: '1.65', marginBottom: '20px' }}>
                The Last Technique Chart You'll Ever Need — share with your clinic clients to help them establish proper x-ray exposure techniques.
              </p>
              <a href="/dashboard/technique-charts" style={{ display: 'inline-block', background: '#0d2d5e', color: '#fff', textDecoration: 'none', padding: '9px 18px', borderRadius: '7px', fontSize: '13px', fontWeight: '500' }}>
                Open Technique Chart →
              </a>
            </div>

            <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>🎓</div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0d2d5e', marginBottom: '8px' }}>X-ray Positioning Course</h3>
              <p style={{ fontSize: '13px', color: '#4a6d8c', lineHeight: '1.65', marginBottom: '8px' }}>
                X-ray Positioning and Techniques for the Basic Operator — a complete training course for your clinic clients' x-ray staff. As a Compliance Hub subscriber, your clients receive complimentary enrollment.
              </p>
              <p style={{ fontSize: '11px', color: '#2d6a4f', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '6px', padding: '6px 10px', marginBottom: '16px' }}>
                Coupon code <strong>COMPHUB</strong> is automatically applied — share the link below with your clients for free access.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a href={TEACHABLE_URL} target="_blank" rel="noopener"
                  style={{ display: 'inline-block', background: '#0d2d5e', color: '#fff', textDecoration: 'none', padding: '9px 18px', borderRadius: '7px', fontSize: '13px', fontWeight: '500' }}>
                  Preview Course →
                </a>
                <button onClick={copyTeachable}
                  style={{ background: copied ? '#edfaf3' : '#e8f3fb', color: copied ? '#2d6a4f' : '#1a5fa8', border: `1px solid ${copied ? '#b8e8cc' : '#c2ddf0'}`, borderRadius: '7px', padding: '9px 18px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {copied ? '✓ Link copied!' : 'Copy shareable link'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* REVENUE — pass through existing revenue content */}
      {mainTab === 'revenue' && (
        <div id="sp-revenue-content">
          {/* Revenue content rendered by parent */}
        </div>
      )}

    </div>
  )
}