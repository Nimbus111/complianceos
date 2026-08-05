import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AcceptInviteClient from './AcceptInviteClient'

export default async function InvitePage({ params }: { params: { token: string } }) {
  const supabase = await createClient()

  const { data: invite } = await supabase
    .from('invite_tokens')
    .select('*, organizations(name, facility_state, facility_type_name)')
    .eq('token', params.token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (!invite) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
        <p style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</p>
        <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#0d2d5e', marginBottom: '8px' }}>Invite link expired or invalid</h1>
        <p style={{ fontSize: '13px', color: '#4a6d8c', lineHeight: '1.6' }}>This invite link has already been used or has expired. Contact your administrator for a new link.</p>
      </div>
    </div>
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await supabase.from('profiles').update({ org_id: invite.org_id, onboarding_completed: true }).eq('id', user.id)
    await supabase.from('subscriptions').upsert({
      org_id: invite.org_id, stripe_customer_id: 'complimentary',
      stripe_subscription_id: `complimentary_${invite.org_id.slice(0, 8)}`,
      status: 'active', current_period_end: '2099-12-31'
    }, { onConflict: 'stripe_subscription_id' })
    await supabase.from('invite_tokens').update({ accepted_at: new Date().toISOString() }).eq('token', params.token)
    redirect('/dashboard')
  }

  const org = invite.organizations as any

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img src="https://static.wixstatic.com/media/487e4d_3b2132b097974e8baf3409ee0c63b7e1~mv2_d_3840_2160_s_2.png" alt="The Radiology Coach" style={{ height: '40px', marginBottom: '20px' }} />
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#4a6d8c', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '8px' }}>You've been invited to join</p>
          <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#0d2d5e', marginBottom: '4px' }}>{org?.name}</h1>
          {org?.facility_state && <p style={{ fontSize: '13px', color: '#4a6d8c', margin: 0 }}>{org.facility_type_name} · {org.facility_state}</p>}
        </div>
        <AcceptInviteClient token={params.token} orgId={invite.org_id} email={invite.email} />
      </div>
    </div>
  )
}