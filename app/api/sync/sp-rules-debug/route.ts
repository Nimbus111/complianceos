import { NextResponse } from 'next/server'

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID!
const AIRTABLE_KEY = process.env.AIRTABLE_API_KEY!

export async function GET() {
  const res = await fetch(
    `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE}/tables`,
    { headers: { Authorization: `Bearer ${AIRTABLE_KEY}` } }
  )
  const data = await res.json()
  const tableNames = (data.tables || []).map((t: any) => t.name)
  return NextResponse.json({ tableNames })
}