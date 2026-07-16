import { createClient as createAdmin } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const getAdmin = () => createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (e: any) {
    console.error('Webhook signature failed:', e.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const admin = getAdmin()

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orgId = session.metadata?.org_id
        const userId = session.metadata?.user_id
        const plan = session.metadata?.plan || 'professional'
        if (!orgId) break

        const subscriptionId = session.subscription as string
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        await admin.from('subscriptions').upsert({
          org_id: orgId,
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          status: subscription.status,
          price_id: subscription.items.data[0]?.price.id,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        }, { onConflict: 'org_id' })

        await admin.from('organizations').update({
          subscription_tier: plan === 'service_provider' ? 'service_provider' : 'professional'
        }).eq('id', orgId)

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const orgId = subscription.metadata?.org_id
        if (!orgId) break

        await admin.from('subscriptions').upsert({
          org_id: orgId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          status: subscription.status,
          price_id: subscription.items.data[0]?.price.id,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        }, { onConflict: 'org_id' })

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const orgId = subscription.metadata?.org_id
        if (!orgId) break

        await admin.from('subscriptions').update({
          status: 'canceled',
          cancel_at_period_end: false,
        }).eq('org_id', orgId)

        await admin.from('organizations').update({
          subscription_tier: 'free'
        }).eq('id', orgId)

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: sub } = await admin
          .from('subscriptions')
          .select('org_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (sub?.org_id) {
          await admin.from('subscriptions').update({
            status: 'past_due'
          }).eq('org_id', sub.org_id)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (e: any) {
    console.error('Webhook processing error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}