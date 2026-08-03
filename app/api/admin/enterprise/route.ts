import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { name, adminEmail, expiry } = await request.json()

  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .insert({ name, org_type: 'enterprise' })
    .select('id')
    .single()

  if (orgErr) return NextResponse.json({ error: orgErr.message }, { status: 500 })

  await supabase.from('subscriptions').insert({
    org_id: org.id,
    stripe_customer_id: 'complimentary',
    stripe_subscription_id: `complimentary_${org.id.slice(0, 8)}`,
    status: 'active',
    current_period_end: expiry
  })

  const { data: user } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', (await supabase.auth.admin.getUserByEmail ? 
      (await (supabase as any).auth.admin.listUsers()).data?.users?.find((u: any) => u.email === adminEmail)?.id
      : null))
    .maybeSingle()

  const { data: authUser } = await (supabase as any).rpc('get_user_id_by_email', { email: adminEmail })
  
  if (authUser) {
    await supabase.from('profiles')
      .update({ org_id: org.id, onboarding_completed: true })
      .eq('id', authUser)
  }

  return NextResponse.json({ status: 'created', orgId: org.id })
}