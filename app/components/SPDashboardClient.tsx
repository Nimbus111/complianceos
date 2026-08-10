'use client'
import { useState } from 'react'

const TEACHABLE_URL = 'https://g-turner-consultants.teachable.com/p/x-ray-positioning-and-techniques-for-the-basic-operator1?coupon_code=COMPHUB&product_id=6645011'

type Tab = 'forms' | 'sp-rules' | 'states' | 'contacts' | 'fees'
type MainTab = 'resources' | 'tools' | 'revenue'

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
        {([['resources', 'State Resources'], ['tools', 'Customer Tools'], ['revenue', 'Revenue']] as const).map(([t, label]) => (
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
                      <button key={state} onClick={() => setSearch(state)}
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
          )}

            </div>
                </div>
              )}
            </div>


          {resourceTab === 'forms' && (
            <div>
              {!search ? (
                <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>Select a state to view its forms</p>
                  <p style={{ fontSize: '12px', color: '#4a6d8c', marginBottom: '20px' }}>Type a state name in the filter box above</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
                    {[...new Set(forms.map((f: any) => f.state_name).filter(Boolean))].sort().map((state: any) => (
                      <button key={state} onClick={() => setSearch(state)}
                        style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', border: '1px solid #c2ddf0', background: '#f0f4f8', color: '#0d2d5e', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {state}
                      </button>
                    ))}
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
                      {filter(forms).map((f: any, i: number) => (
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
                      {filter(forms).length === 0 && (
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