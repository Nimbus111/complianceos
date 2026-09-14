import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()

  const { data } = await supabase
    .from('sp_installation_packets')
    .select('*')
    .eq('sp_org_id', profile?.org_id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data || [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()

  const body = await request.json()

  // Look up clinic by email
  const { data: clinicProfile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', (await supabase.auth.admin?.listUsers())?.data?.users
      ?.find((u: any) => u.email === body.clinic_email)?.id || '')
    .maybeSingle()

  // Use RPC to get org_id from email
  const { data: clinicOrg } = await supabase.rpc('get_org_id_by_email', {
    p_email: body.clinic_email
  })

  const { data: packet, error } = await supabase
    .from('sp_installation_packets')
    .insert({
      sp_org_id: profile?.org_id,
      clinic_org_id: clinicOrg || null,
      clinic_email: body.clinic_email,
      equipment_data: {
        manufacturer: body.manufacturer,
        model: body.model,
        serial_number: body.serial_number,
        type: body.type,
        modality: body.modality,
        purchase_date: body.purchase_date,
        warranty_expiry_date: body.warranty_expiry_date,
        room_location: body.room_location,
        device_type: 'x-ray_machine'
      },
      calendar_events: body.calendar_events || [],
      status: 'pending'
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ status: 'sent', packet })
}