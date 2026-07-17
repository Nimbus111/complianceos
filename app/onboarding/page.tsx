'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

const FACILITY_TYPES = [
  'Dental Office','Podiatry Clinic','Chiropractic Clinic','Imaging Center',
  'Hospital','Urgent Care Center','Medical Clinic','Surgery Center',
  'Pain Medicine','Veterinary Clinic','Other',
]

const MODALITY_OPTIONS = [
  'General Radiography','C-arm Fluoroscopy','Mobile X-ray',
  'Portable/Handheld X-ray','CT','CBCT','Fluoroscopy',
  'Panoramic','Dental Intraoral','Mammography','Bone Densitometry',
]

function OnboardingForm() {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const [facilityName, setFacilityName] = useState('')
  const [facilityType, setFacilityType] = useState('')
  const [facilityState, setFacilityState] = useState('')
  const [selectedModalities, setSelectedModalities] = useState<string[]>([])
  const [rsoName, setRsoName] = useState('')
  const [rsoEmail, setRsoEmail] = useState('')
  const [rsoPhone, setRsoPhone] = useState('')
  const [referralCode, setReferralCode] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
    })
  }, [router])

  useEffect(() => {
  const supabase = createClient()
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (user?.user_metadata?.account_type === 'service_provider') {
      router.push('/onboarding/sp')
    }
  })
}, [router])
    

  const toggleModality = (m: string) => {
    setSelectedModalities(prev =>
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    )
  }

  const handleComplete = async () => {
    setSaving(true)
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facilityName,
        facilityType,
        facilityState,
        modalities: selectedModalities,
        rsoName,
        rsoEmail,
        rsoPhone,
        referral_code: referralCode.trim().toUpperCase() || null,
      })
    })
    const result = await res.json()
    if (res.ok) {
      router.push('/dashboard')
    } else {
      alert(result.error || 'Error completing setup')
      setSaving(false)
    }
  }

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
    'West Virginia','Wisconsin','Wyoming','District of Columbia',
  ]

  const inp: React.CSSProperties = {
    width: '100%', height: '40px', border: '1px solid #c2ddf0',
    borderRadius: '8px', padding: '0 12px', fontSize: '13px',
    color: '#0d2d5e', background: '#fff', outline: 'none', boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: '500',
    color: '#4a6d8c', marginBottom: '5px',
    textTransform: 'uppercase', letterSpacing: '0.07em',
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>The Radiology Coach · ComplianceOS</span>
        <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', marginLeft: '12px' }}>Account Setup</span>
      </nav>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 24px' }}>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {[1,2,3,4].map(n => (
              <div key={n} style={{ flex: 1, height: '4px', borderRadius: '2px', background: n <= step ? '#0d2d5e' : '#c2ddf0' }} />
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#a8a39c', marginBottom: '4px' }}>Step {step} of 4</p>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#0d2d5e' }}>
            {step === 1 && 'Your facility'}
            {step === 2 && 'Imaging modalities'}
            {step === 3 && 'Radiation Safety Officer'}
            {step === 4 && 'Review & create account'}
          </h1>
        </div>

        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '16px', padding: '28px' }}>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={lbl}>Facility name *</label>
                <input style={inp} type="text" placeholder="e.g. Sunrise Dental" value={facilityName} onChange={e => setFacilityName(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Facility type *</label>
                <select style={inp} value={facilityType} onChange={e => setFacilityType(e.target.value)}>
                  <option value="">Select type</option>
                  {FACILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>State *</label>
                <select style={inp} value={facilityState} onChange={e => setFacilityState(e.target.value)}>
                  <option value="">Select state</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={() => setStep(2)} disabled={!facilityName || !facilityType || !facilityState}
                style={{ height: '42px', background: (!facilityName || !facilityType || !facilityState) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: (!facilityName || !facilityType || !facilityState) ? 'default' : 'pointer', marginTop: '4px' }}>
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: '#4a6d8c', margin: 0 }}>Select all modalities used at your facility.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {MODALITY_OPTIONS.map(m => (
                  <label key={m} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: `1px solid ${selectedModalities.includes(m) ? '#0d2d5e' : '#dce8f5'}`, borderRadius: '8px', cursor: 'pointer', background: selectedModalities.includes(m) ? '#e8f3fb' : '#fff' }}>
                    <input type="checkbox" checked={selectedModalities.includes(m)} onChange={() => toggleModality(m)} style={{ accentColor: '#0d2d5e', width: '15px', height: '15px' }} />
                    <span style={{ fontSize: '13px', color: '#0d2d5e', fontWeight: selectedModalities.includes(m) ? '500' : '400' }}>{m}</span>
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, height: '40px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Back</button>
                <button onClick={() => setStep(3)} disabled={selectedModalities.length === 0}
                  style={{ flex: 2, height: '40px', background: selectedModalities.length === 0 ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: selectedModalities.length === 0 ? 'default' : 'pointer' }}>
                  Continue — {selectedModalities.length} selected
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: '#4a6d8c', margin: 0 }}>
                The RSO is responsible for radiation safety oversight at your facility.
              </p>
              <div>
                <label style={lbl}>RSO name *</label>
                <input style={inp} type="text" placeholder="Full name" value={rsoName} onChange={e => setRsoName(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>RSO email *</label>
                <input style={inp} type="email" placeholder="rso@facility.com" value={rsoEmail} onChange={e => setRsoEmail(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>RSO phone</label>
                <input style={inp} type="tel" placeholder="(optional)" value={rsoPhone} onChange={e => setRsoPhone(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, height: '40px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Back</button>
                <button onClick={() => setStep(4)} disabled={!rsoName || !rsoEmail}
                  style={{ flex: 2, height: '40px', background: (!rsoName || !rsoEmail) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: (!rsoName || !rsoEmail) ? 'default' : 'pointer' }}>
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f4f7fb', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  ['Facility', facilityName],
                  ['Type', facilityType],
                  ['State', facilityState],
                  ['Modalities', selectedModalities.join(', ')],
                  ['RSO', rsoName],
                  ['RSO email', rsoEmail],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#a8a39c', flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: '12px', color: '#0d2d5e', fontWeight: '500', textAlign: 'right' }}>{value}</span>
                  </div>
                ))}
              </div>

              <div>
                <label style={lbl}>Dealer / Service Provider referral code <span style={{ color: '#a8a39c', fontWeight: '400', textTransform: 'none' }}>(optional)</span></label>
                <input style={inp} type="text" placeholder="e.g. LAYT-X7K2" value={referralCode} onChange={e => setReferralCode(e.target.value.toUpperCase())} />
                <p style={{ fontSize: '11px', color: '#a8a39c', marginTop: '4px' }}>
                  If your x-ray dealer or service provider recommended ComplianceOS, enter their code here.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setStep(3)} style={{ flex: 1, height: '42px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Back</button>
                <button onClick={handleComplete} disabled={saving}
                  style={{ flex: 2, height: '42px', background: saving ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: saving ? 'default' : 'pointer' }}>
                  {saving ? 'Creating account...' : 'Create my account →'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#a8a39c' }}>Loading...</p>
      </div>
    }>
      <OnboardingForm />
    </Suspense>
  )
}