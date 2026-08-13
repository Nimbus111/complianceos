import { NextResponse } from 'next/server'

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID!
const AIRTABLE_KEY = process.env.AIRTABLE_PAT!

export async function GET() {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/State%20Forms?maxRecords=1`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_KEY}` } })
  const data = await res.json()
  const fields = data.records?.[0]?.fields || {}
  return NextResponse.json({
    status: res.status,
    fieldNames: Object.keys(fields),
    sample: fields
  })
}