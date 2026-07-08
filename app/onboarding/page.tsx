'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

const FACILITY_TYPES = [
  'Dental','Podiatry','Chiropractic','Imaging Center',
  'Physician Office','Urgent Care','Veterinary','Hospital','Other'
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [facilityName, setFacilityName] = useState('')
  const [facilityType, setFacilityType] = useState('')
  const [facilityState, setFacilityState] = useState('')
  const [selectedModalities, setSelectedModalities] = useState<string[]>([])
  const [modalities, setModalities] = useState<any[]>([])
  const [rsoName, setRsoName] = useState('')
  const [rsoEmail, setRsoEmail] = useState('')
  const [rsoPhone, setRsoPhone] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase
        .from('profiles').select('onboarding_completed').eq('id', user.id).single()
      if (profile?.onboarding_completed) router.push('/dashboard')
    })
    supabase.from('modalities').select('*').order('sort_order').then(({ data }) => {
      if (data) setModalities(data)
    })
  }, [])

  const toggleModality = (name: string) => {
    setSelectedModalities(prev =>
      prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
    )
  }

  const handleComplete = async () => {
  setLoading(true)
  setError('')

  try {
    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facilityName,
        facilityType,
        facilityState,
        selectedModalities,
        rsoName,
        rsoEmail,
        rsoPhone,
      })
    })

    const result = await response.json()

    if (!response.ok) {
      setError(result.error || 'Something went wrong')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  } catch (e: any) {
    setError(e.message)
    setLoading(false)
  }
}

  const inputStyle = { width: '100%', height: '42px', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '0 12px', fontSize: '14px', color: '#0d2d5e', background: '#fff', outline: 'none', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: '500' as const, color: '#a8a39c', marginBottom: '6px', textTransform: 'uppercase' as const, letterSpacing: '0.07em' }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f4f7fb' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
        <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '500', marginLeft: '10px' }}>ComplianceOS</span>
      </nav>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[1,2,3,4].map(n => (
              <div key={n} style={{ flex: 1, height: '4px', borderRadius: '2px', background: n <= step ? '#0d2d5e' : '#c2ddf0' }} />
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#a8a39c', marginBottom: '4px' }}>Step {step} of 4</p>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#0d2d5e' }}>
            {step === 1 && 'Tell us about your facility'}
            {step === 2 && 'Which modalities do you operate?'}
            {step === 3 && 'RSO information'}
            {step === 4 && 'Review and finish'}
          </h1>
        </div>

        <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '16px', padding: '28px' }}>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Facility name</label>
                <input style={inputStyle} type="text" placeholder="e.g. Sunrise Dental" value={facilityName} onChange={e => setFacilityName(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Facility type</label>
                <select style={inputStyle} value={facilityType} onChange={e => setFacilityType(e.target.value)}>
                  <option value="">Select type</option>
                  {FACILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>State</label>
                <select style={inputStyle} value={facilityState} onChange={e => setFacilityState(e.target.value)}>
                  <option value="">Select state</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!facilityName || !facilityType || !facilityState}
                style={{ height: '44px', background: (!facilityName || !facilityType || !facilityState) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: (!facilityName || !facilityType || !facilityState) ? 'default' : 'pointer', marginTop: '8px' }}
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <p style={{ fontSize: '13px', color: '#827d76', marginBottom: '16px' }}>Select all that apply</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {modalities.map(m => (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: `1px solid ${selectedModalities.includes(m.modality_name) ? '#0d2d5e' : '#c2ddf0'}`, borderRadius: '8px', cursor: 'pointer', background: selectedModalities.includes(m.modality_name) ? '#e8f3fb' : '#fff' }}>
                    <input
                      type="checkbox"
                      checked={selectedModalities.includes(m.modality_name)}
                      onChange={() => toggleModality(m.modality_name)}
                      style={{ width: '16px', height: '16px', accentColor: '#0d2d5e' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e' }}>{m.modality_name}</span>
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, height: '44px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>Back</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={selectedModalities.length === 0}
                  style={{ flex: 2, height: '44px', background: selectedModalities.length === 0 ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: selectedModalities.length === 0 ? 'default' : 'pointer' }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', color: '#827d76', marginTop: '-8px' }}>The Radiation Safety Officer responsible for compliance at this facility.</p>
              <div>
                <label style={labelStyle}>RSO full name</label>
                <input style={inputStyle} type="text" placeholder="e.g. Dr. Sarah Johnson" value={rsoName} onChange={e => setRsoName(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>RSO email</label>
                <input style={inputStyle} type="email" placeholder="rso@facility.com" value={rsoEmail} onChange={e => setRsoEmail(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>RSO phone</label>
                <input style={inputStyle} type="tel" placeholder="(555) 555-5555" value={rsoPhone} onChange={e => setRsoPhone(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, height: '44px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>Back</button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!rsoName || !rsoEmail}
                  style={{ flex: 2, height: '44px', background: (!rsoName || !rsoEmail) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: (!rsoName || !rsoEmail) ? 'default' : 'pointer' }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  { label: 'Facility', value: facilityName },
                  { label: 'Type', value: facilityType },
                  { label: 'State', value: facilityState },
                  { label: 'Modalities', value: selectedModalities.join(', ') },
                  { label: 'RSO', value: rsoName },
                  { label: 'RSO email', value: rsoEmail },
                  { label: 'RSO phone', value: rsoPhone || '—' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e8f3fb' }}>
                    <span style={{ fontSize: '12px', color: '#a8a39c', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500' }}>{row.label}</span>
                    <span style={{ fontSize: '13px', color: '#0d2d5e', fontWeight: '500', textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ background: '#fefafb', border: '1px solid #f5c6c9', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#931621' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(3)} style={{ flex: 1, height: '44px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>Back</button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  style={{ flex: 2, height: '44px', background: loading ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: loading ? 'default' : 'pointer' }}
                >
                  {loading ? 'Setting up...' : 'Complete setup'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}