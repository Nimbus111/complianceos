'use client'

import { useState, useEffect } from 'react'
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

const SPECIALTIES = [
  'General Radiography',
  'C-arms',
  'Podiatry X-ray',
  'Mobile X-ray',
  'CT',
  'CBCT',
  'Dental X-ray',
  'Handheld',
]

export default function SPOnboardingPage() {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const router = useRouter()

  const [companyName, setCompanyName] = useState('')
  const [primaryState, setPrimaryState] = useState('')
  const [bypassSpecialties, setBypassSpecialties] = useState(false)
  const [statesServed, setStatesServed] = useState<string[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
    })
  }, [router])

  const toggleState = (s: string) => setStatesServed(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  const toggleSpecialty = (s: string) => setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const handleComplete = async () => {
    setSaving(true)
    const res = await fetch('/api/onboarding/sp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName, primaryState, statesServed,
        specialties: bypassSpecialties ? [] : specialties,
        contactName, contactPhone,
        bypass_specialties: bypassSpecialties,
      })
    })
    const result = await res.json()
    if (res.ok) { setReferralCode(result.referral_code); setStep(5) }
    else { alert(result.error || 'Error completing setup') }
    setSaving(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', height: '40px', border: '1px solid #c2ddf0', borderRadius: '8px',
    padding: '0 12px', fontSize: '13px', color: '#0d2d5e', background: '#fff',
    outline: 'none', boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: '500', color: '#4a6d8c',
    marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.07em',
  }

  const totalSteps = bypassSpecialties ? 3 : 4
  const currentDisplay = step <= 2 ? step : bypassSpecialties ? step - 1 : step

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>The Radiology Coach · ComplianceOS</span>
        <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', marginLeft: '12px' }}>Dealer / Service Provider Setup</span>
      </nav>

      <div style={{ maxWidth: '580px', margin: '0 auto', padding: '48px 24px' }}>

        {step < 5 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: (i + 1) <= currentDisplay ? '#2d6a4f' : '#b8e8cc' }} />
              ))}
            </div>
            <p style={{ fontSize: '12px', color: '#a8a39c', marginBottom: '4px' }}>Step {currentDisplay} of {totalSteps}</p>
            <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#0d2d5e' }}>
              {step === 1 && 'Your company'}
              {step === 2 && 'States you serve'}
              {step === 3 && !bypassSpecialties && 'Equipment specialties'}
              {(step === 4 || (step === 3 && bypassSpecialties)) && 'Primary contact'}
            </h1>
          </div>
        )}

        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '16px', padding: '28px' }}>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={lbl}>Company name *</label>
                <input style={inp} type="text" placeholder="e.g. Layton X-ray" value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Primary state (where your business is based)</label>
                <select style={inp} value={primaryState} onChange={e => setPrimaryState(e.target.value)}>
                  <option value="">Select state</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', border: `1px solid ${bypassSpecialties ? '#2d6a4f' : '#dce8f5'}`, borderRadius: '8px', cursor: 'pointer', background: bypassSpecialties ? '#edfaf3' : '#fafcff' }}>
                <input type="checkbox" checked={bypassSpecialties} onChange={e => setBypassSpecialties(e.target.checked)} style={{ accentColor: '#2d6a4f', width: '15px', height: '15px', marginTop: '1px', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: '0 0 2px' }}>I&apos;m a physicist or referral partner</p>
                  <p style={{ fontSize: '12px', color: '#827d76', margin: 0 }}>Skip equipment specialties — I provide physics services or refer clients without directly servicing equipment.</p>
                </div>
              </label>
              <button onClick={() => setStep(2)} disabled={!companyName || !primaryState}
                style={{ height: '42px', background: (!companyName || !primaryState) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: (!companyName || !primaryState) ? 'default' : 'pointer', marginTop: '4px' }}>
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: '#4a6d8c', margin: 0 }}>Select all states where you work with clients.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', maxHeight: '320px', overflowY: 'auto' }}>
                {US_STATES.map(s => (
                  <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 6px', border: `1px solid ${statesServed.includes(s) ? '#2d6a4f' : '#dce8f5'}`, borderRadius: '6px', cursor: 'pointer', background: statesServed.includes(s) ? '#edfaf3' : '#fff', fontSize: '12px', color: '#0d2d5e' }}>
                    <input type="checkbox" checked={statesServed.includes(s)} onChange={() => toggleState(s)} style={{ accentColor: '#2d6a4f', width: '12px', height: '12px' }} />
                    {s}
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, height: '40px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Back</button>
                <button onClick={() => setStep(bypassSpecialties ? 4 : 3)} disabled={statesServed.length === 0}
                  style={{ flex: 2, height: '40px', background: statesServed.length === 0 ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: statesServed.length === 0 ? 'default' : 'pointer' }}>
                  Continue — {statesServed.length} state{statesServed.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}

          {step === 3 && !bypassSpecialties && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: '#4a6d8c', margin: 0 }}>Select the modalities you install or service.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {SPECIALTIES.map(s => (
                  <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: `1px solid ${specialties.includes(s) ? '#2d6a4f' : '#dce8f5'}`, borderRadius: '8px', cursor: 'pointer', background: specialties.includes(s) ? '#edfaf3' : '#fff' }}>
                    <input type="checkbox" checked={specialties.includes(s)} onChange={() => toggleSpecialty(s)} style={{ accentColor: '#2d6a4f', width: '15px', height: '15px' }} />
                    <span style={{ fontSize: '13px', color: '#0d2d5e', fontWeight: specialties.includes(s) ? '500' : '400' }}>{s}</span>
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, height: '40px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Back</button>
                <button onClick={() => setStep(4)} disabled={specialties.length === 0}
                  style={{ flex: 2, height: '40px', background: specialties.length === 0 ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: specialties.length === 0 ? 'default' : 'pointer' }}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {(step === 4 || (step === 3 && bypassSpecialties)) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={lbl}>Primary contact name</label>
                <input style={inp} type="text" placeholder="Your name" value={contactName} onChange={e => setContactName(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Phone number</label>
                <input style={inp} type="tel" placeholder="Your business phone" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
              </div>
              <div style={{ background: '#f4f7fb', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#4a6d8c', lineHeight: '1.6' }}>
                After setup you&apos;ll receive a unique <strong>referral link</strong> to share with your clinic clients. When they sign up through your link, they appear in your Client Facilities dashboard.
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setStep(bypassSpecialties ? 2 : 3)} style={{ flex: 1, height: '42px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Back</button>
                <button onClick={handleComplete} disabled={saving}
                  style={{ flex: 2, height: '42px', background: saving ? '#c2ddf0' : '#2d6a4f', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: saving ? 'default' : 'pointer' }}>
                  {saving ? 'Setting up...' : 'Complete setup'}
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h2 style={{ fontSize: '22px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>Welcome to ComplianceOS!</h2>
              <p style={{ fontSize: '13px', color: '#4a6d8c', marginBottom: '24px', lineHeight: '1.65' }}>
                Your account is set up. Here&apos;s your referral link — send this directly to your clinic clients.
              </p>
              <div style={{ background: '#edfaf3', border: '2px solid #2d6a4f', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: '500', color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Your referral link</p>
                <p style={{ fontSize: '13px', color: '#0d2d5e', wordBreak: 'break-all', margin: '0 0 12px', fontFamily: 'monospace' }}>
                  app.theradiologycoach.com/signup?ref={referralCode}
                </p>
                <p style={{ fontSize: '11px', color: '#4a6d8c', margin: 0 }}>
                  When a clinic clicks this link and signs up, they&apos;re automatically linked to your account.
                </p>
              </div>
              <button onClick={() => router.push('/dashboard')}
                style={{ width: '100%', height: '44px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                Go to my dashboard →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}