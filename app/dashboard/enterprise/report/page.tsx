import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function EnterpriseReportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const { data: org } = await supabase
    .from('organizations').select('*').eq('id', profile.org_id).single()
  if (org?.org_type !== 'enterprise') redirect('/dashboard')

  const { data: siteLinks } = await supabase
    .from('enterprise_sites')
    .select('site_org_id, site_label, organizations(id, name, facility_state, facility_type_name, modality_names)')
    .eq('enterprise_org_id', profile.org_id)

  const siteIds = (siteLinks || []).map((s: any) => s.site_org_id)

  const { data: allTasks } = await supabase
    .from('facility_tasks').select('id, task_text, urgency').order('sort_order')

  const { data: allCompletions } = siteIds.length > 0
    ? await supabase.from('user_task_completions').select('org_id, task_id').in('org_id', siteIds)
    : { data: [] }

  const scorableTasks = (allTasks || []).filter((t: any) => t.urgency !== 'Advisory')
  const taskTotal = scorableTasks.length

  const siteData = (siteLinks || []).map((link: any) => {
    const site = link.organizations
    const completedIds = new Set((allCompletions || []).filter((c: any) => c.org_id === link.site_org_id).map((c: any) => c.task_id))
    const completed = scorableTasks.filter((t: any) => completedIds.has(t.id)).length
    const pct = taskTotal > 0 ? Math.round((completed / taskTotal) * 100) : 0
    const remaining = scorableTasks.filter((t: any) => !completedIds.has(t.id))
    return { link, site, pct, completed, remaining }
  }).sort((a, b) => a.pct - b.pct)

  const avgPct = siteData.length > 0 ? Math.round(siteData.reduce((sum, s) => sum + s.pct, 0) / siteData.length) : 0
  const inspectionReady = siteData.filter(s => s.pct === 100).length
  const atRisk = siteData.filter(s => s.pct < 50).length
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Nav */}
      <div style={{ background: '#0d2d5e', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="https://static.wixstatic.com/media/487e4d_3b2132b097974e8baf3409ee0c63b7e1~mv2_d_3840_2160_s_2.png" alt="The Radiology Coach" style={{ height: '36px' }} />
          <span style={{ color: '#8bb4d4', fontSize: '13px' }}>Enterprise Report</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="/dashboard/enterprise" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>← Portfolio</a>
          <button onclick="window.print()" style={{ background: '#1a5fa8', color: '#fff', border: 'none', borderRadius: '7px', padding: '7px 16px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
            Print / Save PDF
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#4a6d8c', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Enterprise Compliance Report</p>
          <h1 style={{ fontSize: '26px', fontWeight: '600', color: '#0d2d5e', marginBottom: '4px' }}>{org?.name}</h1>
          <p style={{ fontSize: '13px', color: '#4a6d8c' }}>Generated {today} · {siteData.length} facility{siteData.length !== 1 ? 'ies' : 'y'}</p>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Portfolio score', value: `${avgPct}%`, color: avgPct >= 75 ? '#2d6a4f' : avgPct >= 50 ? '#9a3510' : '#931621' },
            { label: 'Total facilities', value: siteData.length, color: '#0d2d5e' },
            { label: 'Inspection ready', value: inspectionReady, color: '#2d6a4f' },
            { label: 'At risk (<50%)', value: atRisk, color: '#931621' },
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '10px', padding: '16px 20px' }}>
              <p style={{ fontSize: '11px', color: '#4a6d8c', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.06em' }}>{k.label}</p>
              <p style={{ fontSize: '28px', fontWeight: '600', color: k.color, margin: 0 }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Site table */}
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '14px 20px', background: '#0d2d5e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#fff', margin: 0 }}>Facility Compliance Summary</p>
            <p style={{ fontSize: '11px', color: '#8bb4d4', margin: 0 }}>Sorted lowest to highest</p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f0f4f8' }}>
                {['Facility', 'State', 'Type', 'Complete', 'Score', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#4a6d8c', fontWeight: '500', borderBottom: '1px solid #dce8f5', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {siteData.map(({ link, site, pct, completed }, i) => {
                const status = pct === 100 ? 'Inspection ready' : pct >= 75 ? 'On track' : pct >= 50 ? 'Action needed' : 'At risk'
                const statusColor = pct === 100 ? '#2d6a4f' : pct >= 75 ? '#1a5fa8' : pct >= 50 ? '#9a3510' : '#931621'
                const statusBg = pct === 100 ? '#edfaf3' : pct >= 75 ? '#e8f3fb' : pct >= 50 ? '#fff6e8' : '#fefafb'
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f4f7fb' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '500', color: '#0d2d5e' }}>
                      <a href={`/dashboard?site=${link.site_org_id}`} style={{ color: '#0d2d5e', textDecoration: 'none' }}>
                        {site?.name || link.site_label}
                      </a>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#4a6d8c' }}>{site?.facility_state || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#4a6d8c' }}>{site?.facility_type_name || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#4a6d8c' }}>{completed} / {taskTotal}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '80px', height: '6px', background: '#e8f3fb', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: statusColor, borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontWeight: '500', color: statusColor }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', background: statusBg, color: statusColor }}>
                        {status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Outstanding actions per site */}
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', background: '#0d2d5e' }}>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#fff', margin: 0 }}>Outstanding Actions by Facility</p>
          </div>
          {siteData.filter(s => s.remaining.length > 0).map(({ link, site, remaining }, i) => (
            <div key={i} style={{ borderBottom: '1px solid #f4f7fb', padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#0d2d5e', marginBottom: '10px' }}>
                {site?.name || link.site_label}
                <span style={{ fontSize: '11px', fontWeight: '400', color: '#4a6d8c', marginLeft: '8px' }}>{remaining.length} remaining</span>
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {remaining.slice(0, 8).map((t: any) => (
                  <span key={t.id} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: t.urgency === 'Immediate' ? '#fefafb' : '#f0f4f8', border: `1px solid ${t.urgency === 'Immediate' ? '#f5c6c9' : '#dce8f5'}`, color: t.urgency === 'Immediate' ? '#931621' : '#4a6d8c' }}>
                    {t.task_text}
                  </span>
                ))}
                {remaining.length > 8 && (
                  <span style={{ fontSize: '11px', color: '#a8a39c', padding: '3px 6px' }}>+{remaining.length - 8} more</span>
                )}
              </div>
            </div>
          ))}
          {siteData.every(s => s.remaining.length === 0) && (
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#2d6a4f', fontWeight: '500' }}>✓ All facilities inspection ready</p>
            </div>
          )}
        </div>

      </div>

      <style>{`@media print { button { display: none !important; } body { background: white !important; } }`}</style>
    </div>
  )
}