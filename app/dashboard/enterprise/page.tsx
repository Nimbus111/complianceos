import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SendReminderButton from '../../components/SendReminderButton'
import InviteManagerButton from '../../components/InviteManagerButton'
import EnterpriseActivityTracker from '../../components/EnterpriseActivityTracker'

function statusColors(pct: number) {
  if (pct >= 90) return { border: '#b8e8cc', bg: '#f8fffe', bar: '#40916c', badge: '#edfaf3', badgeText: '#2d6a4f', badgeBorder: '#b8e8cc', label: 'Inspection ready' }
  if (pct >= 50) return { border: '#f0d4a0', bg: '#fffdf8', bar: '#c44a1a', badge: '#fff6e8', badgeText: '#9a3510', badgeBorder: '#f0d4a0', label: 'Action needed' }
  return { border: '#f5c6c9', bg: '#fefafb', bar: '#931621', badge: '#fefafb', badgeText: '#76121a', badgeBorder: '#f5c6c9', label: 'At risk' }
}

export default async function EnterpriseDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) redirect('/onboarding')

  const { data: org } = await supabase
    .from('organizations').select('*').eq('id', profile.org_id).single()
  if (org?.org_type !== 'enterprise') redirect('/dashboard')

  const { data: siteLinks } = await supabase
    .from('enterprise_sites')
    .select('*, site:site_org_id(id, name, facility_state, facility_type_name, modality_names)')
    .eq('enterprise_org_id', profile.org_id)

  const sites = siteLinks || []
  const siteIds = sites.map(s => s.site_org_id).filter(Boolean)

  const actNow = new Date()
  const currentMonth = `${actNow.getFullYear()}-${String(actNow.getMonth() + 1).padStart(2, '0')}`
  const past6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(actNow.getFullYear(), actNow.getMonth() - i, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const past3Years = Array.from({ length: 3 }, (_, i) => String(actNow.getFullYear() - i))
  const allPeriods = [...past6Months, ...past3Years]

  const { data: activityCompletions } = siteIds.length > 0
    ? await supabase.from('site_activity_completions')
        .select('org_id, activity_type, period')
        .in('org_id', siteIds)
        .in('period', allPeriods)
    : { data: [] }

  const { data: notifications } = siteIds.length > 0
    ? await supabase
        .from('enterprise_notifications')
        .select('site_org_id, acknowledged_at')
        .eq('enterprise_org_id', profile.org_id)
        .in('site_org_id', siteIds)
    : { data: [] }

  const [
    { data: allTasks },
    { data: allCompletions },
    { data: epeRegs },
  ] = await Promise.all([
    supabase.from('facility_tasks').select('id, task_name').order('sort_order'),
    siteIds.length > 0
      ? supabase.from('user_task_completions').select('org_id, task_id').in('org_id', siteIds)
      : Promise.resolve({ data: [] }),
    siteIds.length > 0
      ? supabase.from('regulations').select('state_name').eq('equipment_performance_eval', true)
      : Promise.resolve({ data: [] }),
  ])

  const taskTotal = allTasks?.length || 8
  const epeStates = new Set((epeRegs || []).map((r: any) => r.state_name))

  const siteData = sites.map(link => {
    const site = link.site as any
    const siteCompletions = (allCompletions || []).filter((c: any) => c.org_id === link.site_org_id)
    const completedIds = new Set(siteCompletions.map((c: any) => c.task_id))
    const pct = taskTotal > 0 ? Math.round((siteCompletions.length / taskTotal) * 100) : 0
    const incompleteTasks = (allTasks || []).filter((t: any) => !completedIds.has(t.id))
    const completedTasks = (allTasks || []).filter((t: any) => completedIds.has(t.id))
    const hasPending = (notifications || []).some(
      n => n.site_org_id === link.site_org_id && !n.acknowledged_at
    )
    return { link, site, pct, incompleteTasks, completedTasks, epeRequired: epeStates.has(site?.facility_state), hasPending }
  }).sort((a, b) => a.pct - b.pct)

  const readyCount = siteData.filter(s => s.pct >= 90).length
  const atRiskCount = siteData.filter(s => s.pct < 50).length
  const actionCount = siteData.filter(s => s.pct >= 50 && s.pct < 90).length

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', marginLeft: '10px' }}>ComplianceOS Enterprise</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: '#8bb4d4', fontSize: '13px' }}>{org?.name}</span>
<a href="#" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none', opacity: '.6', cursor: 'not-allowed' }} title="Coming soon">Clinic Reports</a>
              <a href="/dashboard/enterprise/report" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>Enterprise Report</a>
          <a href="mailto:hello@theradiologycoach.com" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>Platform Assistance</a>
          <a href="/dashboard/settings" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>Settings</a>
          <form action="/auth/signout" method="post">
            <button type="submit" style={{ color: '#8bb4d4', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>Sign out</button>
          </form>
        </div>
      </nav>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '36px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>Compliance Portfolio</h1>
          <p style={{ fontSize: '13px', color: '#827d76' }}>All facilities sorted by compliance level — sites needing attention appear first.</p>
        </div>

        {/* Summary metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Total sites', value: String(sites.length), color: '#0d2d5e' },
            { label: 'Inspection ready', value: String(readyCount), color: '#2d6a4f' },
            { label: 'Action needed', value: String(actionCount), color: '#9a3510' },
            { label: 'At risk', value: String(atRiskCount), color: '#931621' },
          ].map(m => (
            <div key={m.label} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '10px', padding: '16px 20px' }}>
              <p style={{ fontSize: '11px', fontWeight: '500', color: '#a8a39c', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '6px' }}>{m.label}</p>
              <p style={{ fontSize: '28px', fontWeight: '500', color: m.color, lineHeight: 1, margin: 0 }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Site cards */}
        {sites.length === 0 ? (
          <div style={{ background: '#fff', border: '1px dashed #c2ddf0', borderRadius: '12px', padding: '64px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>No sites configured yet</p>
            <p style={{ fontSize: '13px', color: '#a8a39c' }}>Contact The Radiology Coach to add your clinic locations.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <EnterpriseActivityTracker
          sites={(siteLinks || []).map((l: any) => ({ site_org_id: l.site_org_id, name: l.organizations?.name || l.site_label }))}
          completions={activityCompletions || []}
        />

        {siteData.map(({ link, site, pct, incompleteTasks, completedTasks, epeRequired, hasPending }) => {
              const c = statusColors(pct)
              return (
                <div key={link.id} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '12px', overflow: 'hidden' }}>

                  {/* Card header */}
                  <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', flexWrap: 'wrap' }}>
                        <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>
                          {link.site_label || site?.name}
                        </p>
                        <span style={{ fontSize: '10px', fontWeight: '500', color: c.badgeText, background: c.badge, border: `1px solid ${c.badgeBorder}`, borderRadius: '20px', padding: '2px 8px' }}>
                          {c.label}
                        </span>
                        {epeRequired && (
                          <span style={{ fontSize: '10px', fontWeight: '500', color: '#76121a', background: '#fefafb', border: '1px solid #f5c6c9', borderRadius: '20px', padding: '2px 8px' }}>
                            ⚠ EPE Required
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {site?.facility_state && <span style={{ fontSize: '11px', color: '#4a6d8c', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '1px 8px' }}>{site.facility_state}</span>}
                        {site?.facility_type_name && <span style={{ fontSize: '11px', color: '#4a6d8c', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '1px 8px' }}>{site.facility_type_name}</span>}
                        {(site?.modality_names || []).map((m: string) => (
                          <span key={m} style={{ fontSize: '11px', color: '#4a6d8c', background: '#f4f7fb', border: '1px solid #dce8f5', borderRadius: '20px', padding: '1px 8px' }}>{m}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '30px', fontWeight: '500', color: c.bar, lineHeight: 1, marginBottom: '2px' }}>{pct}%</p>
                      <p style={{ fontSize: '11px', color: '#a8a39c', margin: 0 }}>{completedTasks.length}/{taskTotal} complete</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: '4px', background: '#eef3fb', margin: '0 20px' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: c.bar, borderRadius: '4px' }} />
                  </div>

                  {/* Task status grid */}
                  <div style={{ padding: '12px 20px' }}>
                    {incompleteTasks.length === 0 && completedTasks.length > 0 ? (
                      <p style={{ fontSize: '12px', fontWeight: '500', color: '#2d6a4f', margin: 0 }}>✓ All required actions complete — inspection ready</p>
                    ) : (
                      <div>
                        {incompleteTasks.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: completedTasks.length > 0 ? '6px' : '0' }}>
                            {incompleteTasks.map((t: any) => (
                              <span key={t.id} style={{ fontSize: '11px', color: '#9a3510', background: '#fff6e8', border: '1px solid #f0d4a0', borderRadius: '5px', padding: '2px 8px' }}>
                                ⚠ {t.task_name?.replace(/^(Verify|Confirm|Complete or update your|Set up|Schedule or document|Inspect and document|Post|Maintain and file)\s+/i, '') || t.task_name}
                              </span>
                            ))}
                          </div>
                        )}
                        {completedTasks.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {completedTasks.map((t: any) => (
                              <span key={t.id} style={{ fontSize: '11px', color: '#2d6a4f', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '5px', padding: '2px 8px' }}>
                                ✓ {t.task_name?.replace(/^(Verify|Confirm|Complete or update your|Set up|Schedule or document|Inspect and document|Post|Maintain and file)\s+/i, '') || t.task_name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ padding: '8px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <SendReminderButton
                      siteOrgId={link.site_org_id}
                      enterpriseOrgId={profile.org_id}
                      hasPending={hasPending}
                    />
                    <InviteManagerButton
                      siteOrgId={link.site_org_id}
                      siteName={site?.name || link.site_label || ''}
                    />
                  </div>
                  
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <a href={`/dashboard/report?site=${link.site_org_id}`}
                      style={{ fontSize: '12px', fontWeight: '500', color: '#4a6d8c', textDecoration: 'none' }}>
                      Report →
                    </a>
                    <a href={`/dashboard?site=${link.site_org_id}`}
                      style={{ fontSize: '12px', fontWeight: '500', color: '#1a5fa8', textDecoration: 'none' }}>
                      Open dashboard →
                    </a>
                  </div>
                </div>

                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: '24px', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '10px', padding: '12px 20px', fontSize: '12px', color: '#4a6d8c', lineHeight: '1.6' }}>
          <strong style={{ color: '#0d2d5e' }}>Sites are sorted by compliance level</strong> — lowest compliance first so the most urgent locations are always at the top. Click "Open full dashboard →" to drill into any site and work through its required actions.
        </div>
      </div>
    </div>
  )
}