import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID!
const AIRTABLE_KEY = process.env.AIRTABLE_API_KEY!
const getStr = (v: any): string => (v != null ? String(v).trim() : '')

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
  const records = await fetchAll('States')

  const rows = records.map((r: any) => {
    const f = r.fields
    return {
      airtable_id: r.id,
      state_name: getStr(f['Name'] || f['State']),
      program_name: getStr(f['Program Name'] || f['Agency Name'] || f['Department']),
      website: getStr(f['Website'] || f['State Website'] || f['URL']),
      address: getStr(f['Address'] || f['Mailing Address']),
      phone: getStr(f['Phone'] || f['Phone Number']),
      updated_at: new Date().toISOString()
    }
  }).filter(r => r.state_name)

  const { error } = await supabase.from('states_directory')
    .upsert(rows, { onConflict: 'airtable_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ synced: rows.length })
}