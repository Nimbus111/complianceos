import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, email, notes } = await request.json()

  // Create organization
  const { data: org, error: orgError } = await admin.from('organizations').insert({
    name,
    org_type: 'service_provider',
    partner_since: new Date().toISOString(),
    notes
  }).select().single()

  if (orgError) return NextResponse.json({ error: orgError.message }, { status: 500 })

  // Create auth user
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: name }
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  // Create profile
  await admin.from('profiles').insert({
    id: authUser.user.id,
    org_id: org.id,
    display_name: name,
    role: 'manager'
  })

  // Create permanent subscription
  await admin.from('subscriptions').insert({
    org_id: org.id,
    status: 'active',
    subscription_tier: 'service_provider',
    is_partner: true,
    partner_notes: notes || null
  })

  // Send password reset so they can set their own password
  await admin.auth.admin.generateLink({
    type: 'recovery',
    email
  })

  return NextResponse.json({ status: 'created', org_id: org.id })
}