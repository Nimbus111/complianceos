'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const COMMISSION_RATE = 0.15
const FACILITY_PRICE = 49

export default function RevenuePage() {
  const [org, setOrg] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchAll = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) { router.push('/onboarding'); return }
    const { data: orgData } = await supabase.from('organizations').select('*').eq('id', profile.org_id).single()
    setOrg(orgData)
    const { data: clientData } = await supabase
      .from('client_facilities')
      .select('*, facility:facility_org_id(name, facility_state)')
      .eq('sp_org_id', profile.org_id)
    setClients(clientData || [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  const clientCount = clients.length
  const monthlyCommission = clientCount * FACILITY_PRICE * COMMISSION_RATE
  const annualCommission = monthlyCommission * 12

  if (loading) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#a8a39c' }}>Loading revenue...</p>
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
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>Revenue</h1>
          <p style={{ fontSize: '13px', color: '#827d76' }}>{org?.name} · Referral commissions and earning summary</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'Referred facilities', value: String(clientCount), color: '#0d2d5e', sub: 'Using your referral code' },
            { label: 'Monthly commission', value: `$${monthlyCommission.toFixed(2)}`, color: clientCount > 0 ? '#2d6a4f' : '#a8a39c', sub: `${COMMISSION_RATE * 100}% of $${FACILITY_PRICE}/mo per facility` },
            { label: 'Annual earning rate', value: `$${annualCommission.toFixed(2)}`, color: clientCount > 0 ? '#2d6a4f' : '#a8a39c', sub: 'At current referral count' },
          ].map(m => (
            <div key={m.label} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '11px', color: '#a8a39c', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{m.label}</p>
              <p style={{ fontSize: '26px', fontWeight: '500', color: m.color, marginBottom: '4px' }}>{m.value}</p>
              <p style={{ fontSize: '11px', color: '#a8a39c' }}>{m.sub}</p>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '12px' }}>How commissions work</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { step: '1', text: `Share your referral code (${org?.referral_code}) with your clinic clients when recommending ComplianceOS.` },
              { step: '2', text: 'When a facility signs up and enters your code, they are permanently linked to your account.' },
              { step: '3', text: `You earn ${COMMISSION_RATE * 100}% of their monthly subscription — $${(FACILITY_PRICE * COMMISSION_RATE).toFixed(2)} per facility per month — as long as they remain subscribed.` },
              { step: '4', text: 'Commissions are calculated monthly and paid to your account on the 15th of each month once your account is verified.' },
            ].map(item => (
              <div key={item.step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e8f3fb', border: '1px solid #c2ddf0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px', fontWeight: '500', color: '#1a5fa8' }}>
                  {item.step}
                </div>
                <p style={{ fontSize: '13px', color: '#1e1c1a', lineHeight: '1.65', margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {clientCount > 0 ? (
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '20px 24px' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '14px' }}>
              Your referred facilities ({clientCount})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {clients.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f4f7fb', borderRadius: '8px' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>{c.facility?.name || 'Unknown facility'}</p>
                    <p style={{ fontSize: '11px', color: '#a8a39c', margin: 0 }}>{c.facility?.facility_state}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#2d6a4f', margin: 0 }}>+${(FACILITY_PRICE * COMMISSION_RATE).toFixed(2)}/mo</p>
                    <p style={{ fontSize: '11px', color: '#a8a39c', margin: 0 }}>Commission</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '12px', padding: '20px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#2d6a4f', marginBottom: '8px' }}>Start earning today</p>
            <p style={{ fontSize: '13px', color: '#2d6a4f', lineHeight: '1.65', maxWidth: '420px', margin: '0 auto 16px' }}>
              Share your referral code <strong>{org?.referral_code}</strong> with your clinic clients. Each facility that subscribes earns you <strong>${(FACILITY_PRICE * COMMISSION_RATE).toFixed(2)} per month</strong> in commissions.
            </p>
            <a href="/dashboard/clients" style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', textDecoration: 'none' }}>
              View client facilities →
            </a>
          </div>
        )}

      </div>
    </div>
  )
}