import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-06-24.dahlia' })
const MACHINE_ADDON_PRICE = 'price_1UDssxKGboxV9Pg7i2VUhHTM'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()

  const { data: org } = await supabase
    .from('organizations').select('machine_limit, org_type').eq('id', profile?.org_id).single()

  // Only Professional and Enterprise accounts
  if (!['facility', 'enterprise'].includes(org?.org_type || '')) {
    return NextResponse.json({ error: 'Add-ons not available for this plan' }, { status: 403 })
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id, stripe_customer_id')
    .eq('org_id', profile?.org_id)
    .single()

  if (!subscription?.stripe_subscription_id) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
  }

  // Check for existing add-on item
  const { data: existingAddon } = await supabase
    .from('machine_addons')
    .select('stripe_subscription_item_id, quantity')
    .eq('org_id', profile?.org_id)
    .maybeSingle()

  try {
    if (existingAddon?.stripe_subscription_item_id) {
      // Increase quantity on existing subscription item
      await stripe.subscriptionItems.update(
        existingAddon.stripe_subscription_item_id,
        { quantity: (existingAddon.quantity || 1) + 1 }
      )
      await supabase.from('machine_addons')
        .update({ quantity: (existingAddon.quantity || 1) + 1 })
        .eq('org_id', profile?.org_id)
    } else {
      // Create new subscription item
      const item = await stripe.subscriptionItems.create({
        subscription: subscription.stripe_subscription_id,
        price: MACHINE_ADDON_PRICE,
        quantity: 1,
      })
      await supabase.from('machine_addons').insert({
        org_id: profile?.org_id,
        stripe_subscription_item_id: item.id,
        quantity: 1
      })
    }

    // Increase machine limit
    await supabase.from('organizations')
      .update({ machine_limit: (org?.machine_limit || 3) + 1 })
      .eq('id', profile?.org_id)

    return NextResponse.json({ status: 'added', new_limit: (org?.machine_limit || 3) + 1 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}