import { NextResponse } from 'next/server'

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID!
const AIRTABLE_KEY = process.env.AIRTABLE_PAT!

export async function GET() {
  const results: any = {
    baseId: AIRTABLE_BASE ? AIRTABLE_BASE.substring(0, 10) + '...' : 'NOT SET',
    hasApiKey: !!AIRTABLE_KEY,
    keyPrefix: AIRTABLE_KEY ? AIRTABLE_KEY.substring(0, 12) + '...' : 'NOT SET',
    tests: {}
  }

  const tables = ['States', 'State Contacts', 'State Forms', 'X-ray Service Provider State Rules']

  for (const table of tables) {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(table)}?maxRecords=1`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_KEY}` } })
    const data = await res.json()
    results.tests[table] = {
      status: res.status,
      error: data.error || null,
      records: data.records?.length || 0,
      fields: data.records?.[0]?.fields ? Object.keys(data.records[0].fields).slice(0, 5) : []
    }
  }

  return NextResponse.json(results)
}