import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 })

    const { data: org } = await supabase
      .from('organizations').select('name, org_type').eq('id', profile.org_id).single()

    const { plan } = await request.json()

    const priceId = plan === 'service_provider'
      ? process.env.STRIPE_SP_PRICE_ID!
      : process.env.STRIPE_PROFESSIONAL_PRICE_ID!

    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: existingSub } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('org_id', profile.org_id)
      .single()

    let customerId = existingSub?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: org?.name,
        metadata: { org_id: profile.org_id, user_id: user.id }
      })
      customerId = customer.id
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 14,
        metadata: { org_id: profile.org_id, user_id: user.id, plan }
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.theradiologycoach.com'}/dashboard?subscribed=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.theradiologycoach.com'}/dashboard?cancelled=true`,
      metadata: { org_id: profile.org_id, user_id: user.id, plan }
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    console.error('Checkout error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}