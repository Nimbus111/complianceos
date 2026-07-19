'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const inp: React.CSSProperties = {
  width: '100%', height: '40px', border: '1px solid #c2ddf0', borderRadius: '8px',
  padding: '0 12px', fontSize: '13px', color: '#0d2d5e', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
}

export default function SettingsPage() {
  const [org, setOrg] = useState<any>(null)
  const [spOrgs, setSpOrgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dealerMode, setDealerMode] = useState<'subscriber' | 'manual' | null>(null)
  const [selectedSp, setSelectedSp] = useState('')
  const [dealerName, setDealerName] = useState('')
  const [dealerPhone, setDealerPhone] = useState('')
  const [dealerEmail, setDealerEmail] = useState('')
  const router = useRouter()

  const fetchAll = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) { router.push('/onboarding'); return }
    const { data: orgData } = await supabase.from('organizations').select('*').eq('id', profile.org_id).single()
    setOrg(orgData)
    if (orgData?.dealer_name) setDealerName(orgData.dealer_name)
    if (orgData?.dealer_phone) setDealerPhone(orgData.dealer_phone)
    if (orgData?.dealer_email) setDealerEmail(orgData.dealer_email)
    const { data: sps } = await supabase.from('organizations').select('id, name').eq('org_type', 'service_provider').order('name')
    setSpOrgs(sps || [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSave = async () => {
    setSaving(true)
    let body: any = { mode: dealerMode }
    if (dealerMode === 'subscriber') body.sp_org_id = selectedSp
    if (dealerMode === 'manual') { body.dealer_name = dealerName; body.dealer_phone = dealerPhone; body.dealer_email = dealerEmail }
    if (dealerMode === null) body.mode = 'clear'
    const res = await fetch('/api/dealer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) { setSaved(true); fetchAll(); setTimeout(() => setSaved(false), 3000) }
    setSaving(false)
    setDealerMode(null)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#a8a39c' }}>Loading settings...</p>
    </div>
  )

  const hasDealerNow = org?.dealer_name || org?.dealer_sp_org_id

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

        {/* CURRENT DEALER */}
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '14px' }}>Current x-ray dealer</p>
          {hasDealerNow ? (
            <div style={{ background: '#f4f7fb', borderRadius: '8px', padding: '12px 16px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: '0 0 2px' }}>{org.dealer_name || 'Dealer on file'}</p>
                {org.dealer_phone && <p style={{ fontSize: '12px', color: '#827d76', margin: 0 }}>{org.dealer_phone}</p>}
                {org.dealer_email && <p style={{ fontSize: '12px', color: '#827d76', margin: 0 }}>{org.dealer_email}</p>}
              </div>
              <span style={{ fontSize: '10px', fontWeight: '500', color: '#2d6a4f', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '20px', padding: '2px 8px' }}>Active</span>
            </div>
          ) : (
            <div style={{ background: '#fff6e8', border: '1px dashed #f0d4a0', borderRadius: '8px', padding: '12px 16px', marginBottom: '14px' }}>
              <p style={{ fontSize: '13px', color: '#9a3510', margin: 0 }}>No dealer on file — add one below for quick emergency access from your dashboard.</p>
            </div>
          )}

          <div style={{ background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#1a5fa8', lineHeight: '1.6' }}>
            <strong>Revenue share note:</strong> Changing your service dealer here updates your emergency contact and panic button only. If your original dealer referred you to ComplianceOS, their revenue share arrangement is maintained separately. To discontinue a revenue share arrangement, please contact us at <strong>hello@theradiologycoach.com</strong>.
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
                <button onClick={handleSave}
                  style={{ height: '36px', padding: '0 14px', background: '#fff', color: '#931621', border: '1px solid #f5c6c9', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                  Remove dealer
                </button>
              )}
            </div>
          )}

          {dealerMode === 'subscriber' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select style={inp} value={selectedSp} onChange={e => setSelectedSp(e.target.value)}>
                <option value="">Select your dealer from the list...</option>
                {spOrgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              {selectedSp && (
                <div style={{ background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#2d6a4f' }}>
                  ✓ {spOrgs.find(o => o.id === selectedSp)?.name} will appear on your dashboard panic button.
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setDealerMode(null)} style={{ flex: 1, height: '38px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSave} disabled={!selectedSp || saving}
                  style={{ flex: 2, height: '38px', background: (!selectedSp || saving) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: (!selectedSp || saving) ? 'default' : 'pointer' }}>
                  {saving ? 'Saving...' : 'Save dealer'}
                </button>
              </div>
            </div>
          )}

          {dealerMode === 'manual' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input style={inp} type="text" placeholder="Dealer company name" value={dealerName} onChange={e => setDealerName(e.target.value)} />
              <input style={inp} type="tel" placeholder="Phone number" value={dealerPhone} onChange={e => setDealerPhone(e.target.value)} />
              <input style={inp} type="email" placeholder="Email (optional)" value={dealerEmail} onChange={e => setDealerEmail(e.target.value)} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setDealerMode(null)} style={{ flex: 1, height: '38px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSave} disabled={!dealerName || saving}
                  style={{ flex: 2, height: '38px', background: (!dealerName || saving) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: (!dealerName || saving) ? 'default' : 'pointer' }}>
                  {saving ? 'Saving...' : 'Save dealer'}
                </button>
              </div>
            </div>
          )}

          {saved && (
            <div style={{ background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '8px', padding: '10px 14px', marginTop: '12px', fontSize: '12px', color: '#2d6a4f' }}>
              ✓ Dealer updated successfully
            </div>
          )}
        </div>

        {/* MANAGE SUBSCRIPTION */}
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>Subscription</p>
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

        {/* ACCOUNT INFO */}
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '20px 24px' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '14px' }}>Account information</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['Facility', org?.name],
              ['Type', org?.facility_type_name],
              ['State', org?.facility_state],
              ['Modalities', (org?.modality_names || []).join(', ')],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f4f7fb', borderRadius: '6px' }}>
                <span style={{ fontSize: '12px', color: '#827d76' }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e' }}>{value}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: '#a8a39c', marginTop: '12px', fontStyle: 'italic' }}>
            To update facility information, contact hello@theradiologycoach.com
          </p>
        </div>

      </div>
    </div>
  )
}