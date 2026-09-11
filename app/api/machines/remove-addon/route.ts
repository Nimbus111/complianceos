import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-06-24.dahlia' })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { equipment_id } = await request.json()

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()

  // Count current machines
  const { count: machineCount } = await supabase
    .from('equipment')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', profile?.org_id)
    .eq('device_type', 'x-ray_machine')

  const { data: org } = await supabase
    .from('organizations').select('machine_limit').eq('id', profile?.org_id).single()

  // Delete the equipment record
  await supabase.from('equipment').delete().eq('id', equipment_id)

  // Only adjust billing if they were above the 3-machine limit
  if ((machineCount || 0) > 3) {
    const { data: addon } = await supabase
      .from('machine_addons')
      .select('stripe_subscription_item_id, quantity')
      .eq('org_id', profile?.org_id)
      .maybeSingle()

    if (addon?.stripe_subscription_item_id) {
      try {
        if ((addon.quantity || 1) <= 1) {
          // Remove the subscription item entirely
          await stripe.subscriptionItems.del(addon.stripe_subscription_item_id)
          await supabase.from('machine_addons').delete().eq('org_id', profile?.org_id)
        } else {
          // Reduce quantity by 1
          await stripe.subscriptionItems.update(
            addon.stripe_subscription_item_id,
            { quantity: (addon.quantity || 1) - 1 }
          )
          await supabase.from('machine_addons')
            .update({ quantity: (addon.quantity || 1) - 1 })
            .eq('org_id', profile?.org_id)
        }

        // Decrease machine limit
        await supabase.from('organizations')
          .update({ machine_limit: Math.max((org?.machine_limit || 3) - 1, 3) })
          .eq('id', profile?.org_id)
      } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ status: 'removed' })
}