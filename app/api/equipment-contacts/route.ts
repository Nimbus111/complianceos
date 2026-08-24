import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()

  const body = await request.json()

  const { error } = await supabase.from('equipment_contacts').upsert({
    org_id: profile?.org_id,
    equipment_id: body.equipment_id,
    contact_type: body.contact_type,
    company_name: body.company_name,
    contact_name: body.contact_name,
    phone_primary: body.phone_primary,
    phone_support: body.phone_support,
    email: body.email,
    website: body.website,
    account_number: body.account_number,
    notes: body.notes,
  }, { onConflict: 'org_id,equipment_id,contact_type' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ status: 'saved' })
}