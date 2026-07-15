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

    if (body.resource_type === 'pacs') {
      const { data, error } = await admin
        .from('pacs_systems')
        .insert({
          org_id: profile.org_id,
          nickname: body.nickname,
          system_type: body.system_type || 'pacs',
          url: body.url || null,
          port: body.port || null,
          ae_title: body.ae_title || null,
          username: body.username || null,
          notes: body.notes || null,
        })
        .select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ data })
    }

    const { data, error } = await admin
      .from('equipment_contacts')
      .insert({
        org_id: profile.org_id,
        equipment_id: body.equipment_id || null,
        contact_type: body.contact_type,
        company_name: body.company_name || null,
        contact_name: body.contact_name || null,
        phone_primary: body.phone_primary || null,
        phone_support: body.phone_support || null,
        email: body.email || null,
        website: body.website || null,
        account_number: body.account_number || null,
        contract_expiry: body.contract_expiry || null,
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

    const { id, resource_type } = await request.json()
    const admin = getAdmin()
    const table = resource_type === 'pacs' ? 'pacs_systems' : 'equipment_contacts'

    const { error } = await admin.from(table).delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}