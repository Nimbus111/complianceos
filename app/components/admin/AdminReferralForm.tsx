'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminReferralForm() {
  const [dealers, setDealers] = useState<any[]>([])
  const [clinics, setClinics] = useState<any[]>([])
  const [dealerId, setDealerId] = useState('')
  const [clinicId, setClinicId] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const lbl = { fontSize: '12px', fontWeight: '500', color: '#827d76', display: 'block', marginBottom: '4px' } as const
  const inp = { width: '100%', padding: '8px 12px', border: '1px solid #e8e6e2', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' as const }

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: spOrgs } = await supabase
        .from('organizations')
        .select('id, name, referral_code')
        .eq('org_type', 'service_provider')
        .order('name')
      const { data: facilityOrgs } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('org_type', 'facility')
        .order('name')
      setDealers(spOrgs || [])
      setClinics(facilityOrgs || [])
    }
    load()
  }, [])

  const handleSubmit = async () => {
    if (!dealerId || !clinicId) { alert('Please select both a dealer and a clinic'); return }
    if (dealerId === clinicId) { alert('Dealer and clinic cannot be the same organization'); return }
    setLoading(true); setMsg('')
    const supabase = createClient()
    const dealer = dealers.find(d => d.id === dealerId)
    const { error } = await supabase.from('referrals').insert({
      referring_org_id: dealerId,
      referred_org_id: clinicId,
      referral_code: dealer?.referral_code || '',
      status: 'active'
    })
    if (error) { alert(error.message) }
    else {
      const clinic = clinics.find(c => c.id === clinicId)
      setMsg(`✓ Referral created — ${dealer?.name} → ${clinic?.name}`)
      setDealerId(''); setClinicId('')
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e8e6e2', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6b46c1' }} />
        <h3 style={{ fontSize: '15px', fontWeight: '500', margin: 0 }}>Create Referral</h3>
      </div>
      <p style={{ fontSize: '13px', color: '#827d76', margin: '0 0 16px' }}>
        Manually link a clinic to a dealer as a referral — no link required.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={lbl}>Referring Dealer *</label>
          <select style={inp} value={dealerId} onChange={e => setDealerId(e.target.value)}>
            <option value="">Select dealer...</option>
            {dealers.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={lbl}>Referred Clinic *</label>
          <select style={inp} value={clinicId} onChange={e => setClinicId(e.target.value)}>
            <option value="">Select clinic...</option>
            {clinics.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <button onClick={handleSubmit} disabled={loading}
        style={{ padding: '9px 20px', background: '#6b46c1', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {loading ? 'Creating...' : 'Create Referral'}
      </button>
      {msg && <p style={{ fontSize: '13px', color: '#2d6a4f', marginTop: '12px', margin: '12px 0 0' }}>{msg}</p>}
    </div>
  )
}