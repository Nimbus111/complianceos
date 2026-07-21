import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function RequirementRow({ label, value, detail }: { label: string; value: any; detail?: string }) {
  const isRequired = value === true
  const isNotRequired = value === false
  const isText = typeof value === 'string' && value

  if (!isRequired && !isText) return null

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 20px', borderBottom: '1px solid #eef3fb' }}>
      <span style={{ fontSize: '13px', color: '#1e1c1a' }}>{label}</span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
        {isRequired && (
          <span style={{ fontSize: '11px', fontWeight: '500', color: '#2d6a4f', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '20px', padding: '2px 10px' }}>
            ✓ Required
          </span>
        )}
        {isText && (
          <span style={{ fontSize: '11px', fontWeight: '500', color: '#0d2d5e', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '2px 10px' }}>
            {value}
          </span>
        )}
        {detail && <span style={{ fontSize: '11px', color: '#a8a39c' }}>{detail}</span>}
      </div>
    </div>
  )
}

export default async function GuidePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) redirect('/onboarding')

  const { data: org } = await supabase
    .from('organizations').select('*').eq('id', profile.org_id).single()

  const modalities: string[] = org?.modality_names || []
  const facilityState: string = org?.facility_state || ''
  const facilityType: string = org?.facility_type_name || ''

  const [{ data: regs }, { data: forms }, { data: updates }] = await Promise.all([
    supabase.from('regulations').select('*')
      .eq('state_name', facilityState)
      .or(modalities.length > 0
        ? modalities.map(m => `modality_name.ilike.%${m}%`).join(',')
        : 'modality_name.ilike.%%')
      .limit(20),
    supabase.from('state_forms').select('*')
      .eq('state', facilityState)
      .order('document_type'),
    supabase.from('state_updates').select('*')
      .eq('state_name', facilityState)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  // Aggregate boolean requirements across all modality records
  const agg = {
    facility_registration_req: regs?.some(r => r.facility_registration_req) || false,
    machine_registration_req: regs?.some(r => r.machine_registration_req) || false,
    rso_req: regs?.some(r => r.rso_req) || false,
    rpp_req: regs?.some(r => r.rpp_req) || false,
    rpp_annual_review: regs?.some(r => r.rpp_annual_review) || false,
    dosimetry_monitoring: regs?.some(r => r.dosimetry_monitoring) || false,
    qa_testing: regs?.some(r => r.qa_testing) || false,
    lead_aprons_req: regs?.some(r => r.lead_aprons_req) || false,
    posting_requirements: regs?.some(r => r.posting_requirements) || false,
    registration_renewal_frequency: regs?.find(r => r.registration_renewal_frequency)?.registration_renewal_frequency || null,
    qa_testing_frequency: regs?.find(r => r.qa_testing_frequency)?.qa_testing_frequency || null,
    equipment_performance_eval: regs?.some(r => r.equipment_performance_eval) || false,
    equipment_training_records: regs?.some(r => r.equipment_training_records) || false,
    floor_plan_req: regs?.some(r => r.floor_plan_req) || false,
    digital_receptor_qa: regs?.some(r => r.digital_receptor_qa) || false,
    device_stored_securely: regs?.some(r => r.device_stored_securely) || false,
    business_license_req: regs?.some(r => r.business_license_req) || false,
    annual_ceu_records: regs?.some(r => r.annual_ceu_records) || false,
    dosimetry_notes: regs?.find(r => r.dosimetry_notes)?.dosimetry_notes || null,
    imaging_plate_requirements: regs?.find(r => r.imaging_plate_requirements)?.imaging_plate_requirements || null,
    facility_renewal_timeline: regs?.find(r => r.facility_renewal_timeline)?.facility_renewal_timeline || null,
  }

  const severityStyle = (s: string) => {
    if (s === 'urgent') return { color: '#931621', bg: '#fefafb', border: '#f5c6c9', label: 'Urgent' }
    if (s === 'warning') return { color: '#9a3510', bg: '#fff6e8', border: '#f0d4a0', label: 'Important' }
    return { color: '#1a5fa8', bg: '#e8f3fb', border: '#c2ddf0', label: 'Info' }
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', marginLeft: '10px' }}>ComplianceOS</span>
        </div>
        <a href="/dashboard" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</a>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>
            {facilityState} Compliance Reference
          </h1>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#0d2d5e', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '2px 10px' }}>{org?.name}</span>
            {facilityType && <span style={{ fontSize: '11px', color: '#0d2d5e', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '2px 10px' }}>{facilityType}</span>}
            {modalities.map(m => (
              <span key={m} style={{ fontSize: '11px', color: '#0d2d5e', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '2px 10px' }}>{m}</span>
            ))}
          </div>
        </div>

        {/* BLOCK 1: Requirements Grid */}
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '14px 20px', background: '#0d2d5e' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#fff', margin: 0 }}>Requirements overview</p>
            <p style={{ fontSize: '11px', color: '#8bb4d4', margin: '2px 0 0' }}>All requirements that apply to your facility based on state, facility type, and modalities</p>
          </div>

          {!regs || regs.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#a8a39c' }}>No regulation data found for this combination.</p>
              <a href="/" style={{ fontSize: '12px', color: '#1a5fa8', textDecoration: 'none' }}>Search compliance requirements →</a>
            </div>
          ) : (
            <div>
              {agg.equipment_performance_eval &&
              <div style={{ margin: '0 0 16px', background: '#fefafb', border: '2px solid #931621', borderRadius: '10px', padding: '14px 18px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#931621', marginBottom: '5px' }}>
                    Equipment Performance Evaluation Required
                  </p>
                  <p style={{ fontSize: '13px', color: '#1e1c1a', lineHeight: '1.7', margin: 0 }}>
                    {facilityState} requires a qualified medical physicist perform an Equipment Performance Evaluation (EPE) upon installation, after major repairs, and annually for most radiographic equipment. Schedule your physicist and retain the written report on-site.
                  </p>
                </div>
              </div>
            }
            <RequirementRow label="Facility registration" value={agg.facility_registration_req}
              <RequirementRow label="Machine registration" value={agg.machine_registration_req} />
              <RequirementRow label="Radiation Safety Officer (RSO)" value={agg.rso_req} />
              <RequirementRow label="Radiation Protection Program (RPP/RSP)" value={agg.rpp_req} />
              <RequirementRow label="Annual RPP review" value={agg.rpp_annual_review} />
              <RequirementRow label="Dosimetry / personnel monitoring" value={agg.dosimetry_monitoring} />
              <RequirementRow label="Equipment QA testing" value={agg.qa_testing} detail={agg.qa_testing_frequency || undefined} />
              <RequirementRow label="Lead aprons" value={agg.lead_aprons_req} />
              <RequirementRow label="Radiation safety posting" value={agg.posting_requirements} />
              {agg.registration_renewal_frequency && (
                <RequirementRow label="Registration renewal frequency" value={agg.registration_renewal_frequency} />
              )}
              {agg.facility_renewal_timeline && (
                <RequirementRow label="Renewal timeline" value={agg.facility_renewal_timeline} />
              )}
              <RequirementRow label="Floor plan required" value={agg.floor_plan_req} />
              <RequirementRow label="Business license required" value={agg.business_license_req} />
              <RequirementRow label="Equipment training records" value={agg.equipment_training_records} />
              <RequirementRow label="Annual CEU records required" value={agg.annual_ceu_records} />
              <RequirementRow label="Digital receptor QA" value={agg.digital_receptor_qa} />
              <RequirementRow label="Device stored securely" value={agg.device_stored_securely} />
              {agg.imaging_plate_requirements && (
                <RequirementRow label="Imaging plate requirements" value={agg.imaging_plate_requirements} />
              )}
              {agg.dosimetry_notes && (
                <RequirementRow label="Dosimetry notes" value={agg.dosimetry_notes} />
              )}
            </div>
          )}
        </div>

        {/* BLOCK 2: Modality-by-Modality Rules */}
        {regs && regs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: '500', color: '#a8a39c', textTransform: 'uppercase', letterSpacing: '.08em', margin: 0 }}>Detailed rules by modality</p>
            {regs.map(reg => (
              <div key={reg.id} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '12px 20px', background: '#f4f7fb', borderBottom: '1px solid #eef3fb', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e' }}>{reg.modality_name}</span>
                  {reg.facility_type_name && (
                    <span style={{ fontSize: '10px', color: '#827d76', background: '#e8e6e2', borderRadius: '20px', padding: '1px 8px' }}>{reg.facility_type_name}</span>
                  )}
                </div>
                <div style={{ padding: '8px 0' }}>
                  {[
                    ['Registration notes', reg.registration_notes],
                    ['QA requirements', reg.qa_requirements_notes],
                    ['Personnel requirements', reg.personnel_requirements_notes],
                    ['Safety requirements', reg.safety_requirements_notes],
                    ['Plain language summary', reg.plain_language_summary],
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label} style={{ padding: '10px 20px', borderBottom: '1px solid #eef3fb' }}>
                      <p style={{ fontSize: '10px', fontWeight: '500', color: '#a8a39c', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '4px' }}>{label}</p>
                      <p style={{ fontSize: '13px', color: '#1e1c1a', lineHeight: '1.7', margin: 0 }}>{value}</p>
                    </div>
                  ))}
                  {reg.source_url && (
                    <div style={{ padding: '10px 20px' }}>
                      <a href={reg.source_url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: '#1a5fa8', textDecoration: 'none', fontWeight: '500' }}>
                        View source regulation →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BLOCK 3: Official State Documents */}
        {forms && forms.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef3fb' }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>Official {facilityState} documents</p>
            </div>
            <div style={{ padding: '8px 0' }}>
              {forms.slice(0, 8).map(form => (
                <div key={form.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid #eef3fb' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: '0 0 2px' }}>{form.form_name || form.document_name}</p>
                    {form.document_type && <p style={{ fontSize: '11px', color: '#a8a39c', margin: 0 }}>{form.document_type}</p>}
                  </div>
                  {form.form_url && (
                    <a href={form.form_url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '12px', fontWeight: '500', color: '#fff', background: '#0d2d5e', padding: '5px 14px', borderRadius: '6px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '12px' }}>
                      Open →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BLOCK 4: State Updates */}
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef3fb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>{facilityState} regulatory updates</p>
              <p style={{ fontSize: '11px', color: '#a8a39c', margin: '2px 0 0' }}>Posted by The Radiology Coach as state regulations change</p>
            </div>
          </div>

          {!updates || updates.length === 0 ? (
            <div style={{ padding: '24px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#a8a39c', margin: 0 }}>No updates posted yet for {facilityState}. Check back as regulations evolve.</p>
            </div>
          ) : (
            <div style={{ padding: '8px 0' }}>
              {updates.map(update => {
                const s = severityStyle(update.severity || 'info')
                return (
                  <div key={update.id} style={{ padding: '14px 20px', borderBottom: '1px solid #eef3fb' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '500', color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: '20px', padding: '2px 8px', whiteSpace: 'nowrap', marginTop: '2px' }}>
                        {s.label}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                          <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>{update.title}</p>
                          <span style={{ fontSize: '11px', color: '#a8a39c', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {new Date(update.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#1e1c1a', lineHeight: '1.7', margin: 0 }}>{update.content}</p>
                        {update.effective_date && (
                          <p style={{ fontSize: '11px', color: '#827d76', marginTop: '4px' }}>
                            Effective: {new Date(update.effective_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                        {update.source_url && (
                          <a href={update.source_url} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: '11px', color: '#1a5fa8', textDecoration: 'none', marginTop: '4px', display: 'inline-block' }}>
                            View official source →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* AI CTA */}
        <div style={{ background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '10px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '13px', color: '#0d2d5e', flex: 1, margin: 0 }}>
            Have a question about any of these requirements for <strong>{facilityState}</strong>?
          </p>
          <a href="/dashboard/ai" style={{ fontSize: '12px', fontWeight: '500', color: '#fff', background: '#0d2d5e', padding: '7px 16px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Ask AI assistant →
          </a>
        </div>

      </div>
    </div>
  )
}