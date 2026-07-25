import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const admin = () => createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 })

    const body = await request.json()
    const a = admin()

    if (body._action === 'upsert') {
      const { _action, ...procedure } = body
      if (procedure.id) {
        await a.from('equipment_qa').update(procedure).eq('id', procedure.id).eq('org_id', profile.org_id)
      } else {
        await a.from('equipment_qa').insert({ ...procedure, org_id: profile.org_id })
      }
    } else if (body._action === 'delete') {
      await a.from('equipment_qa').delete().eq('id', body.id).eq('org_id', profile.org_id)
    } else if (body._action === 'copy') {
      const { source_equipment_id, target_equipment_id } = body
      const { data: source } = await a.from('equipment_qa').select('*').eq('equipment_id', source_equipment_id).eq('org_id', profile.org_id)
      if (source?.length) {
        const copies = source.map(({ id, equipment_id, ...rest }: any) => ({
          ...rest,
          equipment_id: target_equipment_id,
          org_id: profile.org_id,
          last_performed: null,
          next_due: null,
        }))
        await a.from('equipment_qa').insert(copies)
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}