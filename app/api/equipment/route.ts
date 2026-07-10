import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const getAdmin = () => createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 })

    const body = await request.json()
    const admin = getAdmin()

    if (body.resource_type === 'lead_apron') {
      const { data, error } = await admin
        .from('lead_aprons')
        .insert({
          org_id: profile.org_id,
          item_type: body.item_type,
          id_tag: body.id_tag || null,
          manufacturer: body.manufacturer || null,
          size: body.size || null,
          condition: body.condition,
          purchase_date: body.purchase_date || null,
          last_inspection_date: body.last_inspection_date || null,
          notes: body.notes || null,
        })
        .select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ data })
    }

    const { data, error } = await admin
      .from('equipment')
      .insert({
        org_id: profile.org_id,
        manufacturer: body.manufacturer,
        model: body.model,
        type: body.type || null,
        serial_number: body.serial_number || null,
        room_location: body.room_location || null,
        facility_registration_number: body.facility_registration_number || null,
        machine_registration_number: body.machine_registration_number || null,
        purchase_date: body.purchase_date || null,
        status: body.status || 'active',
        notes: body.notes || null,
      })
      .select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const admin = getAdmin()
    const table = body.resource_type === 'lead_apron' ? 'lead_aprons' : 'equipment'

    const { error } = await admin.from(table).delete().eq('id', body.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }