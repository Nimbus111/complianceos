import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()

  const body = await request.json()

  const contactData = {
    org_id: profile?.org_id,
    equipment_id: body.equipment_id || null,
    contact_type: body.contact_type,
    company_name: body.company_name || null,
    contact_name: body.contact_name || null,
    phone_primary: body.phone_primary || null,
    phone_support: body.phone_support || null,
    email: body.email || null,
    website: body.website || null,
    account_number: body.account_number || null,
    notes: body.notes || null,
  }

  const { data: existing } = await supabase
    .from('equipment_contacts')
    .select('id')
    .eq('org_id', profile?.org_id)
    .eq('equipment_id', body.equipment_id || '')
    .eq('contact_type', body.contact_type)
    .maybeSingle()

  const { error } = existing
    ? await supabase.from('equipment_contacts').update(contactData).eq('id', existing.id)
    : await supabase.from('equipment_contacts').insert(contactData)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ status: 'saved' })
}