import { createClient as createAdmin } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic' 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function buildText(r: any): string {
  return [
    `State: ${r.state_name}`,
    `Modality: ${r.modality_name}`,
    `Facility type: ${r.facility_type_name}`,
    r.plain_language_summary,
    r.registration_notes && `Registration: ${r.registration_notes}`,
    r.renewal_timeline && `Renewal: ${r.renewal_timeline}`,
    r.dosimetry_notes && `Dosimetry: ${r.dosimetry_notes}`,
    r.lead_apron_notes && `Lead aprons: ${r.lead_apron_notes}`,
    r.service_notes && `QA and service: ${r.service_notes}`,
    r.shielding_expectations && `Shielding: ${r.shielding_expectations}`,
    r.pregnancy_protocols && `Pregnancy protocols: ${r.pregnancy_protocols}`,
    r.operator_credentials && `Operator credentials: ${r.operator_credentials}`,
    r.notify_state_timeframe && `Notification timeframe: ${r.notify_state_timeframe}`,
    r.notify_remove_unit && `Equipment removal: ${r.notify_remove_unit}`,
    r.facility_registration_req && `Facility registration: Required`,
    r.dosimetry_monitoring && `Dosimetry monitoring: Required`,
    r.qa_testing && `QA testing: Required`,
    r.shielding_plan_req && `Shielding plan: Required`,
    r.annual_renewal && `Annual renewal: Required`,
    r.equipment_training_records && `Training records: Required`,
    r.retain_service_docs && `Service documentation: Required`,
  ].filter(Boolean).join('\n')
}

export async function GET() {
  try {
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const startTime = Date.now()
    let processed = 0

    while (Date.now() - startTime < 7000) {
      const { data: batch } = await admin
        .from('regulations')
        .select('id, state_name, modality_name, facility_type_name, plain_language_summary, registration_notes, renewal_timeline, dosimetry_notes, lead_apron_notes, service_notes, shielding_expectations, pregnancy_protocols, operator_credentials, notify_state_timeframe, notify_remove_unit, facility_registration_req, dosimetry_monitoring, qa_testing, shielding_plan_req, annual_renewal, equipment_training_records, retain_service_docs')
        .is('embedding', null)
        .limit(20)

      if (!batch || batch.length === 0) break

      const texts = batch.map(buildText)

      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
      })

      await Promise.all(
        batch.map((reg, i) =>
          admin.from('regulations')
            .update({ embedding: embeddingResponse.data[i].embedding })
            .eq('id', reg.id)
        )
      )

      processed += batch.length
    }

    const { count: remaining } = await admin
      .from('regulations')
      .select('*', { count: 'exact', head: true })
      .is('embedding', null)

    return NextResponse.json({
      success: true,
      processed,
      remaining: remaining || 0,
      done: remaining === 0,
      timestamp: new Date().toISOString()
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}