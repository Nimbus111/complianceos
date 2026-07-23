'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming']

const FACILITY_TYPES = ['Podiatry Clinic','Chiropractic Clinic','Dental Office','Medical Clinic','Urgent Care Center','Hospital','Imaging Center','Orthopedic Clinic','Surgery Center','Veterinary Clinic','Mobile X-ray','Other']

const MODALITIES = ['General Radiography','Portable X-ray','C-arm Fluoroscopy','Mini C-arm','Mobile X-ray Unit','Computed Tomography (CT) Scanner','Cone Beam CT','Bone Densitometry','Panoramic Unit','Dental X-ray','Handheld X-ray']

const inp: React.CSSProperties = {
  width: '100%', height: '40px', border: '1px solid #c2ddf0', borderRadius: '8px',
  padding: '0 12px', fontSize: '13px', color: '#0d2d5e', background: '#fff',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif'
}

const lbl: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: '500', color: '#4a6d8c',
  marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.07em'
}

function TeamSection({ orgId }: { orgId: string }) {
  const [members, setMembers] = useState<any[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Manager')
  const [inviting, setInviting] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  const inp2: React.CSSProperties = {
    width: '100%', height: '40px', border: '1px solid #c2ddf0', borderRadius: '8px',
    padding: '0 12px', fontSize: '13px', color: '#0d2d5e', background: '#fff',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif'
  }

  useEffect(() => {
    if (!orgId) return
    const supabase = createClient()
    supabase.from('memberships')
      .select('id, role, user_id, profiles:user_id(id, display_name)')
      .eq('org_id', orgId)
      .then(({ data }) => setMembers(data || []))
  }, [orgId, inviteLink, removing])

  const handleInvite = async () => {
    if (!inviteEmail) return
    setInviting(true)
    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole })
    })
    const data = await res.json()
    if (data.invite_url) {
      setInviteLink(data.invite_url)
      setInviteEmail('')
    } else {
      alert(data.error || 'Failed to create invite')
    }
    setInviting(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleRemove = async (membershipId: string) => {
    if (!confirm('Remove this team member? They will lose access immediately.')) return
    setRemoving(membershipId)
    await fetch('/api/invite', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ membership_id: membershipId })
    })
    setRemoving(null)
  }

  const ROLES: Record<string, { label: string; desc: string; color: string; bg: string; border: string }> = {
    Admin: { label: 'Admin', desc: 'Full access including billing and team management', color: '#0d2d5e', bg: '#e8f3fb', border: '#c2ddf0' },
    Manager: { label: 'Manager', desc: 'Full compliance access, no billing or team management', color: '#2d6a4f', bg: '#edfaf3', border: '#b8e8cc' },
    Technician: { label: 'Technician', desc: 'View-only, can check Required Actions tasks', color: '#9a3510', bg: '#fff6e8', border: '#f0d4a0' },
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>Team members</p>
        <p style={{ fontSize: '12px', color: '#827d76' }}>Professional accounts support up to 3 team members.</p>
      </div>

      {members.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {members.map(m => {
            const r = ROLES[m.role] || ROLES.Manager
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f4f7fb', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e8f3fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: '#0d2d5e', flexShrink: 0 }}>
                    {(m.profiles?.display_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>
                      {m.profiles?.display_name || 'Team member'}
                    </p>
                    <span style={{ fontSize: '10px', fontWeight: '500', color: r.color, background: r.bg, border: `1px solid ${r.border}`, borderRadius: '20px', padding: '1px 7px' }}>{r.label}</span>
                  </div>
                </div>
                {m.role !== 'Admin' && (
                  <button onClick={() => handleRemove(m.id)} disabled={removing === m.id}
                    style={{ fontSize: '11px', color: '#a8a39c', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
                    {removing === m.id ? 'Removing...' : 'Remove'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {members.length < 3 && (
        <div>
          <p style={{ fontSize: '11px', fontWeight: '500', color: '#4a6d8c', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '10px' }}>Invite a team member</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
            <input style={inp2} type="email" placeholder="Their email address" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
            <select style={inp2} value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
              <option value="Manager">Manager — full compliance access, no billing</option>
              <option value="Technician">Technician — view only, can check tasks</option>
            </select>
            <button onClick={handleInvite} disabled={!inviteEmail || inviting}
              style={{ height: '40px', background: (!inviteEmail || inviting) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
              {inviting ? 'Generating link...' : 'Generate invite link'}
            </button>
          </div>

          {inviteLink && (
            <div style={{ background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '8px', padding: '12px 14px' }}>
              <p style={{ fontSize: '11px', fontWeight: '500', color: '#2d6a4f', marginBottom: '8px' }}>
                ✓ Invite link ready — share this with your team member. Expires in 7 days.
              </p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <code style={{ fontSize: '11px', color: '#0d2d5e', background: '#fff', border: '1px solid #b8e8cc', borderRadius: '6px', padding: '6px 10px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                  {inviteLink}
                </code>
                <button onClick={handleCopy}
                  style={{ height: '34px', padding: '0 14px', background: copied ? '#2d6a4f' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {members.length >= 3 && (
        <div style={{ background: '#f4f7fb', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#827d76', textAlign: 'center' }}>
          Team is full (3 of 3 members). Upgrade to Enterprise for unlimited users.
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [org, setOrg] = useState<any>(null)
  const [spOrgs, setSpOrgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Facility edit state
  const [editingFacility, setEditingFacility] = useState(false)
  const [facilityForm, setFacilityForm] = useState({
    name: '', facility_state: '', facility_type_name: '',
    modality_names: [] as string[], rso_name: '', rso_phone: '', rso_email: ''
  })
  const [savingFacility, setSavingFacility] = useState(false)
  const [facilitySaved, setFacilitySaved] = useState(false)

  // Dealer state
  const [dealerMode, setDealerMode] = useState<'subscriber' | 'manual' | null>(null)
  const [selectedSp, setSelectedSp] = useState('')
  const [dealerName, setDealerName] = useState('')
  const [dealerPhone, setDealerPhone] = useState('')
  const [dealerEmail, setDealerEmail] = useState('')
  const [savingDealer, setSavingDealer] = useState(false)
  const [dealerSaved, setDealerSaved] = useState(false)

  const router = useRouter()

  const fetchAll = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) { router.push('/onboarding'); return }
    const { data: orgData } = await supabase.from('organizations').select('*').eq('id', profile.org_id).single()
    setOrg(orgData)
    setFacilityForm({
      name: orgData?.name || '',
      facility_state: orgData?.facility_state || '',
      facility_type_name: orgData?.facility_type_name || '',
      modality_names: orgData?.modality_names || [],
      rso_name: orgData?.rso_name || '',
      rso_phone: orgData?.rso_phone || '',
      rso_email: orgData?.rso_email || '',
    })
    if (orgData?.dealer_name) setDealerName(orgData.dealer_name)
    if (orgData?.dealer_phone) setDealerPhone(orgData.dealer_phone)
    if (orgData?.dealer_email) setDealerEmail(orgData.dealer_email)
    const { data: sps } = await supabase.from('organizations').select('id, name').eq('org_type', 'service_provider').order('name')
    setSpOrgs(sps || [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  const toggleModality = (mod: string) => {
    setFacilityForm(prev => ({
      ...prev,
      modality_names: prev.modality_names.includes(mod)
        ? prev.modality_names.filter(m => m !== mod)
        : [...prev.modality_names, mod]
    }))
  }

  const handleSaveFacility = async () => {
    setSavingFacility(true)
    const res = await fetch('/api/facility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facilityForm)
    })
    if (res.ok) {
      setFacilitySaved(true)
      setEditingFacility(false)
      fetchAll()
      setTimeout(() => setFacilitySaved(false), 3000)
    }
    setSavingFacility(false)
  }

  const handleSaveDealer = async () => {
    setSavingDealer(true)
    let body: any = { mode: dealerMode }
    if (dealerMode === 'subscriber') body.sp_org_id = selectedSp
    if (dealerMode === 'manual') { body.dealer_name = dealerName; body.dealer_phone = dealerPhone; body.dealer_email = dealerEmail }
    if (dealerMode === null) body.mode = 'clear'
    const res = await fetch('/api/dealer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { setDealerSaved(true); fetchAll(); setTimeout(() => setDealerSaved(false), 3000) }
    setSavingDealer(false)
    setDealerMode(null)
  }

  const hasDealerNow = org?.dealer_name || org?.dealer_sp_org_id

  if (loading) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#a8a39c' }}>Loading settings...</p>
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

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>Account Settings</h1>
        <p style={{ fontSize: '13px', color: '#827d76', marginBottom: '32px' }}>{org?.name} · {org?.facility_state}</p>

        {/* ── FACILITY INFO ── */}
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>Facility information</p>
            <button onClick={() => setEditingFacility(!editingFacility)}
              style={{ fontSize: '12px', fontWeight: '500', color: editingFacility ? '#931621' : '#1a5fa8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {editingFacility ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {!editingFacility ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                ['Facility name', org?.name],
                ['State', org?.facility_state],
                ['Facility type', org?.facility_type_name],
                ['Modalities', (org?.modality_names || []).join(', ')],
                ['RSO name', org?.rso_name],
                ['RSO phone', org?.rso_phone],
                ['RSO email', org?.rso_email],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f4f7fb', borderRadius: '6px', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#827d76', flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e', textAlign: 'right' }}>{value}</span>
                </div>
              ))}
              {facilitySaved && (
                <div style={{ background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#2d6a4f' }}>
                  ✓ Facility information updated successfully
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#fff6e8', border: '1px solid #f0d4a0', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#9a3510', lineHeight: '1.6' }}>
                <strong>Heads up:</strong> Changing your state, facility type, or modalities will immediately update your compliance requirements, State Compliance Guide, and AI assistant context.
              </div>

              <div>
                <label style={lbl}>Facility name</label>
                <input style={inp} value={facilityForm.name} onChange={e => setFacilityForm(p => ({ ...p, name: e.target.value }))} />
              </div>

              <div>
                <label style={lbl}>State</label>
                <select style={inp} value={facilityForm.facility_state} onChange={e => setFacilityForm(p => ({ ...p, facility_state: e.target.value }))}>
                  <option value="">Select state</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={lbl}>Facility type</label>
                <select style={inp} value={facilityForm.facility_type_name} onChange={e => setFacilityForm(p => ({ ...p, facility_type_name: e.target.value }))}>
                  <option value="">Select facility type</option>
                  {FACILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={lbl}>Modalities</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginTop: '4px' }}>
                  {MODALITIES.map(mod => {
                    const selected = facilityForm.modality_names.includes(mod)
                    return (
                      <button key={mod} type="button" onClick={() => toggleModality(mod)}
                        style={{ padding: '5px 12px', borderRadius: '20px', border: `1px solid ${selected ? '#0d2d5e' : '#c2ddf0'}`, background: selected ? '#0d2d5e' : '#fff', color: selected ? '#fff' : '#4a6d8c', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {selected ? '✓ ' : ''}{mod}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ paddingTop: '8px', borderTop: '1px solid #eef3fb' }}>
                <p style={{ fontSize: '11px', fontWeight: '500', color: '#4a6d8c', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '12px' }}>RSO Information</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <label style={lbl}>RSO name</label>
                    <input style={inp} placeholder="Radiation Safety Officer name" value={facilityForm.rso_name} onChange={e => setFacilityForm(p => ({ ...p, rso_name: e.target.value }))} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={lbl}>RSO phone</label>
                      <input style={inp} placeholder="Phone" value={facilityForm.rso_phone} onChange={e => setFacilityForm(p => ({ ...p, rso_phone: e.target.value }))} />
                    </div>
                    <div>
                      <label style={lbl}>RSO email</label>
                      <input style={inp} placeholder="Email" value={facilityForm.rso_email} onChange={e => setFacilityForm(p => ({ ...p, rso_email: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setEditingFacility(false)}
                  style={{ flex: 1, height: '40px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={handleSaveFacility} disabled={!facilityForm.name || !facilityForm.facility_state || savingFacility}
                  style={{ flex: 2, height: '40px', background: (!facilityForm.name || !facilityForm.facility_state || savingFacility) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                  {savingFacility ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── TEAM ── */}
        <TeamSection orgId={org?.id} />

        {/* ── DEALER ── */}
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '14px' }}>X-ray dealer</p>
          {hasDealerNow ? (
            <div style={{ background: '#f4f7fb', borderRadius: '8px', padding: '12px 16px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: '0 0 2px' }}>{org.dealer_name || 'Dealer on file'}</p>
                {org.dealer_phone && <p style={{ fontSize: '12px', color: '#827d76', margin: 0 }}>{org.dealer_phone}</p>}
              </div>
              <span style={{ fontSize: '10px', fontWeight: '500', color: '#2d6a4f', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '20px', padding: '2px 8px' }}>Active</span>
            </div>
          ) : (
            <div style={{ background: '#fff6e8', border: '1px dashed #f0d4a0', borderRadius: '8px', padding: '12px 16px', marginBottom: '14px' }}>
              <p style={{ fontSize: '13px', color: '#9a3510', margin: 0 }}>No dealer on file — add one for emergency access from your dashboard.</p>
            </div>
          )}

          <div style={{ background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '12px', color: '#1a5fa8', lineHeight: '1.6' }}>
            <strong>Note:</strong> Changing your service dealer updates your emergency contact only. Revenue share arrangements are maintained separately. To discontinue a revenue share, email <strong>hello@theradiologycoach.com</strong>.
          </div>

          {!dealerMode && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => setDealerMode('subscriber')}
                style={{ height: '36px', padding: '0 16px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                🔍 Find dealer on ComplianceOS
              </button>
              <button onClick={() => setDealerMode('manual')}
                style={{ height: '36px', padding: '0 16px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                ✏️ Enter manually
              </button>
              {hasDealerNow && (
                <button onClick={handleSaveDealer}
                  style={{ height: '36px', padding: '0 14px', background: '#fff', color: '#931621', border: '1px solid #f5c6c9', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                  Remove dealer
                </button>
              )}
            </div>
          )}

          {dealerMode === 'subscriber' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select style={inp} value={selectedSp} onChange={e => setSelectedSp(e.target.value)}>
                <option value="">Select your dealer...</option>
                {spOrgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setDealerMode(null)} style={{ flex: 1, height: '38px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveDealer} disabled={!selectedSp || savingDealer}
                  style={{ flex: 2, height: '38px', background: (!selectedSp || savingDealer) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                  {savingDealer ? 'Saving...' : 'Save dealer'}
                </button>
              </div>
            </div>
          )}

          {dealerMode === 'manual' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input style={inp} placeholder="Dealer company name" value={dealerName} onChange={e => setDealerName(e.target.value)} />
              <input style={inp} type="tel" placeholder="Phone" value={dealerPhone} onChange={e => setDealerPhone(e.target.value)} />
              <input style={inp} type="email" placeholder="Email (optional)" value={dealerEmail} onChange={e => setDealerEmail(e.target.value)} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setDealerMode(null)} style={{ flex: 1, height: '38px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveDealer} disabled={!dealerName || savingDealer}
                  style={{ flex: 2, height: '38px', background: (!dealerName || savingDealer) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                  {savingDealer ? 'Saving...' : 'Save dealer'}
                </button>
              </div>
            </div>
          )}

          {dealerSaved && (
            <div style={{ background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '8px', padding: '10px 14px', marginTop: '12px', fontSize: '12px', color: '#2d6a4f' }}>
              ✓ Dealer updated successfully
            </div>
          )}
        </div>

        {/* ── SUBSCRIPTION ── */}
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '20px 24px' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>Subscription</p>
          <p style={{ fontSize: '12px', color: '#827d76', marginBottom: '14px', lineHeight: '1.6' }}>
            Update your payment method, view invoices, or cancel your subscription through the secure Stripe billing portal.
          </p>
          <button
            onClick={async () => {
              const res = await fetch('/api/billing/portal', { method: 'POST' })
              const data = await res.json()
              if (data.url) window.location.href = data.url
              else alert(data.error || 'No active subscription found')
            }}
            style={{ height: '36px', padding: '0 18px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
            Manage subscription →
          </button>
        </div>

      </div>
    </div>
  )
}