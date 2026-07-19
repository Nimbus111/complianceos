import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 })

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('org_id', profile.org_id)
      .single()

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: 'https://app.theradiologycoach.com/dashboard/settings',
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}