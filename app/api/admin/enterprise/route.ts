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

  const { error: assignErr } = await supabase.rpc('assign_user_to_org', {
    p_email: adminEmail,
    p_org_id: org.id
  })

  if (assignErr) {
    return NextResponse.json({
      status: 'partial',
      orgId: org.id,
      warning: `Enterprise created but could not assign admin — user may not be registered yet. Org ID: ${org.id}`
    })
  }

  return NextResponse.json({ status: 'created', orgId: org.id })
}