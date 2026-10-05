import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()

  const { data: registrations } = await supabase
    .from('sp_state_registrations')
    .select('*')
    .eq('org_id', profile?.org_id)
    .order('state_name')

  const { data: allStateRules } = await supabase
    .from('sp_state_rules')
    .select('state_name, renewal_frequency, annual_renewal_date, reporting, vendor_registration_required')
    .order('state_name')

  const merged = (registrations || []).map(reg => {
    const rules = (allStateRules || []).find(r => r.state_name === reg.state_name)
    return { ...reg, renewal_frequency: rules?.renewal_frequency, annual_renewal_date: rules?.annual_renewal_date, reporting: rules?.reporting }
  })

  return NextResponse.json({ registrations: merged, allStateRules: allStateRules || [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
  const body = await request.json()

  const { error } = await supabase.from('sp_state_registrations').upsert({
    org_id: profile?.org_id,
    state_name: body.state_name,
    dealer_id: body.dealer_id || null,
    renewal_date: body.renewal_date || null,
    notes: body.notes || null,
    updated_at: new Date().toISOString()
  }, { onConflict: 'org_id,state_name' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ status: 'saved' })
}