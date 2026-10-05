'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminReferralsTable() {
  const [referrals, setReferrals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('referrals')
        .select(`
          id, referral_code, status, created_at,
          referring_org:referring_org_id ( name ),
          referred_org:referred_org_id ( name )
        `)
        .order('created_at', { ascending: false })
      setReferrals(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ background: '#fff', border: '1px solid #e8e6e2', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6b46c1' }} />
        <h3 style={{ fontSize: '15px', fontWeight: '500', margin: 0 }}>Referrals</h3>
        <span style={{ fontSize: '12px', color: '#827d76', background: '#f7f5f1', borderRadius: '20px', padding: '2px 10px' }}>
          {referrals.length} total
        </span>
      </div>

      {loading ? (
        <p style={{ fontSize: '13px', color: '#a8a39c' }}>Loading...</p>
      ) : referrals.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#a8a39c' }}>No referrals yet. They will appear here when a clinic subscribes through a dealer referral link.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e8e6e2' }}>
              {['Referring Dealer', 'Referred Clinic', 'Referral Code', 'Date', 'Status'].map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#827d76', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {referrals.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f7f5f1', background: i % 2 === 0 ? '#fff' : '#fdfcfb' }}>
                <td style={{ padding: '10px 12px', fontWeight: '500', color: '#1e1c1a' }}>{(r.referring_org as any)?.name || '—'}</td>
                <td style={{ padding: '10px 12px', color: '#1e1c1a' }}>{(r.referred_org as any)?.name || '—'}</td>
                <td style={{ padding: '10px 12px' }}>
                  <code style={{ fontSize: '11px', background: '#f7f5f1', borderRadius: '4px', padding: '2px 6px', color: '#827d76' }}>{r.referral_code}</code>
                </td>
                <td style={{ padding: '10px 12px', color: '#827d76' }}>{new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '500', padding: '2px 10px', borderRadius: '20px', background: r.status === 'active' ? '#f3fff7' : '#f7f5f1', color: r.status === 'active' ? '#2d6a4f' : '#827d76', border: `1px solid ${r.status === 'active' ? '#ace9c0' : '#e8e6e2'}` }}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}