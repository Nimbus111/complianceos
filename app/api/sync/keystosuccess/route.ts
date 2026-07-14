import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const getStr = (val: any): string | null => {
  if (!val) return null
  if (typeof val === 'object') return null
  return String(val).trim() || null
}

export async function GET() {
  try {
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const records: any[] = []
    let offset: string | undefined

    do {
      const url = new URL(
        `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Keys%20to%20Success`
      )
      url.searchParams.set('pageSize', '100')
      url.searchParams.set('view', 'Grid view') 
      if (offset) url.searchParams.set('offset', offset)

      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_PAT}` },
        cache: 'no-store',
      })

      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      records.push(...data.records)
      offset = data.offset
    } while (offset)

    let synced = 0
    let errors = 0

    for (let i = 0; i < records.length; i++) {
  const record = records[i]
  const f = record.fields
  const { error } = await admin
    .from('keys_to_success')
    .upsert({
      airtable_record_id: record.id,
      topic: getStr(f['Name']),
      notes_text: getStr(f['Notes']),
      youtube_url: getStr(f['Video']),
      sort_order: i + 1,
    }, { onConflict: 'airtable_record_id' })
  if (error) { console.error(error.message); errors++ }
  else synced++
}

    return NextResponse.json({
      success: true, synced, errors,
      timestamp: new Date().toISOString()
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}