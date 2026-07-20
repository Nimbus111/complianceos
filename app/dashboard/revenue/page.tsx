'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const COMMISSION_RATE = 0.60
const FACILITY_PRICE = 49

export default function RevenuePage() {
  const [org, setOrg] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
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
    const { data: paymentData } = await supabase
      .from('partner_revenue')
      .select('*, facility:facility_org_id(name)')
      .eq('sp_org_id', profile.org_id)
      .order('period_start', { ascending: false })
    setPayments(paymentData || [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  const clientCount = clients.length
  const monthlyRate = clientCount * FACILITY_PRICE * COMMISSION_RATE
  const totalEarned = payments.reduce((sum, p) => sum + (p.sp_share_amount || 0), 0)
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.sp_share_amount || 0), 0)
  const paidAmount = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.sp_share_amount || 0), 0)

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
          <p style={{ fontSize: '13px', color: '#827d76' }}>{org?.name} · Referral commissions</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
          {[
            { label: 'Referred facilities', value: String(clientCount), color: '#0d2d5e', sub: 'Active referrals' },
            { label: 'Monthly rate', value: `$${monthlyRate.toFixed(2)}`, color: clientCount > 0 ? '#2d6a4f' : '#a8a39c', sub: `${COMMISSION_RATE * 100}% of $${FACILITY_PRICE}/mo per facility` },
            { label: 'Total earned', value: `$${totalEarned.toFixed(2)}`, color: totalEarned > 0 ? '#2d6a4f' : '#a8a39c', sub: `$${pendingAmount.toFixed(2)} pending · $${paidAmount.toFixed(2)} paid` },
          ].map(m => (
            <div key={m.label} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '11px', color: '#a8a39c', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{m.label}</p>
              <p style={{ fontSize: '26px', fontWeight: '500', color: m.color, marginBottom: '4px' }}>{m.value}</p>
              <p style={{ fontSize: '11px', color: '#a8a39c' }}>{m.sub}</p>
            </div>
          ))}
        </div>

        {payments.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef3fb' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>Payment history</p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f4f7fb' }}>
                  {['Facility', 'Period', 'Invoice', 'Your share', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '500', color: '#827d76', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid #eef3fb' }}>
                    <td style={{ padding: '11px 16px', color: '#0d2d5e', fontWeight: '500' }}>{p.facility?.name || '—'}</td>
                    <td style={{ padding: '11px 16px', color: '#827d76' }}>
                      {p.period_start ? new Date(p.period_start).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '11px 16px', color: '#827d76', fontSize: '11px' }}>${(p.gross_revenue || 0).toFixed(2)}</td>
                    <td style={{ padding: '11px 16px', color: '#2d6a4f', fontWeight: '500' }}>${(p.sp_share_amount || 0).toFixed(2)}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px', color: p.status === 'paid' ? '#2d6a4f' : '#9a3510', background: p.status === 'paid' ? '#edfaf3' : '#fff6e8', border: `1px solid ${p.status === 'paid' ? '#b8e8cc' : '#f0d4a0'}` }}>
                        {p.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '12px' }}>How commissions work</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { step: '1', text: `Share your referral link: app.theradiologycoach.com/signup?ref=${org?.referral_code}` },
              { step: '2', text: 'When a clinic subscribes through your link or selects you as their dealer during signup, they are linked to your account.' },
              { step: '3', text: `You earn ${COMMISSION_RATE * 100}% of their monthly subscription — $${(FACILITY_PRICE * COMMISSION_RATE).toFixed(2)} per facility — recorded here on every payment.` },
              { step: '4', text: 'Commissions marked Pending are calculated and verified. Payments are processed monthly on the 15th once your account is verified.' },
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

        {clientCount > 0 && (
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '20px 24px' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '14px' }}>
              Referred facilities ({clientCount})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {clients.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f4f7fb', borderRadius: '8px' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>{c.facility?.name || 'Unknown facility'}</p>
                    <p style={{ fontSize: '11px', color: '#a8a39c', margin: 0 }}>{c.facility?.facility_state}</p>
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: '#2d6a4f', margin: 0 }}>+${(FACILITY_PRICE * COMMISSION_RATE).toFixed(2)}/mo</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {clientCount === 0 && (
          <div style={{ background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '12px', padding: '20px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#2d6a4f', marginBottom: '8px' }}>Start earning today</p>
            <p style={{ fontSize: '13px', color: '#2d6a4f', lineHeight: '1.65', maxWidth: '420px', margin: '0 auto' }}>
              Share your referral link with your clinic clients. Each facility that subscribes earns you <strong>${(FACILITY_PRICE * COMMISSION_RATE).toFixed(2)} per month</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}