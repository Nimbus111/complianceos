import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignOutButton from '../components/SignOutButton'
import UpgradeButton from '../components/UpgradeButton'
import RequiredActions from '../components/RequiredActions'
import BadgesSection from '../components/BadgesSection'

const features = [
  { name: 'Compliance calendar', desc: 'Track renewals, inspections, and QA deadlines', border: '#c2ddf0', href: '/dashboard/calendar' },
  { name: 'Document repository', desc: 'Store and organize all compliance documents', border: '#c2ddf0', href: '/dashboard/documents' },
  { name: 'Equipment inventory', desc: 'Track x-ray equipment and PM schedules', border: '#c2ddf0', href: '/dashboard/equipment' },
  { name: 'Equipment & Systems', desc: 'Service contacts, PACS config, warranties, and support numbers.', border: '#b8e8cc', href: '/dashboard/systems' },
  { name: 'State Compliance Guide', desc: 'Your state\'s x-ray requirements — always accessible from your dashboard.', border: '#c2ddf0', href: '/dashboard/guide' },
  { name: 'AI assistant', desc: 'Instant answers to state-specific compliance questions', border: '#c4b5fd', href: '/dashboard/ai' },
  { name: 'Keys to Success', desc: 'Step-by-step compliance checklist for your state', border: '#b8e8cc', href: '/dashboard/keys' },
  { name: 'RSP builder', desc: 'Generate your full Radiation Protection Program', border: '#c2ddf0', href: '/dashboard/rsp' },
  { name: 'State documents', desc: 'Registration forms, rules, and regulatory documents by state.', border: '#c2ddf0', href: '/dashboard/stateforms' },
  { name: 'Preferred Partners', desc: 'PACS, radiology reading, and compliance equipment partners.', border: '#c2ddf0', href: '/dashboard/partners' },
{ name: 'Video Training', desc: 'Expert tutorials from The Radiology Coach on YouTube.', border: '#c2ddf0', href: '/dashboard/training' },
{ name: 'Account Settings', desc: 'Update your dealer, account info, and preferences.', border: '#c2ddf0', href: '/dashboard/settings' },
{ name: 'X-ray Operators', desc: 'Operator credentials, training records, and CEU tracking.', border: '#b8e8cc' },
]

function SPDashboard({ org, user }: { org: any; user: any }) {
  const spFeatures = [
    { name: 'State Registrations', desc: 'Manage your state x-ray service registration numbers.', border: '#b8e8cc', href: '/dashboard/registrations' },
    { name: 'Client Facilities', desc: 'ComplianceOS accounts linked through your referral code.', border: '#b8e8cc', href: '/dashboard/clients' },
    { name: 'Quarterly Reports', desc: 'Build and track your state installation reports.', border: '#c2ddf0', href: '/dashboard/reports' },
    { name: 'Revenue', desc: 'Track your referral commissions and subscription credits.', border: '#c2ddf0', href: '/dashboard/revenue' },
    { name: 'State documents', desc: 'Registration forms, rules, and regulatory documents.', border: '#c2ddf0', href: '/dashboard/stateforms' },
    { name: 'Compliance calendar', desc: 'Track state reporting deadlines and renewal dates.', border: '#c2ddf0', href: '/dashboard/calendar' },
    { name: 'Document repository', desc: 'Store your company compliance documents.', border: '#c2ddf0', href: '/dashboard/documents' },
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
        <div style={{ background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '10px', padding: '14px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: '500', color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Your referral link</p>
            <p style={{ fontSize: '16px', fontWeight: '500', color: '#0d2d5e', letterSpacing: '0.06em', margin: '0 0 6px' }}>{org.referral_code}</p>
            <p style={{ fontSize: '12px', color: '#2d6a4f', margin: 0 }}>app.theradiologycoach.com/signup?ref={org.referral_code}</p>
          </div>
          <p style={{ fontSize: '12px', color: '#2d6a4f', maxWidth: '320px', margin: 0, lineHeight: '1.6' }}>
            Share this link with your clinic clients. When they sign up, they appear in your Client Facilities list and you earn a commission.
          </p>
        </div>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>{org.name}</h1>
          <p style={{ fontSize: '13px', color: '#827d76' }}>Dealer / Service Provider · {org.facility_state}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {spFeatures.map(f => (
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

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, org_id, display_name')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed || !profile?.org_id) redirect('/onboarding')

  const { data: org } = await supabase
    .from('organizations').select('*').eq('id', profile.org_id).single()

  if (org?.org_type === 'service_provider') {
    return <SPDashboard org={org} user={user} />
  }

  const [
    { data: ktsItems },
    { count: ktsCompleted },
    { data: dealerRaw },
    { data: subscription },
    { data: tasks },
    { data: completions },
    { data: badges },
    { data: userBadges },
  ] = await Promise.all([
    supabase.from('keys_to_success').select('id'),
    supabase.from('compliance_checklists').select('*', { count: 'exact', head: true }).eq('org_id', profile.org_id).eq('completed', true),
    supabase.from('equipment_contacts').select('company_name, contact_name, phone_primary, phone_support, contact_type').eq('org_id', profile.org_id).in('contact_type', ['dealer', 'manufacturer']),
    supabase.from('subscriptions').select('status, current_period_end, cancel_at_period_end').eq('org_id', profile.org_id).single(),
    supabase.from('facility_tasks').select('*').order('sort_order'),
    supabase.from('user_task_completions').select('task_id').eq('org_id', profile.org_id),
    supabase.from('badges').select('*').order('sort_order'),
    supabase.from('user_badges').select('badge_id').eq('org_id', profile.org_id),
  ])

  const ktsPct = ktsItems?.length
    ? Math.round(((ktsCompleted || 0) / ktsItems.length) * 100)
    : 0
  const taskPct = (tasks?.length || 0) > 0
    ? Math.round((completedTaskIds.length / (tasks?.length || 1)) * 100)
    : 0
  const inspectionReady = taskPct === 100

  const panicContact = (dealerRaw as any[])?.find(c => c.contact_type === 'dealer')
    || (dealerRaw as any[])?.[0]
    || (org?.dealer_name ? {
        company_name: org.dealer_name,
        phone_primary: org.dealer_phone,
        phone_support: null,
        contact_name: null,
      } : null)

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  const isTrial = subscription?.status === 'trialing'
  const trialEnd = subscription?.current_period_end ? new Date(subscription.current_period_end) : null
  const daysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null

  const completedTaskIds = (completions || []).map((c: any) => c.task_id)
  const earnedBadgeIds = (userBadges || []).map((b: any) => b.badge_id)

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

        {panicContact ? (
          <div style={{ background: '#fff', border: '1px solid #f0d4a0', borderLeft: '4px solid #c44a1a', borderRadius: '10px', padding: '14px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', background: '#fff6e8', border: '1px solid #f0d4a0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px' }}>📞</div>
              <div>
                <p style={{ fontSize: '10px', fontWeight: '500', color: '#c44a1a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Equipment support</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '1px' }}>{panicContact.company_name || 'Your dealer'}</p>
                {panicContact.contact_name && <p style={{ fontSize: '12px', color: '#827d76', margin: 0 }}>{panicContact.contact_name}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {panicContact.phone_support && (
                <a href={`tel:${panicContact.phone_support}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#c44a1a', color: '#fff', fontSize: '13px', fontWeight: '500', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  📞 Support: {panicContact.phone_support}
                </a>
              )}
              {panicContact.phone_primary && (
                <a href={`tel:${panicContact.phone_primary}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff6e8', color: '#c44a1a', border: '1px solid #f0d4a0', fontSize: '13px', fontWeight: '500', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  Main: {panicContact.phone_primary}
                </a>
              )}
              <a href="/dashboard/systems" style={{ fontSize: '12px', color: '#a8a39c', textDecoration: 'none', whiteSpace: 'nowrap' }}>All contacts →</a>
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff6e8', border: '1px dashed #f0d4a0', borderRadius: '10px', padding: '12px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>📞</span>
            <p style={{ fontSize: '13px', color: '#9a3510', flex: 1, margin: 0 }}>
              Add your dealer&apos;s emergency support number for quick access during equipment issues.
            </p>
            <a href="/dashboard/systems" style={{ fontSize: '12px', fontWeight: '500', color: '#c44a1a', textDecoration: 'none', whiteSpace: 'nowrap' }}>Set up →</a>
          </div>
        )}

        {!isActive && (
          <div style={{ background: '#0d2d5e', borderRadius: '10px', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: '#fff', fontSize: '14px', fontWeight: '500', marginBottom: '3px' }}>Start your 14-day free trial</p>
              <p style={{ color: '#8bb4d4', fontSize: '12px', margin: 0 }}>Full access to all features — no charge until your trial ends. Cancel anytime.</p>
            </div>
            <UpgradeButton />
          </div>
        )}

        {isTrial && daysLeft !== null && (
          <div style={{ background: '#fff6e8', border: '1px solid #f0d4a0', borderRadius: '10px', padding: '12px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '13px', color: '#9a3510', margin: 0 }}>
              <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong> remaining in your free trial.
            </p>
            <a href="/dashboard/billing" style={{ fontSize: '12px', fontWeight: '500', color: '#c44a1a', textDecoration: 'none' }}>Manage subscription →</a>
          </div>
        )}

        <RequiredActions tasks={tasks || []} completedIds={completedTaskIds} />

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>
            {org?.name || 'Your facility'}
          </h1>
          <p style={{ fontSize: '13px', color: '#827d76' }}>
            {[org?.facility_type_name, org?.facility_state, ...(org?.modality_names || [])].filter(Boolean).join(' · ')}
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '20px 24px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e8f3fb', border: `3px solid ${inspectionReady ? '#b8e8cc' : '#c2ddf0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '15px', fontWeight: '500', color: inspectionReady ? '#40916c' : '#1a5fa8' }}>{taskPct}%</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e' }}>Compliance score</p>
              {inspectionReady && (
                <span style={{ fontSize: '11px', fontWeight: '500', color: '#2d6a4f', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '20px', padding: '2px 8px' }}>Inspection Ready</span>
              )}
            </div>
            <p style={{ fontSize: '13px', color: '#827d76', lineHeight: '1.55', marginBottom: '6px' }}>
              {inspectionReady ? 'All required actions complete — your facility is inspection ready.' : `Check off your Required Actions above to build toward 100% — ${8 - completedTaskIds.length} item${8 - completedTaskIds.length !== 1 ? 's' : ''} remaining.`}
            </p>
            <a href="/dashboard/report" style={{ fontSize: '12px', color: '#1a5fa8', fontWeight: '500', textDecoration: 'none' }}>View Inspection Report →</a>
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

        <BadgesSection badges={badges || []} earnedIds={earnedBadgeIds} facilityName={org?.name} />

      </div>
    </div>
  )
}