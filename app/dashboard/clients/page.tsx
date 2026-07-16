'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ClientFacilitiesPage() {
  const [clients, setClients] = useState<any[]>([])
  const [org, setOrg] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchClients = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) { router.push('/onboarding'); return }

    const { data: orgData } = await supabase
      .from('organizations').select('*').eq('id', profile.org_id).single()
    setOrg(orgData)

    const { data: clientData } = await supabase
      .from('client_facilities')
      .select(`
        *,
        facility:facility_org_id (
          name,
          facility_type_name,
          facility_state,
          modality_names
        )
      `)
      .eq('sp_org_id', profile.org_id)
      .order('created_at', { ascending: false })

    setClients(clientData || [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchClients() }, [fetchClients])

  if (loading) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#a8a39c', fontSize: '13px' }}>Loading client facilities...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '500', marginLeft: '10px' }}>ComplianceOS</span>
        </div>
        <a href="/dashboard" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</a>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>Client Facilities</h1>
          <p style={{ fontSize: '13px', color: '#827d76' }}>
            {org?.name} · Facilities that signed up using your referral code <strong style={{ color: '#0d2d5e' }}>{org?.referral_code}</strong>
          </p>
        </div>

        {clients.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>No clients yet</p>
            <p style={{ fontSize: '13px', color: '#827d76', maxWidth: '400px', margin: '0 auto 20px', lineHeight: '1.65' }}>
              Share your referral code <strong>{org?.referral_code}</strong> with your clinic clients. When they sign up and enter your code, they appear here automatically.
            </p>
            <div style={{ background: '#edfaf3', border: '2px solid #2d6a4f', borderRadius: '10px', padding: '16px 20px', display: 'inline-block' }}>
              <p style={{ fontSize: '11px', color: '#2d6a4f', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Your referral code</p>
              <p style={{ fontSize: '28px', fontWeight: '500', color: '#0d2d5e', letterSpacing: '0.1em', margin: 0 }}>{org?.referral_code}</p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '10px', padding: '12px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '13px', color: '#2d6a4f', fontWeight: '500', margin: 0 }}>
                {clients.length} facility{clients.length !== 1 ? 'ies' : ''} linked to your referral code
              </p>
              <p style={{ fontSize: '13px', color: '#0d2d5e', fontWeight: '500', margin: 0 }}>
                Code: {org?.referral_code}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {clients.map((client: any) => (
                <div key={client.id} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '10px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '3px' }}>
                      {client.facility?.name || 'Unknown facility'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#827d76' }}>
                      {[client.facility?.facility_type_name, client.facility?.facility_state, ...(client.facility?.modality_names || [])].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', fontWeight: '500', color: '#40916c', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '20px', padding: '2px 8px', display: 'block', marginBottom: '4px' }}>
                      Active
                    </span>
                    <p style={{ fontSize: '11px', color: '#a8a39c', margin: 0 }}>
                      Joined {new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}