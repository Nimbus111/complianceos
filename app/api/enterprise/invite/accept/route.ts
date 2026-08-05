import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { token, orgId } = await request.json()

  await supabase.from('profiles')
    .update({ org_id: orgId, onboarding_completed: true })
    .eq('id', user.id)

  await supabase.from('subscriptions').upsert({
    org_id: orgId,
    stripe_customer_id: 'complimentary',
    stripe_subscription_id: `complimentary_${orgId.slice(0, 8)}`,
    status: 'active',
    current_period_end: '2099-12-31'
  }, { onConflict: 'stripe_subscription_id' })

  await supabase.from('invite_tokens')
    .update({ accepted_at: new Date().toISOString() })
    .eq('token', token)

  return NextResponse.json({ status: 'accepted' })
}