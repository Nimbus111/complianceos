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
  'Dental X-ray', 'General Radiography', 'CBCT / 3D', 'Panoramic',
  'C-arm Fluoroscopy', 'Mobile X-ray', 'CT Scanner', 'Mammography',
  'Portable X-ray', 'Veterinary X-ray', 'Multiple modalities'
]

export default function SPOnboardingPage() {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const router = useRouter()

  const [companyName, setCompanyName] = useState('')
  const [primaryState, setPrimaryState] = useState('')
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
      body: JSON.stringify({ companyName, primaryState, statesServed, specialties, contactName, contactPhone })
    })
    const result = await res.json()
    if (res.ok) {
      setReferralCode(result.referral_code)
      setStep(5)
    } else {
      alert(result.error || 'Error completing setup')
    }
    setSaving(false)
  }

  const inp: React.CSSProperties = { width: '100%', height: '40px', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '0 12px', fontSize: '13px', color: '#0d2d5e', background: '#fff', outline: 'none', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: '500', color: '#4a6d8c', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.07em' }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>The Radiology Coach · ComplianceOS</span>
        <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', marginLeft: '12px' }}>Dealer / Service Provider Setup</span>
      </nav>

      <div style={{ maxWidth: '580px', margin: '0 auto', padding: '48px 24px' }}>

        {step < 5 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[1,2,3,4].map(n => (
                <div key={n} style={{ flex: 1, height: '4px', borderRadius: '2px', background: n <= step ? '#2d6a4f' : '#b8e8cc' }} />
              ))}
            </div>
            <p style={{ fontSize: '12px', color: '#a8a39c', marginBottom: '4px' }}>Step {step} of 4</p>
            <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#0d2d5e' }}>
              {step === 1 && 'Your company'}
              {step === 2 && 'States you serve'}
              {step === 3 && 'Equipment specialties'}
              {step === 4 && 'Primary contact'}
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
              <button onClick={() => setStep(2)} disabled={!companyName || !primaryState}
                style={{ height: '42px', background: (!companyName || !primaryState) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: (!companyName || !primaryState) ? 'default' : 'pointer', marginTop: '8px' }}>
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: '#4a6d8c', margin: 0 }}>Select all states where you install or service equipment.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', maxHeight: '320px', overflowY: 'auto' }}>
                {US_STATES.map(s => (
                  <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 6px', border: `1px solid ${statesServed.includes(s) ? '#2d6a4f' : '#dce8f5'}`, borderRadius: '6px', cursor: 'pointer', background: statesServed.includes(s) ? '#edfaf3' : '#fff', fontSize: '12px', color: '#0d2d5e' }}>
                    <input type="checkbox" checked={statesServed.includes(s)} onChange={() => toggleState(s)} style={{ accentColor: '#2d6a4f', width: '12px', height: '12px' }} />
                    {s}
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, height: '40px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Back</button>
                <button onClick={() => setStep(3)} disabled={statesServed.length === 0}
                  style={{ flex: 2, height: '40px', background: statesServed.length === 0 ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: statesServed.length === 0 ? 'default' : 'pointer' }}>
                  Continue — {statesServed.length} state{statesServed.length !== 1 ? 's' : ''} selected
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
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
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, height: '40px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Back</button>
                <button onClick={() => setStep(4)} disabled={specialties.length === 0}
                  style={{ flex: 2, height: '40px', background: specialties.length === 0 ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: specialties.length === 0 ? 'default' : 'pointer' }}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
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
                After setup you&apos;ll receive a unique <strong>referral code</strong> to share with your clinic clients. When they sign up using your code, they appear in your Client Facilities dashboard and you earn a commission on their subscription.
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setStep(3)} style={{ flex: 1, height: '42px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Back</button>
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
              <h2 style={{ fontSize: '22px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>
                Welcome to ComplianceOS, {contactName || companyName}!
              </h2>
              <p style={{ fontSize: '13px', color: '#4a6d8c', marginBottom: '24px', lineHeight: '1.65' }}>
                Your account is set up. Here&apos;s your unique referral code — share it with your clinic clients when recommending ComplianceOS.
              </p>
              <div style={{ background: '#edfaf3', border: '2px solid #2d6a4f', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: '500', color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Your referral code</p>
                <p style={{ fontSize: '32px', fontWeight: '500', color: '#0d2d5e', letterSpacing: '0.1em', margin: '0' }}>{referralCode}</p>
                <p style={{ fontSize: '12px', color: '#4a6d8c', marginTop: '8px' }}>
                  When a clinic enters this code during signup, they&apos;re linked to your account automatically.
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