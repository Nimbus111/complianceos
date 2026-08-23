import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignOutButton from '../components/SignOutButton'
import AcknowledgeButton from '../components/AcknowledgeButton'
import GettingStartedPanel from '../components/GettingStartedPanel'
import ActivityLog from '../components/ActivityLog'
import SPDashboardClient from '../components/SPDashboardClient'
import UpgradeButton from '../components/UpgradeButton'
import RequiredActions from '../components/RequiredActions'
import BadgesSection from '../components/BadgesSection'
import WelcomeModal from '../components/WelcomeModal'
import FeatureCards from '../components/FeatureCards'
import ScrollRestorer from '../components/ScrollRestorer'

 const features = [
    { name: 'State Compliance Guide', section: 'Compliance Essentials', desc: 'Your state\'s x-ray requirements with federal rules.', border: '#b8e8cc', href: '/dashboard/guide' },
    { name: 'Equipment & Safety', section: 'Equipment & Maintenance', desc: 'X-ray equipment, lead protection, and dosimetry monitoring.', border: '#b8e8cc', href: '/dashboard/equipment' },
    { name: 'Equipment QA', section: 'Equipment & Maintenance', desc: 'QA testing procedures, manufacturer schedules, and performance evaluations.', border: '#b8e8cc', href: '/dashboard/equipment-qa' },
    { name: 'X-ray Operators', section: 'Records & Documents', desc: 'Operator credentials, training records, and CEU certificates.', border: '#b8e8cc', href: '/dashboard/operators' },
    { name: 'Document Repository', section: 'Records & Documents', desc: 'Upload and store all compliance documents with expiry tracking.', border: '#c2ddf0', href: '/dashboard/documents' },
    { name: 'RSP Builder', section: 'Compliance Toolkit', desc: 'Generate your Radiation Protection Program. Required in most states.', border: '#c2ddf0', href: '/dashboard/rsp' },
    { name: 'Compliance Calendar', section: 'Compliance Essentials', desc: 'Renewal dates, QA deadlines, and inspection schedules.', border: '#c2ddf0', href: '/dashboard/calendar' },
    { name: 'Inspector Report', section: 'Compliance Essentials', desc: 'Printable compliance summary with your current score.', border: '#c2ddf0', href: '/dashboard/report' },
    { name: 'Technique Charts', section: 'Compliance Toolkit', desc: 'The Last Technique Chart You\'ll Ever Need — download and customize.', border: '#c4b5fd', href: '/dashboard/technique-charts' },
    { name: 'Keys to Success', section: 'Education & Training', desc: '21-step compliance checklist with guidance from The Radiology Coach.', border: '#c4b5fd', href: '/dashboard/keys' },
    { name: 'AI Assistant', section: 'Education & Training', desc: 'Ask any compliance question. State-specific answers in seconds.', border: '#c4b5fd', href: '/dashboard/ai' },
    { name: 'State Documents', section: 'Records & Documents', desc: 'Forms, applications, and regulatory documents from your state agency.', border: '#dce8f5', href: '/dashboard/stateforms' },
    { name: 'Video Training', section: 'Education & Training', desc: 'Expert tutorial videos from The Radiology Coach.', border: '#dce8f5', href: '/dashboard/training' },
    { name: 'Preferred Partners',  section: 'Practice & Support', desc: 'PACS storage, radiology reading, and equipment partners.', border: '#dce8f5', href: '/dashboard/partners' },
    { name: 'Account Settings', section: 'Practice & Support', desc: 'Facility info, dealer contact, and subscription management.', border: '#dce8f5', href: '/dashboard/settings' },
  ]

function SPDashboard({ org, user, forms, rules, states, contacts, fees }: any) {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ background: '#0d2d5e', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="https://static.wixstatic.com/media/487e4d_3b2132b097974e8baf3409ee0c63b7e1~mv2_d_3840_2160_s_2.png" alt="The Radiology Coach" style={{ height: '38px' }} />
          <span style={{ background: 'rgba(255,255,255,0.12)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', letterSpacing: '.06em' }}>SERVICE PROVIDER</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: '#8bb4d4', fontSize: '13px' }}>{org?.name}</span>
          <a href="/dashboard/settings" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>Settings</a>
          <SignOutButton />
        </div>
      </div>
      <div style={{ background: '#fff', borderBottom: '1px solid #dce8f5', padding: '16px 32px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#0d2d5e', margin: 0 }}>Welcome, {org?.name}</h1>
      </div>
      <SPDashboardClient
        forms={forms || []}
        spRules={rules || []}
        states={states || []}
        contacts={contacts || []}
        fees={fees || []}
        revenue={null}
        org={org}
      />
    </div>
  )
}

export default async function DashboardPage({ searchParams }: { searchParams: { site?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, org_id, display_name, onboarding_dismissed')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed || !profile?.org_id) redirect('/onboarding')

  const { data: org } = await supabase
    .from('organizations').select('*').eq('id', profile.org_id).single()

  const { data: subCheck } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('org_id', profile.org_id)
    .single()

  const subActive = subCheck?.status === 'active' || subCheck?.status === 'trialing'
  if (!subActive) redirect('/subscribe')

  if (org?.org_type === 'enterprise' && !searchParams?.site) redirect('/dashboard/enterprise')


  const { data: siteOrg } = org?.org_type === 'enterprise' && searchParams?.site
    ? await supabase.from('organizations').select('*').eq('id', searchParams.site).single()
    : { data: org }

  const activeOrg = siteOrg || org
  const queryOrgId = (org?.org_type === 'enterprise' && searchParams?.site)
    ? searchParams.site
    : profile.org_id

const isSP = org?.org_type === 'service_provider'

  const [spForms, spRules, spStates, spContacts, spFees] = isSP
    ? await Promise.all([
        supabase.from('state_forms').select('*').order('state_name'),
        supabase.from('sp_state_rules').select('*').order('state_name'),
        supabase.from('states_directory').select('*').order('state_name'),
        supabase.from('state_contacts').select('*').order('state_name'),
        supabase.from('fees').select('*').order('state_name'),
         ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }]

    if (org?.org_type === 'service_provider') {
    return <SPDashboard org={org} user={user}
        forms={spForms?.data}
        rules={spRules?.data}
        states={spStates?.data}
        contacts={spContacts?.data}
        fees={spFees?.data} />
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
  { count: equipmentCount },
  { count: qaCount },
  { count: calendarCount },
  { count: rspCount },
      { count: operatorCount },
      { count: docCount },
] = await Promise.all([
    supabase.from('keys_to_success').select('id'),
    supabase.from('compliance_checklists').select('*', { count: 'exact', head: true }).eq('org_id', queryOrgId).eq('completed', true),
    supabase.from('equipment_contacts').select('company_name, contact_name, phone_primary, phone_support, contact_type').eq('org_id', queryOrgId).in('contact_type', ['dealer', 'manufacturer']),
    supabase.from('subscriptions').select('status, current_period_end, cancel_at_period_end').eq('org_id', queryOrgId).single(),
    supabase.from('facility_tasks').select('*').order('sort_order'),
    supabase.from('user_task_completions').select('task_id').eq('org_id', queryOrgId),
    supabase.from('badges').select('*').order('sort_order'),
    supabase.from('user_badges').select('badge_id').eq('org_id', queryOrgId),
     supabase.from('equipment').select('id', { count: 'exact', head: true }).eq('org_id', queryOrgId),
    supabase.from('equipment_qa').select('id', { count: 'exact', head: true }).eq('org_id', queryOrgId),
    supabase.from('compliance_calendar').select('id', { count: 'exact', head: true }).eq('org_id', queryOrgId),
    supabase.from('rsp_programs').select('id', { count: 'exact', head: true }).eq('org_id', queryOrgId),
      supabase.from('xray_operators').select('id', { count: 'exact', head: true }).eq('org_id', queryOrgId),
      supabase.from('documents').select('id', { count: 'exact', head: true }).eq('org_id', queryOrgId),
  ])

  const ktsPct = ktsItems?.length
    ? Math.round(((ktsCompleted || 0) / ktsItems.length) * 100)
    : 0
  
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

  const modalities = (org?.modality_names || []) as string[]
  const { data: regs } = await supabase
    .from('regulations')
    .select('*')
    .eq('state_name', activeOrg?.facility_state || '')
    .or(
      modalities.length > 0
        ? modalities.map((m: string) => `modality_name.ilike.%${m}%`).join(',')
        : 'modality_name.ilike.%%'
    )

  

  const { data: activeNotifications } = await supabase
    .from('enterprise_notifications')
    .select('id, message, created_at')
    .eq('site_org_id', profile.org_id)
    .is('acknowledged_at', null)
    .order('created_at', { ascending: false })
    .limit(1)

  const activeNotification = activeNotifications?.[0] || null

  const now = new Date()
  const monthPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const yearPeriod = String(now.getFullYear())

  const { data: activityCompletions } = await supabase
    .from('site_activity_completions')
    .select('activity_type, period')
    .eq('org_id', profile.org_id)
    .in('period', [monthPeriod, yearPeriod])

  const completedTaskIds = (completions || []).map((c: any) => c.task_id)

  const filteredTasks = (tasks || []).filter((task: any) => {
    if (!task.regulation_column) return true
    if (!regs || regs.length === 0) return true
    return (regs as any[]).some((reg: any) => {
      const val = reg[task.regulation_column]
      if (task.regulation_type === 'text_non_null') {
        if (val === null || val === undefined) return false
        const s = String(val).trim().toLowerCase()
        return s.length > 0 && s !== 'n/a' && s !== 'na' && s !== 'none' && s !== 'not applicable' && s !== 'no'
      }
      return Boolean(val)
    })
  }).map((task: any) => {
    const allMods = (org?.modality_names || []) as string[]
    const applicableRegs = (regs as any[] || []).filter((reg: any) => {
      const val = reg[task.regulation_column]
      if (task.regulation_type === 'text_non_null') {
        if (val === null || val === undefined) return false
        const s = String(val).trim().toLowerCase()
        return s.length > 0 && s !== 'n/a' && s !== 'na' && s !== 'none' && s !== 'not applicable' && s !== 'no'
      }
      return Boolean(val)
    })
    const applicableModalities = [...new Set(
      applicableRegs.map((r: any) => r.modality_name).filter(Boolean)
    )] as string[]
    const universalMods = allMods.filter((m: string) =>
      applicableRegs.some((r: any) =>
        r.modality_name?.toLowerCase().includes(m.toLowerCase())
      )
    )
    const isUniversal = allMods.length === 0 || universalMods.length === allMods.length
    const detailReg = applicableRegs.find((r: any) => task.detail_column && r[task.detail_column])
    return {
      ...task,
      detail_text: task.detail_column && detailReg ? detailReg[task.detail_column] || null : null,
      modality_flags: isUniversal ? [] : applicableModalities,
    }
  })

  const completedFilteredTaskIds = completedTaskIds.filter((id: string) =>
    (filteredTasks as any[]).some((t: any) => t.id === id)
  )
   const nonAdvisoryCount = (tasks || []).filter((t: any) => t.urgency !== 'Advisory').length
  const completedNonAdvisory = completedTaskIds.filter((id: string) =>
    (tasks || []).some((t: any) => t.id === id && t.urgency !== 'Advisory')
  ).length
  const taskPct = nonAdvisoryCount > 0
  ? Math.round((completedNonAdvisory / nonAdvisoryCount) * 100)  
    : 0
  const inspectionReady = taskPct === 100
  const earnedBadgeIds = (userBadges || []).map((b: any) => b.badge_id)

      const activityMap: Record<string, boolean> = {
    'Equipment & Safety': (equipmentCount || 0) > 0,
    'Document Repository': false,
    'Compliance Calendar': (calendarCount || 0) > 0,
    'Keys to Success': (ktsCompleted || 0) > 0,
    'Required Actions': (completions?.length || 0) > 0,
    'State Compliance Guide': !!activeOrg?.facility_state,
    'AI Assistant': false,
    'RSP Builder': false,
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f4f7fb' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '500', marginLeft: '10px' }}>ComplianceOS</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ color: '#8bb4d4', fontSize: '13px' }}>{user.email}</span>
          {searchParams?.site && (
                <a href="/dashboard/enterprise" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>← Portfolio</a>
              )}
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

        {(equipmentCount || 0) > 0 && (qaCount || 0) === 0 && (
              <div style={{ background: '#fff6e8', border: '1px solid #f0d4a0', borderRadius: '10px', padding: '12px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>⚙️</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: '#9a3510', margin: '0 0 2px' }}>Equipment QA procedures not set up</p>
                  <p style={{ fontSize: '12px', color: '#9a3510', margin: 0 }}>You have equipment on file — add your manufacturer-recommended QA procedures to stay inspection ready.</p>
                </div>
                <a href="/dashboard/equipment-qa" style={{ fontSize: '12px', fontWeight: '500', color: '#fff', background: '#9a3510', padding: '6px 14px', borderRadius: '7px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Set up QA →
                </a>
              </div>
            )}
            <ActivityLog completedActivities={activityCompletions || []} />
      <RequiredActions tasks={filteredTasks || []} completedIds={completedFilteredTaskIds} facilityState={activeOrg?.facility_state} />

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>
            {activeOrg?.name || 'Your facility'}
          </h1>
          <p style={{ fontSize: '13px', color: '#827d76' }}>
            {[org?.facility_type_name, activeOrg?.facility_state, ...(org?.modality_names || [])].filter(Boolean).join(' · ')}
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

        <FeatureCards features={features} activityMap={activityMap} />

        <BadgesSection
              badges={badges || []}
              earnedIds={earnedBadgeIds}
              facilityName={activeOrg?.name}
              ktsComplete={(ktsItems?.length || 0) > 0 && ktsCompleted === (ktsItems?.length || 0)}
              techniqueAccessed={org?.technique_chart_accessed || false}
            />
        {searchParams?.site && activeOrg && (
              <div style={{ background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '10px', padding: '10px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '500', color: '#4a6d8c', textTransform: 'uppercase', letterSpacing: '.08em' }}>Viewing site</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e' }}>{activeOrg.name}</span>
                  {activeOrg.facility_state && <span style={{ fontSize: '11px', color: '#8bb4d4', background: '#0d2d5e', padding: '2px 8px', borderRadius: '4px' }}>{activeOrg.facility_state}</span>}
                </div>
                <a href="/dashboard/enterprise" style={{ fontSize: '12px', color: '#1a5fa8', textDecoration: 'none' }}>← Back to portfolio</a>
              </div>
            )}
            {org?.org_type === 'facility' && (
              <GettingStartedPanel
                dismissed={profile?.onboarding_dismissed || false}
              />
            )}
            {activeNotification && (
              <div style={{ background: '#fff6e8', border: '1px solid #f0d4a0', borderRadius: '10px', padding: '14px 20px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>🔔</span>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#9a3510', marginBottom: '3px' }}>Action requested by your administrator</p>
                    <p style={{ fontSize: '12px', color: '#4a6d8c', margin: 0 }}>{activeNotification.message}</p>
                  </div>
                </div>
                <AcknowledgeButton notificationId={activeNotification.id} />
              </div>
            )}
            <WelcomeModal facilityName={activeOrg?.name} />
            <ScrollRestorer />

      </div>
    </div>
  )
}