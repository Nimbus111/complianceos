import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID!
const AIRTABLE_KEY = process.env.AIRTABLE_PAT!

const getStr = (v: any): string => (v != null ? String(v).trim() : '')
const getLinked = (v: any): string => {
  if (!v) return ''
  if (typeof v === 'string') return v
  if (Array.isArray(v)) { const f = v[0]; return typeof f === 'string' ? f : f?.name || '' }
  return ''
}

async function fetchAll(table: string) {
  const rows: any[] = []
  let offset: string | undefined
  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(table)}`)
    if (offset) url.searchParams.set('offset', offset)
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${AIRTABLE_KEY}` } })
    const data = await res.json()
    rows.push(...(data.records || []))
    offset = data.offset
  } while (offset)
  return rows
}

export async function GET() {
  const supabase = await createClient()
  const records = await fetchAll('State Forms')

  const rows = records.map((r: any) => {
    const f = r.fields
    return {
      airtable_id: r.id,
      state_name: getLinked(f['State']),
      form_name: getStr(f['Name']),
      form_link: getStr(f['Form Link']),
      classification: getStr(f['Classification']),
      form_type: getStr(f['Form Type']),
      updated_at: new Date().toISOString()
    }
  }).filter(r => r.state_name)

  const { error } = await supabase.from('state_forms')
    .upsert(rows, { onConflict: 'airtable_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ synced: rows.length })
}