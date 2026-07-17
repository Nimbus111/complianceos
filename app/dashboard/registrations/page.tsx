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

const STATUS_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  active:   { color: '#2d6a4f', bg: '#edfaf3', border: '#b8e8cc' },
  pending:  { color: '#9a3510', bg: '#fff6e8', border: '#f0d4a0' },
  expired:  { color: '#931621', bg: '#fefafb', border: '#f5c6c9' },
}

const inp: React.CSSProperties = {
  width: '100%', height: '38px', border: '1px solid #c2ddf0', borderRadius: '8px',
  padding: '0 10px', fontSize: '13px', color: '#0d2d5e', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '10px', fontWeight: '500', color: '#a8a39c',
  marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.07em',
}

export default function RegistrationsPage() {
  const [licenses, setLicenses] = useState<any[]>([])
const [stateRules, setStateRules] = useState<Record<string, any>>({})
  const [orgName, setOrgName] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const [state, setState] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [issuedDate, setIssuedDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [status, setStatus] = useState('active')
  const [notes, setNotes] = useState('')

  const fetchAll = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) { router.push('/onboarding'); return }
    const { data: org } = await supabase.from('organizations').select('name').eq('id', profile.org_id).single()
    if (org) setOrgName(org.name)
    const { data } = await supabase.from('service_provider_licenses').select('*').eq('org_id', profile.org_id).order('created_at', { ascending: false })
    setLicenses(data || [])
const { data: rules } = await supabase
  .from('sp_state_rules')
  .select('*')
const rulesMap: Record<string, any> = {}
;(rules || []).forEach((r: any) => { if (r.state_name) rulesMap[r.state_name] = r })
setStateRules(rulesMap)
setLoading(false)
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  const resetForm = () => {
    setState(''); setLicenseNumber(''); setLicenseType('')
    setIssuedDate(''); setExpiryDate(''); setStatus('active')
    setNotes(''); setShowForm(false)
  }

  const handleAdd = async () => {
    if (!state || !licenseNumber) return
    setSaving(true)
    const res = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, license_number: licenseNumber, license_type: licenseType, issued_date: issuedDate, expiry_date: expiryDate, status, notes })
    })
    if (res.ok) { resetForm(); fetchAll() }
    else { const r = await res.json(); alert(r.error || 'Error') }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this registration? Cannot be undone.')) return
    await fetch('/api/registrations', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchAll()
  }

  const copy = (text: string) => navigator.clipboard.writeText(text).catch(() => {})

  const today = new Date()
  const soon = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)

  if (loading) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#a8a39c' }}>Loading registrations...</p>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
           <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>State Registrations</h1>
<button onClick={async () => {
  const res = await fetch('/api/sp/populate-calendar', { method: 'POST' })
  const r = await res.json()


            <p style={{ fontSize: '13px', color: '#827d76' }}>{orgName} · Your x-ray service provider license numbers by state</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            style={{ height: '36px', padding: '0 16px', background: showForm ? '#fff' : '#0d2d5e', color: showForm ? '#0d2d5e' : '#fff', border: `1px solid ${showForm ? '#c2ddf0' : '#0d2d5e'}`, borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
            {showForm ? 'Cancel' : '+ Add registration'}
          </button>
        </div>

        {showForm && (
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '14px' }}>Add state registration</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={lbl}>State *</label>
                <select style={inp} value={state} onChange={e => setState(e.target.value)}>
                  <option value="">Select state</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>License / registration number *</label>
                <input style={inp} type="text" placeholder="e.g. SP-GA-2024-0042" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>License type</label>
                <input style={inp} type="text" placeholder="e.g. X-ray Service Provider" value={licenseType} onChange={e => setLicenseType(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Status</label>
                <select style={inp} value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Issued date</label>
                <input style={inp} type="date" value={issuedDate} onChange={e => setIssuedDate(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Expiry date</label>
                <input style={inp} type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Notes</label>
                <input style={inp} type="text" placeholder="Any additional notes" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
            <button onClick={handleAdd} disabled={!state || !licenseNumber || saving}
              style={{ height: '36px', padding: '0 18px', background: (!state || !licenseNumber) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: (!state || !licenseNumber) ? 'default' : 'pointer' }}>
              {saving ? 'Saving...' : 'Add registration'}
            </button>
          </div>
        )}

        {licenses.length === 0 && !showForm ? (
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>No registrations yet</p>
            <p style={{ fontSize: '13px', color: '#827d76', maxWidth: '380px', margin: '0 auto' }}>Add your state x-ray service provider license numbers to track renewals and keep them accessible for inspections.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {licenses.map(lic => {
              const st = STATUS_STYLES[lic.status] || STATUS_STYLES.active
              const expiry = lic.expiry_date ? new Date(lic.expiry_date) : null
              const isExpired = expiry && expiry < today
              const isExpiring = expiry && !isExpired && expiry < soon
              return (
                <div key={lic.id} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', fontWeight: '500', color: '#0d2d5e', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '2px 10px' }}>{lic.state}</span>
                      {lic.license_type && <span style={{ fontSize: '11px', color: '#827d76' }}>{lic.license_type}</span>}
                      <span style={{ fontSize: '10px', fontWeight: '500', color: st.color, background: st.bg, border: `1px solid ${st.border}`, borderRadius: '20px', padding: '2px 8px' }}>
                        {lic.status.charAt(0).toUpperCase() + lic.status.slice(1)}
                      </span>
                    </div>
                    <button onClick={() => handleDelete(lic.id)} style={{ padding: '3px 10px', border: '1px solid #f5c6c9', borderRadius: '6px', background: '#fff', color: '#931621', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
                  </div>
                  <div style={{ background: '#f4f7fb', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#827d76' }}>License / registration #</span>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e' }}>{lic.license_number}</span>
                        <button onClick={() => copy(lic.license_number)} style={{ padding: '1px 8px', border: '1px solid #c2ddf0', borderRadius: '4px', background: '#fff', color: '#1a5fa8', fontSize: '10px', cursor: 'pointer' }}>Copy</button>
                      </div>
                    </div>
                    {lic.issued_date && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', color: '#827d76' }}>Issued</span>
                        <span style={{ fontSize: '12px', color: '#0d2d5e' }}>{new Date(lic.issued_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                    {expiry && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', color: '#827d76' }}>Expires</span>
                        <span style={{ fontSize: '12px', fontWeight: '500', color: isExpired ? '#931621' : isExpiring ? '#c44a1a' : '#40916c' }}>
                          {expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {isExpired ? ' — Expired' : isExpiring ? ' — Renew soon' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  {lic.notes && <p style={{ fontSize: '12px', color: '#827d76', marginTop: '8px' }}>{lic.notes}</p>}
{stateRules[lic.state] && (
  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eef3fb', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
    {stateRules[lic.state].vendor_registration_required && (
      <span style={{ fontSize: '10px', fontWeight: '500', color: '#0d2d5e', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '2px 8px' }}>Registration required</span>
    )}
    {stateRules[lic.state].renewal_frequency && (
      <span style={{ fontSize: '10px', fontWeight: '500', color: '#2d6a4f', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '20px', padding: '2px 8px' }}>{stateRules[lic.state].renewal_frequency} renewal</span>
    )}
    {stateRules[lic.state].out_of_state_reciprocity === 'Yes' && (
      <span style={{ fontSize: '10px', fontWeight: '500', color: '#4c1d95', background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: '20px', padding: '2px 8px' }}>Reciprocity allowed</span>
    )}
    {stateRules[lic.state].annual_renewal_date && (
      <span style={{ fontSize: '10px', color: '#827d76', background: '#f4f7fb', border: '1px solid #e8e6e2', borderRadius: '20px', padding: '2px 8px' }}>Renews: {stateRules[lic.state].annual_renewal_date}</span>
    )}
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