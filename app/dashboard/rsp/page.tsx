'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RSPBuilderPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [equipment, setEquipment] = useState<any[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const router = useRouter()

  const [facilityName, setFacilityName] = useState('')
  const [facilityType, setFacilityType] = useState('')
  const [facilityState, setFacilityState] = useState('')
  const [rsoName, setRsoName] = useState('')
  const [rsoEmail, setRsoEmail] = useState('')
  const [rsoPhone, setRsoPhone] = useState('')
  const [backupRsoName, setBackupRsoName] = useState('')
  const [backupRsoPhone, setBackupRsoPhone] = useState('')
  const [dealerName, setDealerName] = useState('')
  const [dealerPhone, setDealerPhone] = useState('')
  const [dosimetry, setDosimetry] = useState(false)
  const [dosimetryProvider, setDosimetryProvider] = useState('')
  const [dosimetryFrequency, setDosimetryFrequency] = useState('monthly')
  const [trainingFrequency, setTrainingFrequency] = useState('Annual')
  const [apronInspectionFreq, setApronInspectionFreq] = useState('annually')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase
        .from('profiles').select('org_id').eq('id', user.id).single()
      if (!profile?.org_id) { router.push('/onboarding'); return }

      const { data: org } = await supabase
        .from('organizations').select('*').eq('id', profile.org_id).single()
      if (org) {
        setFacilityName(org.name || '')
        setFacilityType(org.facility_type_name || '')
        setFacilityState(org.facility_state || '')
        setRsoName(org.rso_name || '')
        setRsoEmail(org.rso_email || '')
        setRsoPhone(org.rso_phone || '')
      }

      const { data: eq } = await supabase
        .from('equipment').select('*')
        .eq('org_id', profile.org_id).eq('status', 'active')
      if (eq) { setEquipment(eq); setSelectedEquipment(eq.map((e: any) => e.id)) }
      setLoading(false)
    })
  }, [router])

  const handleGenerate = async () => {
    setSaving(true)
    const res = await fetch('/api/rsp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facilityName, facilityType, facilityState,
        rsoName, rsoEmail, rsoPhone,
        backupRsoName, backupRsoPhone,
        equipment: equipment.filter(e => selectedEquipment.includes(e.id)),
        dealerName, dealerPhone,
        dosimetry, dosimetryProvider, dosimetryFrequency,
        trainingFrequency, apronInspectionFreq,
      })
    })
    const result = await res.json()
    if (res.ok) {
      router.push('/dashboard/documents')
    } else {
      alert(result.error || 'Error generating RPP')
      setSaving(false)
    }
  }

  const inp = { width: '100%', height: '38px', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '0 10px', fontSize: '13px', color: '#0d2d5e', background: '#fff', outline: 'none', boxSizing: 'border-box' as const }
  const lbl = { display: 'block', fontSize: '10px', fontWeight: '500' as const, color: '#a8a39c', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.07em' }

  if (loading) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f4f7fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#a8a39c', fontSize: '13px' }}>Loading your facility data...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f4f7fb' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '500', marginLeft: '10px' }}>ComplianceOS</span>
        </div>
        <a href="/dashboard" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</a>
      </nav>

      <div style={{ maxWidth: '620px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[1,2,3,4].map(n => (
              <div key={n} style={{ flex: 1, height: '4px', borderRadius: '2px', background: n <= step ? '#0d2d5e' : '#c2ddf0' }} />
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#a8a39c', marginBottom: '4px' }}>Step {step} of 4</p>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>
            {step === 1 && 'Facility and RSO information'}
            {step === 2 && 'Equipment and service provider'}
            {step === 3 && 'Program settings'}
            {step === 4 && 'Review and generate'}
          </h1>
          <p style={{ fontSize: '13px', color: '#827d76' }}>
            {step === 1 && 'Pre-populated from your facility profile — confirm or edit.'}
            {step === 2 && 'Select equipment covered by this RPP.'}
            {step === 3 && 'Configure your dosimetry and training programs.'}
            {step === 4 && 'Your complete RPP is ready — review and generate.'}
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '16px', padding: '28px' }}>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Facility name</label>
                  <input style={inp} value={facilityName} onChange={e => setFacilityName(e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Facility type</label>
                  <input style={inp} value={facilityType} onChange={e => setFacilityType(e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>State</label>
                  <input style={inp} value={facilityState} onChange={e => setFacilityState(e.target.value)} />
                </div>
              </div>
              <div style={{ borderTop: '1px solid #e8f3fb', paddingTop: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: '500', color: '#0d2d5e', marginBottom: '10px' }}>Radiation Safety Officer</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={lbl}>RSO full name</label>
                    <input style={inp} value={rsoName} onChange={e => setRsoName(e.target.value)} />
                  </div>
                  <div>
                    <label style={lbl}>RSO email</label>
                    <input style={inp} type="email" value={rsoEmail} onChange={e => setRsoEmail(e.target.value)} />
                  </div>
                  <div>
                    <label style={lbl}>RSO phone</label>
                    <input style={inp} type="tel" value={rsoPhone} onChange={e => setRsoPhone(e.target.value)} />
                  </div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #e8f3fb', paddingTop: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: '500', color: '#0d2d5e', marginBottom: '10px' }}>Backup RSO <span style={{ color: '#a8a39c', fontWeight: '400' }}>(optional)</span></p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={lbl}>Name</label>
                    <input style={inp} placeholder="Optional" value={backupRsoName} onChange={e => setBackupRsoName(e.target.value)} />
                  </div>
                  <div>
                    <label style={lbl}>Phone</label>
                    <input style={inp} placeholder="Optional" value={backupRsoPhone} onChange={e => setBackupRsoPhone(e.target.value)} />
                  </div>
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!facilityName || !rsoName}
                style={{ height: '42px', background: (!facilityName || !rsoName) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: (!facilityName || !rsoName) ? 'default' : 'pointer', marginTop: '8px' }}>
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e', marginBottom: '10px' }}>
                  X-ray equipment covered by this RPP
                </p>
                {equipment.length === 0 ? (
                  <div style={{ background: '#fff6e8', border: '1px solid #f0d4a0', borderRadius: '8px', padding: '14px', fontSize: '13px', color: '#9a3510' }}>
                    No equipment in your inventory yet.{' '}
                    <a href="/dashboard/equipment" style={{ color: '#9a3510', fontWeight: '500' }}>Add equipment first</a>
                    {' '}— then return here to build your RPP.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {equipment.map(eq => (
                      <label key={eq.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: `1px solid ${selectedEquipment.includes(eq.id) ? '#0d2d5e' : '#c2ddf0'}`, borderRadius: '8px', cursor: 'pointer', background: selectedEquipment.includes(eq.id) ? '#e8f3fb' : '#fff' }}>
                        <input type="checkbox" checked={selectedEquipment.includes(eq.id)}
                          onChange={() => setSelectedEquipment(prev => prev.includes(eq.id) ? prev.filter(id => id !== eq.id) : [...prev, eq.id])}
                          style={{ width: '15px', height: '15px', accentColor: '#0d2d5e' }} />
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>{eq.manufacturer} {eq.model}</p>
                          <p style={{ fontSize: '11px', color: '#a8a39c', margin: 0 }}>
                            {[eq.serial_number && `S/N: ${eq.serial_number}`, eq.room_location].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ borderTop: '1px solid #e8f3fb', paddingTop: '14px' }}>
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e', marginBottom: '10px' }}>
                  X-ray service provider <span style={{ color: '#a8a39c', fontWeight: '400' }}>(optional)</span>
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={lbl}>Company name</label>
                    <input style={inp} placeholder="Service company name" value={dealerName} onChange={e => setDealerName(e.target.value)} />
                  </div>
                  <div>
                    <label style={lbl}>Phone</label>
                    <input style={inp} placeholder="Phone number" value={dealerPhone} onChange={e => setDealerPhone(e.target.value)} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, height: '42px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Back</button>
                <button onClick={() => setStep(3)} style={{ flex: 2, height: '42px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f4f7fb', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: '0 0 2px' }}>Dosimetry monitoring program</p>
                    <p style={{ fontSize: '11px', color: '#827d76', margin: 0 }}>Do occupationally exposed workers wear dosimetry badges?</p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}>
                    <input type="checkbox" checked={dosimetry} onChange={e => setDosimetry(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#0d2d5e' }} />
                    <span style={{ fontSize: '12px', color: '#0d2d5e', fontWeight: '500' }}>Yes</span>
                  </label>
                </div>
                {dosimetry && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                    <div>
                      <label style={lbl}>Dosimetry provider</label>
                      <input style={inp} placeholder="e.g. Landauer, Mirion" value={dosimetryProvider} onChange={e => setDosimetryProvider(e.target.value)} />
                    </div>
                    <div>
                      <label style={lbl}>Exchange frequency</label>
                      <select style={inp} value={dosimetryFrequency} onChange={e => setDosimetryFrequency(e.target.value)}>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={lbl}>Training frequency</label>
                  <select style={inp} value={trainingFrequency} onChange={e => setTrainingFrequency(e.target.value)}>
                    <option value="Annual">Annual</option>
                    <option value="Bi-annual">Bi-annual</option>
                    <option value="Upon hire and annually">Upon hire and annually</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Lead apron inspection frequency</label>
                  <select style={inp} value={apronInspectionFreq} onChange={e => setApronInspectionFreq(e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi-annually">Semi-annually</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, height: '42px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Back</button>
                <button onClick={() => setStep(4)} style={{ flex: 2, height: '42px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Continue</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: 'Facility', value: facilityName },
                  { label: 'Type', value: facilityType },
                  { label: 'State', value: facilityState },
                  { label: 'RSO', value: `${rsoName} · ${rsoEmail}` },
                  { label: 'Equipment', value: `${selectedEquipment.length} unit${selectedEquipment.length !== 1 ? 's' : ''} covered` },
                  { label: 'Dosimetry', value: dosimetry ? `Yes — ${dosimetryProvider || 'provider TBD'} · ${dosimetryFrequency}` : 'Not required' },
                  { label: 'Training', value: trainingFrequency },
                  { label: 'Lead apron inspection', value: apronInspectionFreq.charAt(0).toUpperCase() + apronInspectionFreq.slice(1) },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e8f3fb' }}>
                    <span style={{ fontSize: '11px', color: '#a8a39c', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500' }}>{row.label}</span>
                    <span style={{ fontSize: '12px', color: '#0d2d5e', fontWeight: '500', textAlign: 'right', maxWidth: '65%' }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', fontSize: '12px', color: '#0d2d5e', lineHeight: '1.65' }}>
                Clicking Generate will produce a complete 15-section Radiation Protection Program with your facility data pre-filled throughout — including ALARA program, equipment details, dosimetry policy, pregnant patient protocols, training program, and annual compliance checklist. The document will be saved to your Document Repository.
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(3)} style={{ flex: 1, height: '44px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Back</button>
                <button onClick={handleGenerate} disabled={saving}
                  style={{ flex: 2, height: '44px', background: saving ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: saving ? 'default' : 'pointer' }}>
                  {saving ? 'Generating...' : 'Generate Radiation Protection Program'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
