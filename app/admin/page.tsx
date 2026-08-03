import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminEnterpriseForm from '../components/admin/AdminEnterpriseForm'
import AdminClinicForm from '../components/admin/AdminClinicForm'
import AdminUserForm from '../components/admin/AdminUserForm'
import AdminAccessForm from '../components/admin/AdminAccessForm'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: subscribers } = await supabase
    .from('subscriptions')
    .select('org_id, status, current_period_end, stripe_subscription_id, created_at, organizations(name, org_type)')
    .order('created_at', { ascending: false })

  const { data: enterprises } = await supabase
    .from('organizations')
    .select('id, name, created_at')
    .eq('org_type', 'enterprise')
    .order('created_at', { ascending: false })

  const activeCount = (subscribers || []).filter(s => s.status === 'active' || s.status === 'trialing').length
  const enterpriseCount = (enterprises || []).length

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ background: '#0d2d5e', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>The Radiology Coach</span>
          <span style={{ background: '#931621', color: '#fff', fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px', letterSpacing: '.08em' }}>ADMIN</span>
        </div>
        <a href="/dashboard" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>← Back to dashboard</a>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#0d2d5e', marginBottom: '8px' }}>Admin Dashboard</h1>
        <p style={{ fontSize: '13px', color: '#4a6d8c', marginBottom: '32px' }}>Manage enterprises, clinics, users, and access — no SQL required.</p>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
          {[
            { label: 'Active subscribers', value: activeCount },
            { label: 'Enterprise accounts', value: enterpriseCount },
            { label: 'Total orgs', value: (subscribers || []).length },
            { label: 'Complimentary', value: (subscribers || []).filter(s => s.stripe_subscription_id?.startsWith('complimentary')).length }
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '10px', padding: '16px 20px' }}>
              <p style={{ fontSize: '11px', color: '#4a6d8c', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.06em' }}>{k.label}</p>
              <p style={{ fontSize: '28px', fontWeight: '600', color: '#0d2d5e', margin: 0 }}>{k.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <AdminEnterpriseForm enterprises={enterprises || []} />
          <AdminClinicForm enterprises={enterprises || []} />
          <AdminUserForm enterprises={enterprises || []} />
          <AdminAccessForm />
        </div>

        {/* Subscriber table */}
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', marginTop: '24px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', background: '#0d2d5e' }}>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#fff', margin: 0 }}>All Subscribers</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f0f4f8' }}>
                  {['Organization', 'Type', 'Status', 'Expiry', 'Created'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#4a6d8c', fontWeight: '500', borderBottom: '1px solid #dce8f5' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(subscribers || []).map((s: any, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f4f7fb' }}>
                    <td style={{ padding: '10px 16px', color: '#0d2d5e', fontWeight: '500' }}>{s.organizations?.name || '—'}</td>
                    <td style={{ padding: '10px 16px', color: '#4a6d8c' }}>{s.organizations?.org_type || '—'}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: s.status === 'active' ? '#edfaf3' : '#fff6e8', color: s.status === 'active' ? '#2d6a4f' : '#9a3510' }}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 16px', color: '#4a6d8c' }}>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}</td>
                    <td style={{ padding: '10px 16px', color: '#4a6d8c' }}>{s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}