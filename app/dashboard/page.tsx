import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignOutButton from '../components/SignOutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, org_id, display_name')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed || !profile?.org_id) {
    redirect('/onboarding')
  }

  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.org_id)
    .single()

  const features = [
    { name: 'Compliance calendar', desc: 'Track renewals, inspections, and QA deadlines', border: '#c2ddf0', href: '/dashboard/calendar' },
    { name: 'Document repository', desc: 'Store and organize all compliance documents', border: '#c2ddf0' },
    { name: 'Equipment inventory', desc: 'Track x-ray equipment and PM schedules', border: '#c2ddf0' },
    { name: 'AI assistant', desc: 'Instant answers to state-specific compliance questions', border: '#c4b5fd' },
    { name: 'Keys to Success', desc: 'Step-by-step compliance checklist for your state', border: '#b8e8cc' },
    { name: 'RSP builder', desc: 'Generate your full Radiation Protection Program', border: '#c2ddf0' },
  ]

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f4f7fb' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '500', marginLeft: '10px' }}>ComplianceOS</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: '#8bb4d4', fontSize: '13px' }}>{user.email}</span>
          <SignOutButton />
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>
            {org?.name || 'Your facility'}
          </h1>
          <p style={{ fontSize: '13px', color: '#827d76' }}>
            {[org?.facility_type_name, org?.facility_state, ...(org?.modality_names || [])].filter(Boolean).join(' · ')}
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '20px 24px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e8f3fb', border: '3px solid #c2ddf0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '15px', fontWeight: '500', color: '#1a5fa8' }}>0%</span>
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>
              Compliance score
            </p>
            <p style={{ fontSize: '13px', color: '#827d76', lineHeight: '1.55' }}>
              Your account is set up. Complete each section to build toward Inspection Ready (90%+).
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
         {features.map(f => (
  f.href ? (
    <a key={f.name} href={f.href} style={{ textDecoration: 'none' }}>
      <div style={{ background: '#fff', border: `1px solid ${f.border}`, borderRadius: '12px', padding: '20px', cursor: 'pointer' }}>
        <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>{f.name}</p>
        <p style={{ fontSize: '12px', color: '#827d76', lineHeight: '1.55', marginBottom: '16px' }}>{f.desc}</p>
        <span style={{ background: '#e8f3fb', color: '#0d2d5e', fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', border: '1px solid #c2ddf0' }}>Open →</span>
      </div>
    </a>
  ) : (
    <div key={f.name} style={{ background: '#fff', border: `1px solid ${f.border}`, borderRadius: '12px', padding: '20px' }}>
      <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>{f.name}</p>
      <p style={{ fontSize: '12px', color: '#827d76', lineHeight: '1.55', marginBottom: '16px' }}>{f.desc}</p>
      <span style={{ background: '#f4f7fb', color: '#a8a39c', fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', border: '1px solid #e8e6e2' }}>Coming soon</span>
    </div>
  )
))}
        </div>
      </div>
    </div>
  )
}