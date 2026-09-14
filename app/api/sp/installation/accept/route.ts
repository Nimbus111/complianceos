import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()

  const { packet_id } = await request.json()

  // Get the packet and verify ownership
  const { data: packet } = await supabase
    .from('sp_installation_packets')
    .select('*')
    .eq('id', packet_id)
    .eq('clinic_org_id', profile?.org_id)
    .single()

  if (!packet) return NextResponse.json({ error: 'Packet not found' }, { status: 404 })

  const eq = packet.equipment_data

  // Create equipment record
  const { data: equipment, error: eqError } = await supabase
    .from('equipment')
    .insert({
      org_id: profile?.org_id,
      manufacturer: eq.manufacturer,
      model: eq.model,
      serial_number: eq.serial_number,
      type: eq.type,
      room_location: eq.room_location || null,
      purchase_date: eq.purchase_date || null,
      warranty_expiry_date: eq.warranty_expiry_date || null,
      device_type: 'x-ray_machine'
    })
    .select()
    .single()

  if (eqError) return NextResponse.json({ error: eqError.message }, { status: 500 })

  // Create calendar events
  if (packet.calendar_events?.length > 0) {
    const events = packet.calendar_events.map((ev: any) => ({
      org_id: profile?.org_id,
      event_type: ev.type,
      title: ev.title,
      due_date: ev.date,
      category: ev.type === 'calibration' ? 'machine_calibration'
        : ev.type === 'renewal' ? 'equipment_renewal'
        : ev.type === 'qa' ? 'digital_qa'
        : 'machine_calibration',
      notes: `Pre-filled by service provider during installation`
    }))

    await supabase.from('compliance_calendar').insert(events)
  }

  // Mark packet as accepted
  await supabase.from('sp_installation_packets')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', packet_id)

  return NextResponse.json({ status: 'accepted', equipment_id: equipment?.id })
}