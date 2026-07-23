import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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

  // Fetch all linked sites with their compliance data
  const { data: siteLinks } = await supabase
    .from('enterprise_sites')
    .select('*, site:site_org_id(id, name, facility_state, facility_type_name, modality_names)')
    .eq('enterprise_org_id', profile.org_id)

  const sites = siteLinks || []

  // Fetch task completion for each site
  const siteIds = sites.map(s => s.site_org_id)
  const { data: allTasks } = await supabase.from('facility_tasks').select('id')
  const taskTotal = allTasks?.length || 8

  const completionMap: Record<string, number> = {}
  if (siteIds.length > 0) {
    const { data: allCompletions } = await supabase
      .from('user_task_completions')
      .select('org_id, task_id')
      .in('org_id', siteIds)
    for (const siteId of siteIds) {
      const count = (allCompletions || []).filter(c => c.org_id === siteId).length
      completionMap[siteId] = taskTotal > 0 ? Math.round((count / taskTotal) * 100) : 0
    }
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', marginLeft: '10px' }}>ComplianceOS Enterprise</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ color: '#8bb4d4', fontSize: '13px' }}>{org?.name}</span>
          <a href="/dashboard/settings" style={{ color: '#8bb4d4', fontSize: '12px', textDecoration: 'none' }}>Settings</a>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>
            {org?.name}
          </h1>
          <p style={{ fontSize: '13px', color: '#827d76' }}>
            Enterprise portfolio · {sites.length} site{sites.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Summary metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '32px' }}>
          {[
            { label: 'Total sites', value: String(sites.length) },
            {
              label: 'Avg compliance',
              value: sites.length > 0
                ? `${Math.round(Object.values(completionMap).reduce((a, b) => a + b, 0) / sites.length)}%`
                : '—'
            },
            {
              label: 'Inspection ready',
              value: String(Object.values(completionMap).filter(p => p === 100).length)
            },
          ].map(m => (
            <div key={m.label} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '20px 24px' }}>
              <p style={{ fontSize: '11px', fontWeight: '500', color: '#a8a39c', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>{m.label}</p>
              <p style={{ fontSize: '32px', fontWeight: '500', color: '#0d2d5e', lineHeight: 1 }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Site cards */}
        {sites.length === 0 ? (
          <div style={{ background: '#fff', border: '1px dashed #c2ddf0', borderRadius: '12px', padding: '64px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>No sites configured yet</p>
            <p style={{ fontSize: '13px', color: '#a8a39c', maxWidth: '400px', margin: '0 auto' }}>
              Contact The Radiology Coach to add your clinic locations to this enterprise account.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {sites.map(link => {
              const site = link.site
              const pct = completionMap[link.site_org_id] || 0
              const ready = pct === 100
              return (
                <Link key={link.id} href={`/dashboard?site=${link.site_org_id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#fff', border: `1px solid ${ready ? '#b8e8cc' : '#dce8f5'}`, borderRadius: '12px', padding: '22px 24px', cursor: 'pointer', transition: 'box-shadow .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(13,45,94,.1)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>
                          {link.site_label || site?.name}
                        </p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {site?.facility_state && (
                            <span style={{ fontSize: '11px', color: '#4a6d8c', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '1px 8px' }}>
                              {site.facility_state}
                            </span>
                          )}
                          {site?.facility_type_name && (
                            <span style={{ fontSize: '11px', color: '#4a6d8c', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '1px 8px' }}>
                              {site.facility_type_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: '28px', fontWeight: '500', color: ready ? '#2d6a4f' : '#0d2d5e', lineHeight: 1, marginBottom: '4px' }}>
                          {pct}%
                        </p>
                        {ready && (
                          <span style={{ fontSize: '10px', fontWeight: '500', color: '#2d6a4f', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '20px', padding: '2px 8px' }}>
                            Inspection Ready ✓
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Compliance bar */}
                    <div style={{ height: '4px', background: '#eef3fb', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: ready ? '#40916c' : '#1a5fa8', borderRadius: '4px', transition: 'width .3s' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {(site?.modality_names || []).slice(0, 2).map((m: string) => (
                          <span key={m} style={{ fontSize: '11px', color: '#827d76' }}>{m}</span>
                        ))}
                        {(site?.modality_names || []).length > 2 && (
                          <span style={{ fontSize: '11px', color: '#a8a39c' }}>+{(site?.modality_names || []).length - 2} more</span>
                        )}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: '#1a5fa8' }}>View site →</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: '24px', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '10px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '13px', color: '#0d2d5e', flex: 1, margin: 0 }}>
            Need to add a new site or adjust enterprise settings?
          </p>
          <a href="mailto:hello@theradiologycoach.com" style={{ fontSize: '12px', fontWeight: '500', color: '#fff', background: '#0d2d5e', padding: '7px 16px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Contact support →
          </a>
        </div>
      </div>
    </div>
  )
}