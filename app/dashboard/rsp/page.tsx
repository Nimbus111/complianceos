'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
function generateRPP(d: any): string {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const eqRows = (d.equipment || []).map((e: any) =>
    `<tr><td>${e.manufacturer} ${e.model}</td><td>${e.serial_number || '—'}</td><td>${e.room_location || '—'}</td><td>${e.machine_registration_number || e.facility_registration_number || '—'}</td></tr>`
  ).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Radiation Protection Program — ${d.facilityName}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:11pt;color:#333;margin:0;padding:0}
  .page{max-width:750px;margin:0 auto;padding:40px}
  .cover{text-align:center;padding:80px 40px;border-bottom:2px solid #0d2d5e;margin-bottom:40px}
  .cover h1{font-size:22pt;color:#0d2d5e;margin-bottom:10px;text-transform:uppercase;letter-spacing:2px}
  .cover h2{font-size:15pt;color:#1a5fa8;margin-bottom:20px}
  .cover .meta{font-size:11pt;color:#555;line-height:2.2}
  .badge{display:inline-block;background:#0d2d5e;color:#fff;font-size:9pt;padding:4px 16px;border-radius:4px;margin-bottom:20px}
  h2.s{font-size:13pt;color:#0d2d5e;border-bottom:1.5px solid #c2ddf0;padding-bottom:6px;margin-top:32px}
  h3{font-size:11pt;color:#1a5fa8;margin-top:16px}
  p{line-height:1.75;margin-bottom:10px}
  table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:10pt}
  th{background:#0d2d5e;color:#fff;padding:8px 10px;text-align:left}
  td{padding:7px 10px;border:1px solid #e8e6e2}
  tr:nth-child(even) td{background:#f4f7fb}
  .box{background:#f4f7fb;border:1px solid #c2ddf0;border-radius:6px;padding:14px 16px;margin-bottom:14px}
  .sig-block{border:1px solid #c2ddf0;border-radius:6px;padding:20px;margin-top:16px}
  .sig-line{border-bottom:1px solid #333;margin-top:28px;margin-bottom:4px}
  .sig-lbl{font-size:9pt;color:#827d76}
  .sig-row{display:flex;gap:40px;margin-top:16px}
  .sig-row>div{flex:1}
  .pb{page-break-before:always}
  .footer{text-align:center;font-size:9pt;color:#a8a39c;border-top:1px solid #e8e6e2;margin-top:40px;padding-top:16px}
  @media print{body{font-size:10pt}.page{padding:20px}}
</style>
</head>
<body><div class="page">
<div class="cover">
  <div class="badge">The Radiology Coach ComplianceOS</div>
  <h1>Radiation Protection Program</h1>
  <h2>${d.facilityName}</h2>
  <div class="meta">
    <div><strong>Facility Type:</strong> ${d.facilityType}</div>
    <div><strong>State:</strong> ${d.facilityState}</div>
    <div><strong>Radiation Safety Officer:</strong> ${d.rsoName}</div>
    <div><strong>Effective Date:</strong> ${today}</div>
    <div><strong>Review Frequency:</strong> Annual</div>
  </div>
</div>
<h2 class="s">Table of Contents</h2>
<table>
  <tr><td>1.</td><td>Regulatory Framework and Purpose</td></tr>
  <tr><td>2.</td><td>ALARA Program</td></tr>
  <tr><td>3.</td><td>Roles and Responsibilities</td></tr>
  <tr><td>4.</td><td>Equipment Description and Maintenance</td></tr>
  <tr><td>5.</td><td>Dosimetry Monitoring Program</td></tr>
  <tr><td>6.</td><td>Pregnant Patient Protocols</td></tr>
  <tr><td>7.</td><td>Pregnant Employee Protocols</td></tr>
  <tr><td>8.</td><td>Minor Patients Policy</td></tr>
  <tr><td>9.</td><td>Operator Training Program</td></tr>
  <tr><td>10.</td><td>Equipment Quality Assurance</td></tr>
  <tr><td>11.</td><td>Record Keeping Requirements</td></tr>
  <tr><td>12.</td><td>Incident Reporting</td></tr>
  <tr><td>13.</td><td>Lead Apron Program</td></tr>
  <tr><td>14.</td><td>Written Safety Procedures</td></tr>
  <tr><td>15.</td><td>Annual Compliance Checklist</td></tr>
</table>
<div class="pb"></div>
<h2 class="s">Section 1: Regulatory Framework and Purpose</h2>
<p>This Radiation Protection Program (RPP) has been prepared for <strong>${d.facilityName}</strong>, a ${d.facilityType} facility located in ${d.facilityState}. This program establishes policies and procedures for the safe use of ionizing radiation equipment in compliance with applicable ${d.facilityState} state and federal regulations.</p>
<p>This program is reviewed at least annually by the Radiation Safety Officer. All persons who operate x-ray equipment at this facility are required to be familiar with and follow the procedures outlined in this program. This RPP shall be updated when there are changes to equipment, personnel, procedures, or applicable regulations.</p>
<h2 class="s">Section 2: ALARA Program</h2>
<p>It is the policy of <strong>${d.facilityName}</strong> to maintain all radiation exposures As Low As Reasonably Achievable (ALARA). This principle applies to patients, employees, and members of the general public.</p>
<p><strong>Time:</strong> Minimize exposure time through efficient technique selection and proper positioning to reduce repeat exposures.</p>
<p><strong>Distance:</strong> Operators must stand behind a protective barrier or at least 6 feet from the source during all exposures.</p>
<p><strong>Shielding:</strong> Use appropriate patient shielding (lead aprons, thyroid shields) and ensure facility shielding meets ${d.facilityState} requirements. The RSO shall review radiation safety practices annually.</p>
<h2 class="s">Section 3: Roles and Responsibilities</h2>
<div class="box">
  <strong>Radiation Safety Officer (RSO)</strong><br>
  Name: ${d.rsoName}<br>Email: ${d.rsoEmail}<br>Phone: ${d.rsoPhone || 'On file'}
  ${d.backupRsoName ? `<br><br><strong>Backup RSO:</strong> ${d.backupRsoName}${d.backupRsoPhone ? ` · ${d.backupRsoPhone}` : ''}` : ''}
</div>
<p>The RSO is responsible for oversight of all radiation safety activities; maintaining this RPP; ensuring all operators are trained and credentialed per ${d.facilityState} requirements; conducting annual program reviews; and ensuring equipment registrations are current.</p>
<p>All x-ray operators shall follow all procedures in this RPP; use proper technique to minimize repeat exposures; apply patient shielding appropriately; and report any equipment malfunctions or incidents to the RSO immediately.</p>
${d.dealerName ? `<div class="box"><strong>X-Ray Service Provider:</strong> ${d.dealerName}${d.dealerPhone ? ` · ${d.dealerPhone}` : ''}</div>` : ''}
<h2 class="s">Section 4: Equipment Description and Maintenance</h2>
${(d.equipment || []).length > 0 ? `<table><tr><th>Equipment</th><th>Serial Number</th><th>Location</th><th>Registration #</th></tr>${eqRows}</table>` : '<p>Equipment details to be added upon installation and registration.</p>'}
<p>All equipment shall receive preventive maintenance per manufacturer recommendations. Service records shall be retained per ${d.facilityState} regulations. Equipment that is malfunctioning shall not be used until repaired and re-tested.</p>
<h2 class="s">Section 5: Dosimetry Monitoring Program</h2>
${d.dosimetry ? `<p>Personnel dosimetry monitoring is provided by <strong>${d.dosimetryProvider || 'a licensed dosimetry provider'}</strong>, exchanged <strong>${d.dosimetryFrequency}</strong>. Dosimetry records are maintained per ${d.facilityState} regulations. Workers shall wear badges at collar level outside the lead apron during all radiation activities.</p>` : `<p>Formal occupational dosimetry monitoring has been evaluated for this facility. Based on current workload, equipment type, and shielding, formal monitoring is not required at this time per ${d.facilityState} regulations. This determination shall be reviewed annually.</p>`}
<h2 class="s">Section 6: Pregnant Patient Protocols</h2>
<p>Prior to any elective x-ray examination, female patients of childbearing age (10–55 years) shall be asked whether they are or may be pregnant. If pregnant or possibly pregnant: the clinical need shall be evaluated; if clinically necessary, appropriate shielding shall be applied; the minimum number of images required shall be taken; patient consent shall be obtained and documented.</p>
<h2 class="s">Section 7: Pregnant Employee Protocols</h2>
<p>Declaration of pregnancy is voluntary and confidential. Upon declaration, the RSO shall review the employee's radiation exposure history, evaluate fetal exposure potential, discuss available options, and monitor fetal dose throughout the declared pregnancy to ensure applicable limits are not exceeded.</p>
<h2 class="s">Section 8: Minor Patients Policy</h2>
<p>Special precautions shall be taken for patients under 18 years of age: use appropriate gonadal and other shielding; minimize the number of exposures; use the lowest technique factors consistent with diagnostic quality; ensure a parent or guardian is present and informed. Pediatric technique charts shall be utilized.</p>
<h2 class="s">Section 9: Operator Training Program</h2>
<p>All x-ray operators shall meet training and credentialing requirements established by ${d.facilityState}. New operators shall be trained on this RPP prior to independent equipment operation. Continuing education requirements shall be met per ${d.facilityState} regulations. Training frequency: <strong>${d.trainingFrequency}</strong>.</p>
<p>The Radiology Coach training resources available at theradiologycoach.com shall be used to supplement operator training and continuing education.</p>
<h2 class="s">Section 10: Equipment Quality Assurance</h2>
<p>QA testing is performed per manufacturer recommendations and ${d.facilityState} requirements. Equipment failing QA shall be taken out of service until repaired and re-tested. QA records shall be maintained for the period required by ${d.facilityState} and made available for inspection.</p>
<h2 class="s">Section 11: Record Keeping Requirements</h2>
<table>
  <tr><th>Record Type</th><th>Retention</th></tr>
  <tr><td>Radiation Protection Program</td><td>Current plus prior versions per state requirement</td></tr>
  <tr><td>Equipment registration certificates</td><td>Duration of ownership plus applicable period</td></tr>
  <tr><td>Equipment service records</td><td>Per ${d.facilityState} regulations</td></tr>
  <tr><td>Dosimetry records</td><td>Per ${d.facilityState} regulations</td></tr>
  <tr><td>Operator training and credentials</td><td>Duration of employment plus applicable period</td></tr>
  <tr><td>QA testing records</td><td>Per ${d.facilityState} regulations</td></tr>
  <tr><td>Incident reports</td><td>Per ${d.facilityState} regulations</td></tr>
</table>
<h2 class="s">Section 12: Incident Reporting</h2>
<p>Any radiation incident, equipment malfunction, or unintended exposure shall be reported immediately to the RSO. The RSO shall investigate and determine whether reporting to ${d.facilityState} regulatory authorities is required. Written incident reports shall be completed and maintained on file.</p>
<h2 class="s">Section 13: Lead Apron and Protective Equipment Program</h2>
<p>Lead aprons and protective equipment shall be inspected at least <strong>${d.apronInspectionFreq}</strong>. Damaged items shall be removed from service immediately. Each apron shall bear a unique ID tag. Inspection records shall be maintained on file.</p>
<h2 class="s">Section 14: Written Safety Procedures</h2>
<p>Posted written safety procedures shall be maintained at each equipment location per ${d.facilityState} requirements, including: safe equipment operation; patient and operator safety precautions; emergency procedures; and RSO contact information. Procedures shall be reviewed annually.</p>
<div class="pb"></div>
<h2 class="s">Section 15: Annual Compliance Checklist</h2>
<table>
  <tr><th>Compliance Item</th><th>Done</th><th>Date</th><th>Notes</th></tr>
  <tr><td>RPP reviewed and updated</td><td>☐</td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td></td></tr>
  <tr><td>Equipment registrations current</td><td>☐</td><td></td><td></td></tr>
  <tr><td>Annual QA testing completed</td><td>☐</td><td></td><td></td></tr>
  <tr><td>Equipment service records current</td><td>☐</td><td></td><td></td></tr>
  <tr><td>Lead apron inspections documented</td><td>☐</td><td></td><td></td></tr>
  <tr><td>Operator credentials verified</td><td>☐</td><td></td><td></td></tr>
  <tr><td>Operator training documented</td><td>☐</td><td></td><td></td></tr>
  <tr><td>Dosimetry program evaluated</td><td>☐</td><td></td><td></td></tr>
  <tr><td>Patient shielding serviceable</td><td>☐</td><td></td><td></td></tr>
  <tr><td>Posted procedures current and visible</td><td>☐</td><td></td><td></td></tr>
  <tr><td>Incident report log reviewed</td><td>☐</td><td></td><td></td></tr>
  <tr><td>State regulatory correspondence reviewed</td><td>☐</td><td></td><td></td></tr>
  <tr><td>Pregnant patient protocols communicated</td><td>☐</td><td></td><td></td></tr>
</table>
<div class="sig-block">
  <p><strong>Annual Review — RSO Certification</strong></p>
  <p style="font-size:10pt;color:#555">I certify that I have reviewed this Radiation Protection Program and that it accurately reflects radiation safety practices at ${d.facilityName}.</p>
  <div class="sig-row"><div><div class="sig-line"></div><div class="sig-lbl">RSO Signature</div></div><div><div class="sig-line"></div><div class="sig-lbl">Date</div></div></div>
  <div class="sig-row"><div><div class="sig-line"></div><div class="sig-lbl">RSO Printed Name</div></div><div><div class="sig-line"></div><div class="sig-lbl">Next Annual Review Due</div></div></div>
</div>
<div class="footer">Generated by The Radiology Coach ComplianceOS · theradiologycoach.com<br>${d.facilityName} · ${d.facilityState} · ${today}</div>
</div></body></html>`
}
export default function RSPBuilderPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [equipment, setEquipment] = useState<any[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const router = useRouter()

  const [facilityName, setFacilityName] = useState('')
  const [facilityType, setFacilityType] = useState('')
  const [facilityState, setFacilityState] = useState('')
  const [rsoName, setRsoName] = useState('')
  const [rsoEmail, setRsoEmail] = useState('')
  const [rsoPhone, setRsoPhone] = useState('')
  const [backupRsoName, setBackupRsoName] = useState('')
  const [backupRsoPhone, setBackupRsoPhone] = useState('')
  const [dealerName, setDealerName] = useState('')
  const [dealerPhone, setDealerPhone] = useState('')
  const [dosimetry, setDosimetry] = useState(false)
  const [dosimetryProvider, setDosimetryProvider] = useState('')
  const [dosimetryFrequency, setDosimetryFrequency] = useState('monthly')
  const [trainingFrequency, setTrainingFrequency] = useState('Annual')
  const [apronInspectionFreq, setApronInspectionFreq] = useState('annually')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase
        .from('profiles').select('org_id').eq('id', user.id).single()
      if (!profile?.org_id) { router.push('/onboarding'); return }

      const { data: org } = await supabase
        .from('organizations').select('*').eq('id', profile.org_id).single()
      if (org) {
        setFacilityName(org.name || '')
        setFacilityType(org.facility_type_name || '')
        setFacilityState(org.facility_state || '')
        setRsoName(org.rso_name || '')
        setRsoEmail(org.rso_email || '')
        setRsoPhone(org.rso_phone || '')
      }

      const { data: eq } = await supabase
        .from('equipment').select('*')
        .eq('org_id', profile.org_id).eq('status', 'active')
      if (eq) { setEquipment(eq); setSelectedEquipment(eq.map((e: any) => e.id)) }
      setLoading(false)
    })
  }, [router])

const handleGenerate = async () => {
  setSaving(true)
  try {
    const selectedEq = equipment.filter(e => selectedEquipment.includes(e.id))
    const html = generateRPP({
      facilityName, facilityType, facilityState,
      rsoName, rsoEmail, rsoPhone,
      backupRsoName, backupRsoPhone,
      equipment: selectedEq,
      dealerName, dealerPhone,
      dosimetry, dosimetryProvider, dosimetryFrequency,
      trainingFrequency, apronInspectionFreq,
    })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) {
      alert('No organization found')
      setSaving(false)
      return
    }

    const { default: html2pdf } = await import('html2pdf.js')

    const container = document.createElement('div')
    container.innerHTML = html
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    document.body.appendChild(container)

    const pdfArrayBuffer = await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      })
      .from(container)
      .outputPdf('arraybuffer')

    document.body.removeChild(container)

    const year = new Date().getFullYear()
    const filename = `Radiation Protection Program — ${facilityName} — ${year}.pdf`
    const storagePath = `${profile.org_id}/rsp_${Date.now()}.pdf`
    const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' })

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, pdfBlob, { contentType: 'application/pdf' })

    if (uploadError) {
      alert('Upload error: ' + uploadError.message)
      setSaving(false)
      return
    }

    const res = await fetch('/api/rsp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storagePath, filename })
    })

    const result = await res.json()
    if (res.ok) {
      router.push('/dashboard/documents')
      router.refresh()
    } else {
      alert(result.error || 'Error saving document')
      setSaving(false)
    }
  } catch (e: any) {
    alert('Error: ' + e.message)
    setSaving(false)
  }
}

  const inp = { width: '100%', height: '38px', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '0 10px', fontSize: '13px', color: '#0d2d5e', background: '#fff', outline: 'none', boxSizing: 'border-box' as const }
  const lbl = { display: 'block', fontSize: '10px', fontWeight: '500' as const, color: '#a8a39c', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.07em' }

  if (loading) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f4f7fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#a8a39c', fontSize: '13px' }}>Loading your facility data...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f4f7fb' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '500', marginLeft: '10px' }}>ComplianceOS</span>
        </div>
        <a href="/dashboard" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</a>
      </nav>

      <div style={{ maxWidth: '620px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[1,2,3,4].map(n => (
              <div key={n} style={{ flex: 1, height: '4px', borderRadius: '2px', background: n <= step ? '#0d2d5e' : '#c2ddf0' }} />
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#a8a39c', marginBottom: '4px' }}>Step {step} of 4</p>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>
            {step === 1 && 'Facility and RSO information'}
            {step === 2 && 'Equipment and service provider'}
            {step === 3 && 'Program settings'}
            {step === 4 && 'Review and generate'}
          </h1>
          <p style={{ fontSize: '13px', color: '#827d76' }}>
            {step === 1 && 'Pre-populated from your facility profile — confirm or edit.'}
            {step === 2 && 'Select equipment covered by this RPP.'}
            {step === 3 && 'Configure your dosimetry and training programs.'}
            {step === 4 && 'Your complete RPP is ready — review and generate.'}
          </p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '16px', padding: '28px' }}>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Facility name</label>
                  <input style={inp} value={facilityName} onChange={e => setFacilityName(e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Facility type</label>
                  <input style={inp} value={facilityType} onChange={e => setFacilityType(e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>State</label>
                  <input style={inp} value={facilityState} onChange={e => setFacilityState(e.target.value)} />
                </div>
              </div>
              <div style={{ borderTop: '1px solid #e8f3fb', paddingTop: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: '500', color: '#0d2d5e', marginBottom: '10px' }}>Radiation Safety Officer</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={lbl}>RSO full name</label>
                    <input style={inp} value={rsoName} onChange={e => setRsoName(e.target.value)} />
                  </div>
                  <div>
                    <label style={lbl}>RSO email</label>
                    <input style={inp} type="email" value={rsoEmail} onChange={e => setRsoEmail(e.target.value)} />
                  </div>
                  <div>
                    <label style={lbl}>RSO phone</label>
                    <input style={inp} type="tel" value={rsoPhone} onChange={e => setRsoPhone(e.target.value)} />
                  </div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #e8f3fb', paddingTop: '12px' }}>
                <p style={{ fontSize: '11px', fontWeight: '500', color: '#0d2d5e', marginBottom: '10px' }}>Backup RSO <span style={{ color: '#a8a39c', fontWeight: '400' }}>(optional)</span></p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={lbl}>Name</label>
                    <input style={inp} placeholder="Optional" value={backupRsoName} onChange={e => setBackupRsoName(e.target.value)} />
                  </div>
                  <div>
                    <label style={lbl}>Phone</label>
                    <input style={inp} placeholder="Optional" value={backupRsoPhone} onChange={e => setBackupRsoPhone(e.target.value)} />
                  </div>
                </div>
              </div>
              <button onClick={() => setStep(2)} disabled={!facilityName || !rsoName}
                style={{ height: '42px', background: (!facilityName || !rsoName) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: (!facilityName || !rsoName) ? 'default' : 'pointer', marginTop: '8px' }}>
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e', marginBottom: '10px' }}>
                  X-ray equipment covered by this RPP
                </p>
                {equipment.length === 0 ? (
                  <div style={{ background: '#fff6e8', border: '1px solid #f0d4a0', borderRadius: '8px', padding: '14px', fontSize: '13px', color: '#9a3510' }}>
                    No equipment in your inventory yet.{' '}
                    <a href="/dashboard/equipment" style={{ color: '#9a3510', fontWeight: '500' }}>Add equipment first</a>
                    {' '}— then return here to build your RPP.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {equipment.map(eq => (
                      <label key={eq.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: `1px solid ${selectedEquipment.includes(eq.id) ? '#0d2d5e' : '#c2ddf0'}`, borderRadius: '8px', cursor: 'pointer', background: selectedEquipment.includes(eq.id) ? '#e8f3fb' : '#fff' }}>
                        <input type="checkbox" checked={selectedEquipment.includes(eq.id)}
                          onChange={() => setSelectedEquipment(prev => prev.includes(eq.id) ? prev.filter(id => id !== eq.id) : [...prev, eq.id])}
                          style={{ width: '15px', height: '15px', accentColor: '#0d2d5e' }} />
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>{eq.manufacturer} {eq.model}</p>
                          <p style={{ fontSize: '11px', color: '#a8a39c', margin: 0 }}>
                            {[eq.serial_number && `S/N: ${eq.serial_number}`, eq.room_location].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ borderTop: '1px solid #e8f3fb', paddingTop: '14px' }}>
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e', marginBottom: '10px' }}>
                  X-ray service provider <span style={{ color: '#a8a39c', fontWeight: '400' }}>(optional)</span>
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={lbl}>Company name</label>
                    <input style={inp} placeholder="Service company name" value={dealerName} onChange={e => setDealerName(e.target.value)} />
                  </div>
                  <div>
                    <label style={lbl}>Phone</label>
                    <input style={inp} placeholder="Phone number" value={dealerPhone} onChange={e => setDealerPhone(e.target.value)} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, height: '42px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Back</button>
                <button onClick={() => setStep(3)} style={{ flex: 2, height: '42px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f4f7fb', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: '0 0 2px' }}>Dosimetry monitoring program</p>
                    <p style={{ fontSize: '11px', color: '#827d76', margin: 0 }}>Do occupationally exposed workers wear dosimetry badges?</p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}>
                    <input type="checkbox" checked={dosimetry} onChange={e => setDosimetry(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#0d2d5e' }} />
                    <span style={{ fontSize: '12px', color: '#0d2d5e', fontWeight: '500' }}>Yes</span>
                  </label>
                </div>
                {dosimetry && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                    <div>
                      <label style={lbl}>Dosimetry provider</label>
                      <input style={inp} placeholder="e.g. Landauer, Mirion" value={dosimetryProvider} onChange={e => setDosimetryProvider(e.target.value)} />
                    </div>
                    <div>
                      <label style={lbl}>Exchange frequency</label>
                      <select style={inp} value={dosimetryFrequency} onChange={e => setDosimetryFrequency(e.target.value)}>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={lbl}>Training frequency</label>
                  <select style={inp} value={trainingFrequency} onChange={e => setTrainingFrequency(e.target.value)}>
                    <option value="Annual">Annual</option>
                    <option value="Bi-annual">Bi-annual</option>
                    <option value="Upon hire and annually">Upon hire and annually</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Lead apron inspection frequency</label>
                  <select style={inp} value={apronInspectionFreq} onChange={e => setApronInspectionFreq(e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semi-annually">Semi-annually</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, height: '42px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Back</button>
                <button onClick={() => setStep(4)} style={{ flex: 2, height: '42px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Continue</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: 'Facility', value: facilityName },
                  { label: 'Type', value: facilityType },
                  { label: 'State', value: facilityState },
                  { label: 'RSO', value: `${rsoName} · ${rsoEmail}` },
                  { label: 'Equipment', value: `${selectedEquipment.length} unit${selectedEquipment.length !== 1 ? 's' : ''} covered` },
                  { label: 'Dosimetry', value: dosimetry ? `Yes — ${dosimetryProvider || 'provider TBD'} · ${dosimetryFrequency}` : 'Not required' },
                  { label: 'Training', value: trainingFrequency },
                  { label: 'Lead apron inspection', value: apronInspectionFreq.charAt(0).toUpperCase() + apronInspectionFreq.slice(1) },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e8f3fb' }}>
                    <span style={{ fontSize: '11px', color: '#a8a39c', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '500' }}>{row.label}</span>
                    <span style={{ fontSize: '12px', color: '#0d2d5e', fontWeight: '500', textAlign: 'right', maxWidth: '65%' }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', fontSize: '12px', color: '#0d2d5e', lineHeight: '1.65' }}>
                Clicking Generate will produce a complete 15-section Radiation Protection Program with your facility data pre-filled throughout — including ALARA program, equipment details, dosimetry policy, pregnant patient protocols, training program, and annual compliance checklist. The document will be saved to your Document Repository.
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setStep(3)} style={{ flex: 1, height: '44px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Back</button>
                <button onClick={handleGenerate} disabled={saving}
                  style={{ flex: 2, height: '44px', background: saving ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: saving ? 'default' : 'pointer' }}>
                  {saving ? 'Generating...' : 'Generate Radiation Protection Program'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
