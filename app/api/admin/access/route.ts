import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { email, expiry } = await request.json()

  const { data: profile } = await supabase
    .rpc('get_org_id_by_email', { p_email: email })

  if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { error } = await supabase.from('subscriptions').upsert({
    org_id: profile,
    stripe_customer_id: 'complimentary',
    stripe_subscription_id: `complimentary_${profile.slice(0, 8)}`,
    status: 'active',
    current_period_end: expiry
  }, { onConflict: 'stripe_subscription_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ status: 'granted' })
}