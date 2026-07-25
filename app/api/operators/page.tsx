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

    if (body._action === 'save_operator') {
      const { _action, ...op } = body
      if (op.id) {
        await a.from('xray_operators').update(op).eq('id', op.id).eq('org_id', profile.org_id)
      } else {
        await a.from('xray_operators').insert({ ...op, org_id: profile.org_id })
      }
    } else if (body._action === 'delete_operator') {
      await a.from('xray_operators').delete().eq('id', body.id).eq('org_id', profile.org_id)
    } else if (body._action === 'save_document') {
      const { _action, ...doc } = body
      await a.from('operator_documents').insert({ ...doc, org_id: profile.org_id })
    } else if (body._action === 'delete_document') {
      await a.from('operator_documents').delete().eq('id', body.id).eq('org_id', profile.org_id)
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}