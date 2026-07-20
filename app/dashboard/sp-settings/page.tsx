'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const PAYOUT_METHODS = [
  { value: 'paypal', label: 'PayPal', placeholder: 'PayPal email address' },
  { value: 'zelle', label: 'Zelle', placeholder: 'Zelle email or phone number' },
  { value: 'venmo', label: 'Venmo', placeholder: 'Venmo username or phone' },
  { value: 'ach', label: 'ACH / Bank Transfer', placeholder: 'Bank name and last 4 digits of account' },
  { value: 'check', label: 'Check by Mail', placeholder: 'Mailing address for check' },
  { value: 'other', label: 'Other', placeholder: 'Describe your preferred payment method' },
]

const inp: React.CSSProperties = {
  width: '100%', height: '40px', border: '1px solid #c2ddf0', borderRadius: '8px',
  padding: '0 12px', fontSize: '13px', color: '#0d2d5e', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
}

export default function SPSettingsPage() {
  const [org, setOrg] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [payoutMethod, setPayoutMethod] = useState('')
  const [payoutDetail, setPayoutDetail] = useState('')
  const [payoutNotes, setPayoutNotes] = useState('')
  const router = useRouter()

  const fetchAll = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) { router.push('/onboarding'); return }
    const { data: orgData } = await supabase.from('organizations').select('*').eq('id', profile.org_id).single()
    setOrg(orgData)
    if (orgData?.payout_method) setPayoutMethod(orgData.payout_method)
    if (orgData?.payout_detail) setPayoutDetail(orgData.payout_detail)
    if (orgData?.payout_notes) setPayoutNotes(orgData.payout_notes)
    setLoading(false)
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSave = async () => {
    if (!payoutMethod || !payoutDetail) return
    setSaving(true)
    const res = await fetch('/api/sp/payout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payout_method: payoutMethod, payout_detail: payoutDetail, payout_notes: payoutNotes })
    })
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const selectedMethod = PAYOUT_METHODS.find(m => m.value === payoutMethod)

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

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>SP Account Settings</h1>
          <p style={{ fontSize: '13px', color: '#827d76' }}>{org?.name} · Dealer / Service Provider</p>
        </div>

        {/* PAYOUT SETTINGS */}
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>Commission payout method</p>
            <p style={{ fontSize: '12px', color: '#827d76', lineHeight: '1.6' }}>
              How would you like to receive your referral commissions? The Radiology Coach processes payouts on the 15th of each month.
            </p>
          </div>

          {org?.payout_method && !saving && (
            <div style={{ background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '14px' }}>✓</span>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#2d6a4f', margin: '0 0 2px' }}>
                  {PAYOUT_METHODS.find(m => m.value === org.payout_method)?.label || org.payout_method}
                </p>
                <p style={{ fontSize: '12px', color: '#2d6a4f', margin: 0 }}>{org.payout_detail}</p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#4a6d8c', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                Payout method *
              </label>
              <select style={inp} value={payoutMethod} onChange={e => { setPayoutMethod(e.target.value); setPayoutDetail('') }}>
                <option value="">Select how you want to be paid</option>
                {PAYOUT_METHODS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {payoutMethod && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#4a6d8c', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                  {selectedMethod?.label} details *
                </label>
                <input style={inp} type="text" placeholder={selectedMethod?.placeholder || ''} value={payoutDetail} onChange={e => setPayoutDetail(e.target.value)} />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#4a6d8c', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                Notes (optional)
              </label>
              <input style={inp} type="text" placeholder="Any additional instructions for payment" value={payoutNotes} onChange={e => setPayoutNotes(e.target.value)} />
            </div>

            <button onClick={handleSave} disabled={!payoutMethod || !payoutDetail || saving}
              style={{ height: '40px', background: (!payoutMethod || !payoutDetail || saving) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: (!payoutMethod || !payoutDetail || saving) ? 'default' : 'pointer', marginTop: '4px' }}>
              {saving ? 'Saving...' : 'Save payout method'}
            </button>

            {saved && (
              <div style={{ background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#2d6a4f' }}>
                ✓ Payout method saved — you&apos;re all set for your first commission payment.
              </div>
            )}
          </div>

          <div style={{ background: '#f4f7fb', borderRadius: '8px', padding: '12px 14px', marginTop: '16px', fontSize: '12px', color: '#4a6d8c', lineHeight: '1.65' }}>
            <strong style={{ color: '#0d2d5e' }}>How payouts work:</strong> Commissions are tracked automatically when your referred facilities make payments. Pending commissions are processed and paid on the 15th of each month. You&apos;ll receive a summary email with each payment.
          </div>
        </div>

        {/* COMPANY INFO */}
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '24px' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '14px' }}>Company information</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['Company', org?.name],
              ['Primary state', org?.facility_state],
              ['Referral code', org?.referral_code],
              ['Account type', 'Dealer / Service Provider'],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f4f7fb', borderRadius: '6px' }}>
                <span style={{ fontSize: '12px', color: '#827d76' }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e' }}>{value}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: '#a8a39c', marginTop: '12px', fontStyle: 'italic' }}>
            To update company information contact hello@theradiologycoach.com
          </p>
        </div>
      </div>
    </div>
  )
}