'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const FREQUENCIES = ['On installation', 'After major repair', 'Annual', 'Semi-annual', 'Quarterly', 'Monthly', 'As needed']

const inp: React.CSSProperties = {
  width: '100%', height: '38px', border: '1px solid #c2ddf0', borderRadius: '8px',
  padding: '0 12px', fontSize: '13px', color: '#0d2d5e', background: '#fff',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif'
}

function ProcedureRow({ proc, onSave, onDelete }: { proc: any; onSave: (p: any) => void; onDelete: (id: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...proc })

  return editing ? (
    <div style={{ background: '#f4f7fb', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
        <input style={inp} placeholder="Procedure name *" value={form.procedure_name} onChange={e => setForm((p: any) => ({ ...p, procedure_name: e.target.value }))} />
        <select style={inp} value={form.frequency || ''} onChange={e => setForm((p: any) => ({ ...p, frequency: e.target.value }))}>
          <option value="">Select frequency</option>
          {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <div>
          <label style={{ fontSize: '11px', color: '#4a6d8c', display: 'block', marginBottom: '3px' }}>Last performed</label>
          <input style={inp} type="date" value={form.last_performed || ''} onChange={e => setForm((p: any) => ({ ...p, last_performed: e.target.value }))} />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#4a6d8c', display: 'block', marginBottom: '3px' }}>Next due</label>
          <input style={inp} type="date" value={form.next_due || ''} onChange={e => setForm((p: any) => ({ ...p, next_due: e.target.value }))} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ fontSize: '11px', color: '#4a6d8c', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_manufacturer_req || false} onChange={e => setForm((p: any) => ({ ...p, is_manufacturer_req: e.target.checked })) } style={{ accentColor: '#0d2d5e' }} />
            Manufacturer required
          </label>
        </div>
        <textarea
          style={{ ...inp, height: '60px', padding: '8px 12px', resize: 'vertical', gridColumn: 'span 2' }}
          placeholder="Notes (optional)"
          value={form.notes || ''}
          onChange={e => setForm((p: any) => ({ ...p, notes: e.target.value }))}
        />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => setEditing(false)} style={{ flex: 1, height: '34px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
        <button onClick={() => { onSave(form); setEditing(false) }} disabled={!form.procedure_name}
          style={{ flex: 2, height: '34px', background: form.procedure_name ? '#0d2d5e' : '#c2ddf0', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
          Save
        </button>
      </div>
    </div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: '#fff', borderRadius: '8px', marginBottom: '6px', border: '1px solid #eef3fb' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e' }}>{proc.procedure_name}</span>
          {proc.is_manufacturer_req && (
            <span style={{ fontSize: '9px', fontWeight: '500', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '1px 7px' }}>Manufacturer req.</span>
          )}
          {proc.frequency && (
            <span style={{ fontSize: '10px', color: '#827d76', background: '#f4f7fb', borderRadius: '20px', padding: '1px 8px' }}>{proc.frequency}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {proc.last_performed && <span style={{ fontSize: '11px', color: '#a8a39c' }}>Last: {new Date(proc.last_performed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
          {proc.next_due && (
            <span style={{ fontSize: '11px', fontWeight: '500', color: new Date(proc.next_due) < new Date() ? '#931621' : '#2d6a4f' }}>
              Due: {new Date(proc.next_due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {new Date(proc.next_due) < new Date() ? ' — OVERDUE' : ''}
            </span>
          )}
        </div>
        {proc.notes && <p style={{ fontSize: '11px', color: '#827d76', margin: '4px 0 0', lineHeight: '1.5' }}>{proc.notes}</p>}
      </div>
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        <button onClick={() => setEditing(true)} style={{ fontSize: '11px', color: '#1a5fa8', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>Edit</button>
        <button onClick={() => onDelete(proc.id)} style={{ fontSize: '11px', color: '#a8a39c', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>Remove</button>
      </div>
    </div>
  )
}

export default function EquipmentQAPage() {
  const [org, setOrg] = useState<any>(null)
  const [equipment, setEquipment] = useState<any[]>([])
  const [qaMap, setQaMap] = useState<Record<string, any[]>>({})
  const [regMap, setRegMap] = useState<Record<string, any>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [newProc, setNewProc] = useState({ procedure_name: '', frequency: '', is_manufacturer_req: false, notes: '' })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchAll = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) { router.push('/onboarding'); return }
    const { data: orgData } = await supabase.from('organizations').select('*').eq('id', profile.org_id).single()
    setOrg(orgData)
    const { data: eq } = await supabase.from('equipment').select('*').eq('org_id', profile.org_id).order('created_at')
    setEquipment(eq || [])
    const { data: qa } = await supabase.from('equipment_qa').select('*').eq('org_id', profile.org_id).order('procedure_name')
    const map: Record<string, any[]> = {}
    for (const item of qa || []) {
      if (!map[item.equipment_id]) map[item.equipment_id] = []
      map[item.equipment_id].push(item)
    }
    setQaMap(map)
    if (eq?.length && orgData?.facility_state) {
      const modalities = [...new Set((eq || []).map((e: any) => e.modality).filter(Boolean))]
      const orFilter = modalities.map(m => `modality_name.ilike.%${m}%`).join(',')
      const { data: regs } = await supabase.from('regulations').select('*')
        .eq('state_name', orgData.facility_state)
        .or(orFilter || 'modality_name.ilike.%%')
      const rm: Record<string, any> = {}
      for (const eq2 of (eq || [])) {
        const reg = (regs || []).find(r => r.modality_name?.toLowerCase().includes(eq2.modality?.toLowerCase() || ''))
        if (reg) rm[eq2.id] = reg
      }
      setRegMap(rm)
    }
    setLoading(false)
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSaveProc = async (equipId: string, proc: any) => {
    await fetch('/api/equipment-qa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'upsert', equipment_id: equipId, ...proc }) })
    fetchAll()
  }

  const handleDeleteProc = async (id: string) => {
    if (!confirm('Remove this procedure?')) return
    await fetch('/api/equipment-qa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'delete', id }) })
    fetchAll()
  }

  const handleAddProc = async (equipId: string) => {
    if (!newProc.procedure_name) return
    await fetch('/api/equipment-qa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'upsert', equipment_id: equipId, ...newProc }) })
    setNewProc({ procedure_name: '', frequency: '', is_manufacturer_req: false, notes: '' })
    setAddingTo(null)
    fetchAll()
  }

  const handleCopy = async (sourceId: string, targetId: string) => {
    if (!confirm('Copy all procedures from the source machine to this machine?')) return
    await fetch('/api/equipment-qa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'copy', source_equipment_id: sourceId, target_equipment_id: targetId }) })
    fetchAll()
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#a8a39c' }}>Loading equipment QA...</p>
    </div>
  )

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
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>Equipment QA</h1>
          <p style={{ fontSize: '13px', color: '#827d76' }}>Quality assurance procedures, manufacturer schedules, and performance evaluations for each device.</p>
        </div>

        <div style={{ background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '10px', padding: '14px 20px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>📖</span>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>How to complete your Equipment QA</p>
            <p style={{ fontSize: '12px', color: '#4a6d8c', lineHeight: '1.65', margin: 0 }}>
              For each device, refer to the <strong>manufacturer's user manual</strong> to identify required maintenance, calibration, and QA procedures — then log them here. If you no longer have your manual, contact your x-ray dealer or the manufacturer directly. Your physicist or service provider can also help identify required procedures for your specific equipment.
            </p>
          </div>
        </div>

        {equipment.length === 0 ? (
          <div style={{ background: '#fff', border: '1px dashed #c2ddf0', borderRadius: '12px', padding: '64px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>No equipment on file</p>
            <p style={{ fontSize: '13px', color: '#a8a39c', marginBottom: '20px' }}>Add your x-ray equipment first, then set up QA procedures here.</p>
            <a href="/dashboard/equipment" style={{ fontSize: '13px', fontWeight: '500', color: '#fff', background: '#0d2d5e', padding: '8px 20px', borderRadius: '8px', textDecoration: 'none' }}>
              Go to Equipment & Safety →
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {equipment.map(eq => {
              const procs = qaMap[eq.id] || []
              const reg = regMap[eq.id]
              const isOpen = expanded === eq.id
              const overdueCount = procs.filter(p => p.next_due && new Date(p.next_due) < new Date()).length
              const sameModel = equipment.filter(e => e.model_number && e.model_number === eq.model_number && e.id !== eq.id)

              return (
                <div key={eq.id} style={{ background: '#fff', border: `1px solid ${overdueCount > 0 ? '#f5c6c9' : '#dce8f5'}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div onClick={() => setExpanded(isOpen ? null : eq.id)}
                    style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', background: isOpen ? '#f4f7fb' : '#fff' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>{eq.device_name}</p>
                        {eq.modality && <span style={{ fontSize: '10px', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '1px 8px' }}>{eq.modality}</span>}
                        {overdueCount > 0 && <span style={{ fontSize: '10px', fontWeight: '500', color: '#931621', background: '#fefafb', border: '1px solid #f5c6c9', borderRadius: '20px', padding: '1px 8px' }}>{overdueCount} overdue</span>}
                      </div>
                      <p style={{ fontSize: '12px', color: '#827d76', margin: 0 }}>
                        {[eq.manufacturer, eq.model_number, eq.serial_number ? `S/N: ${eq.serial_number}` : null].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      <span style={{ fontSize: '12px', color: procs.length > 0 ? '#2d6a4f' : '#a8a39c', background: procs.length > 0 ? '#edfaf3' : '#f4f7fb', border: `1px solid ${procs.length > 0 ? '#b8e8cc' : '#e8e6e2'}`, borderRadius: '20px', padding: '2px 10px' }}>
                        {procs.length} procedure{procs.length !== 1 ? 's' : ''}
                      </span>
                      <span style={{ color: '#a8a39c', fontSize: '16px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ padding: '16px 20px', borderTop: '1px solid #eef3fb' }}>

                      {/* State requirements from regulations */}
                      {reg && (
                        <div style={{ background: '#f4f7fb', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px' }}>
                          <p style={{ fontSize: '11px', fontWeight: '500', color: '#4a6d8c', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '10px' }}>
                            {org?.facility_state} state requirements
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {[
                              ['QA testing required', reg.qa_testing],
                              ['QA frequency', reg.qa_testing_frequency],
                              ['Equipment performance evaluation', reg.equipment_performance_eval],
                              ['Digital receptor QA', reg.digital_receptor_qa],
                              ['QA requirements', reg.qa_requirements_notes],
                            ].filter(([, v]) => v).map(([label, value]) => (
                              <div key={label} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <span style={{ color: '#2d6a4f', fontSize: '12px', flexShrink: 0, marginTop: '1px' }}>✓</span>
                                <span style={{ fontSize: '12px', color: '#1e1c1a', lineHeight: '1.5' }}>
                                  <strong style={{ fontWeight: '500', color: '#0d2d5e' }}>{label}:</strong> {value === true ? 'Required' : value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Procedures list */}
                      {procs.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <p style={{ fontSize: '11px', fontWeight: '500', color: '#a8a39c', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '8px' }}>Procedures on file</p>
                          {procs.map(proc => (
                            <ProcedureRow
                              key={proc.id}
                              proc={proc}
                              onSave={(p) => handleSaveProc(eq.id, p)}
                              onDelete={handleDeleteProc}
                            />
                          ))}
                        </div>
                      )}

                      {/* Add procedure form */}
                      {addingTo === eq.id ? (
                        <div style={{ background: '#f4f7fb', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
                          <p style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e', marginBottom: '10px' }}>New procedure</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                            <input style={{ ...inp, gridColumn: 'span 2' }} placeholder="Procedure name *" value={newProc.procedure_name} onChange={e => setNewProc(p => ({ ...p, procedure_name: e.target.value }))} />
                            <select style={inp} value={newProc.frequency} onChange={e => setNewProc(p => ({ ...p, frequency: e.target.value }))}>
                              <option value="">Select frequency</option>
                              {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#4a6d8c', cursor: 'pointer' }}>
                              <input type="checkbox" checked={newProc.is_manufacturer_req} onChange={e => setNewProc(p => ({ ...p, is_manufacturer_req: e.target.checked }))} style={{ accentColor: '#0d2d5e' }} />
                              Manufacturer required
                            </label>
                            <input style={{ ...inp, gridColumn: 'span 2' }} placeholder="Notes (optional)" value={newProc.notes} onChange={e => setNewProc(p => ({ ...p, notes: e.target.value }))} />
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setAddingTo(null)} style={{ flex: 1, height: '34px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={() => handleAddProc(eq.id)} disabled={!newProc.procedure_name}
                              style={{ flex: 2, height: '34px', background: newProc.procedure_name ? '#0d2d5e' : '#c2ddf0', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                              Add procedure
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button onClick={() => setAddingTo(eq.id)}
                            style={{ height: '34px', padding: '0 14px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                            + Add procedure
                          </button>
                          {sameModel.length > 0 && sameModel.map(other => (
                            procs.length > 0 && (
                              <button key={other.id} onClick={() => handleCopy(eq.id, other.id)}
                                style={{ height: '34px', padding: '0 14px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                                📋 Copy to {other.device_name}
                              </button>
                            )
                          ))}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div style={{ background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '10px', padding: '14px 20px', marginTop: '24px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '13px', color: '#0d2d5e', flex: 1, margin: 0 }}>
            Questions about QA requirements for your specific equipment or state?
          </p>
          <a href="/dashboard/ai" style={{ fontSize: '12px', fontWeight: '500', color: '#fff', background: '#0d2d5e', padding: '7px 16px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Ask AI assistant →
          </a>
        </div>
      </div>
    </div>
  )
}