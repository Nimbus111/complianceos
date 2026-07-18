import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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

    const { task_id, completed } = await request.json()
    const admin = getAdmin()

    if (completed) {
      await admin.from('user_task_completions').upsert({
        org_id: profile.org_id,
        task_id,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'org_id, task_id' })
    } else {
      await admin.from('user_task_completions')
        .delete().eq('org_id', profile.org_id).eq('task_id', task_id)
    }

    await checkAndAwardBadges(admin, profile.org_id)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

async function checkAndAwardBadges(admin: any, orgId: string) {
  const [{ data: ktsItems }, { count: ktsCompleted }, { data: allTasks }, { data: completions }, { data: badges }, { data: earnedBadges }] = await Promise.all([
    admin.from('keys_to_success').select('id'),
    admin.from('compliance_checklists').select('*', { count: 'exact', head: true }).eq('org_id', orgId).eq('completed', true),
    admin.from('facility_tasks').select('id'),
    admin.from('user_task_completions').select('task_id').eq('org_id', orgId),
    admin.from('badges').select('*'),
    admin.from('user_badges').select('badge_id').eq('org_id', orgId),
  ])

  const ktsPct = ktsItems?.length ? Math.round(((ktsCompleted || 0) / ktsItems.length) * 100) : 0
  const taskPct = allTasks?.length ? Math.round(((completions?.length || 0) / allTasks.length) * 100) : 0
  const earnedIds = new Set((earnedBadges || []).map((b: any) => b.badge_id))

  for (const badge of (badges || [])) {
    if (earnedIds.has(badge.id)) continue
    let award = false
    if (badge.unlock_condition === 'checklist_50' && ktsPct >= 50) award = true
    if (badge.unlock_condition === 'checklist_90' && ktsPct >= 90) award = true
    if (badge.unlock_condition === 'fully_equipped' && taskPct >= 100 && ktsPct >= 50) award = true
    if (award) await admin.from('user_badges').insert({ org_id: orgId, badge_id: badge.id }).catch(() => {})
  }
}