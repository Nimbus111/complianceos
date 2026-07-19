import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SubscribeButton from '../components/SubscribeButton'

export default async function SubscribePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) redirect('/onboarding')

  const { data: org } = await supabase
    .from('organizations').select('name, org_type').eq('id', profile.org_id).single()

  const isSP = org?.org_type === 'service_provider'
  const price = isSP ? '$149' : '$49'
  const plan = isSP ? 'service_provider' : 'facility'
  const tierName = isSP ? 'Dealer / Service Provider' : 'Professional'

  const features = isSP ? [
    'State registration tracking with SP state rules',
    'Client facilities dashboard',
    'Quarterly state installation reports',
    'Revenue and 60% commission tracking',
    'Compliance calendar and document repository',
  ] : [
    'Required Actions checklist and compliance ring',
    'AI compliance assistant — state-specific answers',
    'RSP builder — generate your Radiation Protection Program',
    'State Compliance Guide and federal requirements',
    'Compliance calendar, document repository, equipment inventory',
  ]

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', marginLeft: '10px' }}>ComplianceOS</span>
        </div>
        <a href="/login" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>Sign out</a>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: '440px', width: '100%' }}>

          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛡️</div>
            <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>
              One step away, {org?.name || 'welcome'}
            </h1>
            <p style={{ fontSize: '14px', color: '#827d76', lineHeight: '1.65' }}>
              Start your 14-day free trial to access your ComplianceOS dashboard. No charge until your trial ends — cancel anytime.
            </p>
          </div>

          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eef3fb' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '500', color: '#a8a39c', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '4px' }}>{tierName}</p>
                <p style={{ fontSize: '22px', fontWeight: '500', color: '#0d2d5e' }}>{price}<span style={{ fontSize: '13px', color: '#a8a39c', fontWeight: '400' }}>/month</span></p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontWeight: '500', color: '#2d6a4f', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '20px', padding: '3px 10px' }}>14 days free</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {features.map(f => (
                <div key={f} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#2d6a4f', fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✓</span>
                  <p style={{ fontSize: '13px', color: '#1e1c1a', lineHeight: '1.5', margin: 0 }}>{f}</p>
                </div>
              ))}
            </div>

            <SubscribeButton plan={plan} />
          </div>

          <p style={{ fontSize: '12px', color: '#a8a39c', textAlign: 'center', lineHeight: '1.6' }}>
            By subscribing you agree to our terms of service. Your card will be charged {price}/month after your 14-day trial unless you cancel.
          </p>

        </div>
      </div>
    </div>
  )
}