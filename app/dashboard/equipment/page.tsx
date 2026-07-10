'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const STATUSES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  active:               { label: 'Active',               color: '#2d6a4f', bg: '#edfaf3', border: '#b8e8cc' },
  pending_registration: { label: 'Pending registration',  color: '#9a3510', bg: '#fff6e8', border: '#f0d4a0' },
  inactive:             { label: 'Inactive',              color: '#827d76', bg: '#f4f7fb', border: '#e8e6e2' },
  retired:              { label: 'Retired',               color: '#a8a39c', bg: '#f4f7fb', border: '#e8e6e2' },
}

const APRON_TYPES: Record<string, string> = {
  full_apron:     'Full apron',
  half_apron:     'Half apron',
  thyroid_shield: 'Thyroid shield',
  lead_gloves:    'Lead gloves',
  gonad_shield:   'Gonad shield',
  other:          'Other',
}

const CONDITIONS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  good:    { label: 'Good',    color: '#2d6a4f', bg: '#edfaf3', border: '#b8e8cc' },
  fair:    { label: 'Fair',    color: '#1a5fa8', bg: '#e8f3fb', border: '#c2ddf0' },
  monitor: { label: 'Monitor', color: '#9a3510', bg: '#fff6e8', border: '#f0d4a0' },
  damaged: { label: 'Damaged', color: '#931621', bg: '#fefafb', border: '#f5c6c9' },
  retired: { label: 'Retired', color: '#a8a39c', bg: '#f4f7fb', border: '#e8e6e2' },
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<any[]>([])
  const [aprons, setAprons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [orgName, setOrgName] = useState('')
  const [orgId, setOrgId] = useState('')
  const [showEqForm, setShowEqForm] = useState(false)
  const [showApronForm, setShowApronForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const [manufacturer, setManufacturer] = useState('')
  const [model, setModel] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [roomLocation, setRoomLocation] = useState('')
  const [facilityRegNum, setFacilityRegNum] = useState('')
  const [machineRegNum, setMachineRegNum] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [eqStatus, setEqStatus] = useState('active')

  const [apronType, setApronType] = useState('')
  const [apronTag, setApronTag] = useState('')
  const [apronMfr, setApronMfr] = useState('')
  const [apronSize, setApronSize] = useState('')
  const [apronCondition, setApronCondition] = useState('good')
  const [apronInspection, setApronInspection] = useState('')

  const fetchAll = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) { router.push('/onboarding'); return }

    setOrgId(profile.org_id)

    const { data: org } = await supabase
      .from('organizations').select('name').eq('id', profile.org_id).single()
    if (org) setOrgName(org.name)

    const { data: eq } = await supabase
      .from('equipment').select('*').eq('org_id', profile.org_id)
      .order('created_at', { ascending: false })
    setEquipment(eq || [])

    const { data: ap } = await supabase
      .from('lead_aprons').select('*').eq('org_id', profile.org_id)
      .order('created_at', { ascending: false })
    setAprons(ap || [])

    setLoading(false)
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleAddEquipment = async () => {
    if (!manufacturer || !model) return
    setSaving(true)
    const res = await fetch('/api/equipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resource_type: 'equipment',
        manufacturer, model, serial_number: serialNumber,
        room_location: roomLocation,
        facility_registration_number: facilityRegNum,
        machine_registration_number: machineRegNum,
        purchase_date: purchaseDate || null,
        status: eqStatus,
      })
    })
    if (res.ok) {
      setManufacturer(''); setModel(''); setSerialNumber(''); setRoomLocation('')
      setFacilityRegNum(''); setMachineRegNum(''); setPurchaseDate(''); setEqStatus('active')
      setShowEqForm(false); fetchAll()
    } else {
      const r = await res.json(); alert(r.error || 'Error adding equipment')
    }
    setSaving(false)
  }

  const handleAddApron = async () => {
    if (!apronType) return
    setSaving(true)
    const res = await fetch('/api/equipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resource_type: 'lead_apron',
        item_type: apronType, id_tag: apronTag,
        manufacturer: apronMfr, size: apronSize,
        condition: apronCondition,
        last_inspection_date: apronInspection || null,
      })
    })
    if (res.ok) {
      setApronType(''); setApronTag(''); setApronMfr('')
      setApronSize(''); setApronCondition('good'); setApronInspection('')
      setShowApronForm(false); fetchAll()
    } else {
      const r = await res.json(); alert(r.error || 'Error adding apron')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string, resource_type: string) => {
    if (!confirm('Delete this item? This cannot be undone.')) return
    await fetch('/api/equipment', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, resource_type })
    })
    fetchAll()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
  }

  const inp = { width: '100%', height: '38px', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '0 10px', fontSize: '13px', color: '#0d2d5e', background: '#fff', outline: 'none', boxSizing: 'border-box' as const }
  const lbl = { display: 'block', fontSize: '10px', fontWeight: '500' as const, color: '#a8a39c', marginBottom: '5px', textTransform: 'uppercase' as const, letterSpacing: '0.07em' }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f4f7fb' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '500', marginLeft: '10px' }}>ComplianceOS</span>
        </div>
        <a href="/dashboard" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</a>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>Equipment inventory</h1>
          <p style={{ fontSize: '13px', color: '#827d76' }}>{orgName}</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e' }}>
            X-ray equipment <span style={{ color: '#a8a39c', fontWeight: '400' }}>· {equipment.length} unit{equipment.length !== 1 ? 's' : ''}</span>
          </p>
          <button onClick={() => { setShowEqForm(!showEqForm); setShowApronForm(false) }}
            style={{ height: '36px', padding: '0 16px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
            {showEqForm ? 'Cancel' : '+ Add equipment'}
          </button>
        </div>

        {showEqForm && (
          <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '14px' }}>Add x-ray equipment</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div><label style={lbl}>Manufacturer *</label><input style={inp} type="text" placeholder="e.g. Carestream" value={manufacturer} onChange={e => setManufacturer(e.target.value)} /></div>
              <div><label style={lbl}>Model *</label><input style={inp} type="text" placeholder="e.g. CS 9300" value={model} onChange={e => setModel(e.target.value)} /></div>
              <div><label style={lbl}>Serial number</label><input style={inp} type="text" placeholder="S/N" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} /></div>
              <div><label style={lbl}>Room / location</label><input style={inp} type="text" placeholder="e.g. Operatory 2" value={roomLocation} onChange={e => setRoomLocation(e.target.value)} /></div>
              <div><label style={lbl}>Facility registration #</label><input style={inp} type="text" placeholder="State facility reg. number" value={facilityRegNum} onChange={e => setFacilityRegNum(e.target.value)} /></div>
              <div><label style={lbl}>Machine registration #</label><input style={inp} type="text" placeholder="State machine reg. number" value={machineRegNum} onChange={e => setMachineRegNum(e.target.value)} /></div>
              <div><label style={lbl}>Purchase date</label><input style={inp} type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} /></div>
              <div><label style={lbl}>Status</label>
                <select style={inp} value={eqStatus} onChange={e => setEqStatus(e.target.value)}>
                  <option value="active">Active</option>
                  <option value="pending_registration">Pending registration</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <button onClick={handleAddEquipment} disabled={!manufacturer || !model || saving}
              style={{ height: '36px', padding: '0 18px', background: (!manufacturer || !model) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: (!manufacturer || !model) ? 'default' : 'pointer' }}>
              {saving ? 'Saving...' : 'Add equipment'}
            </button>
          </div>
        )}

        {equipment.length === 0 && !showEqForm ? (
          <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '32px', textAlign: 'center', marginBottom: '32px' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>No equipment added yet</p>
            <p style={{ fontSize: '13px', color: '#827d76', marginBottom: '16px' }}>Add your x-ray units to track registration numbers, inspection dates, and maintenance schedules.</p>
            <button onClick={() => setShowEqForm(true)} style={{ height: '36px', padding: '0 16px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>Add your first unit</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
            {equipment.map(eq => {
              const status = STATUSES[eq.status] || STATUSES.active
              return (
                <div key={eq.id} style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '3px' }}>{eq.manufacturer} {eq.model}</p>
                      <p style={{ fontSize: '12px', color: '#827d76' }}>
                        {[eq.serial_number && `S/N: ${eq.serial_number}`, eq.room_location].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', fontWeight: '500', color: status.color, background: status.bg, border: `1px solid ${status.border}`, borderRadius: '20px', padding: '2px 8px' }}>{status.label}</span>
                      <button onClick={() => handleDelete(eq.id, 'equipment')} style={{ padding: '3px 10px', border: '1px solid #f5c6c9', borderRadius: '6px', background: '#fff', color: '#931621', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                  {(eq.facility_registration_number || eq.machine_registration_number) && (
                    <div style={{ background: '#f4f7fb', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {eq.facility_registration_number && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#827d76' }}>Facility registration #</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e', fontVariantNumeric: 'tabular-nums' }}>{eq.facility_registration_number}</span>
                            <button onClick={() => copyToClipboard(eq.facility_registration_number)} style={{ padding: '2px 8px', border: '1px solid #c2ddf0', borderRadius: '4px', background: '#fff', color: '#1a5fa8', fontSize: '10px', cursor: 'pointer' }}>Copy</button>
                          </div>
                        </div>
                      )}
                      {eq.machine_registration_number && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#827d76' }}>Machine registration #</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e', fontVariantNumeric: 'tabular-nums' }}>{eq.machine_registration_number}</span>
                            <button onClick={() => copyToClipboard(eq.machine_registration_number)} style={{ padding: '2px 8px', border: '1px solid #c2ddf0', borderRadius: '4px', background: '#fff', color: '#1a5fa8', fontSize: '10px', cursor: 'pointer' }}>Copy</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {eq.purchase_date && (
                    <p style={{ fontSize: '11px', color: '#a8a39c', marginTop: '8px' }}>Purchased {new Date(eq.purchase_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e' }}>
            Lead aprons <span style={{ color: '#a8a39c', fontWeight: '400' }}>· {aprons.length} item{aprons.length !== 1 ? 's' : ''}</span>
          </p>
          <button onClick={() => { setShowApronForm(!showApronForm); setShowEqForm(false) }}
            style={{ height: '36px', padding: '0 16px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
            {showApronForm ? 'Cancel' : '+ Add apron'}
          </button>
        </div>

        {showApronForm && (
          <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '14px' }}>Add lead apron</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div><label style={lbl}>Item type *</label>
                <select style={inp} value={apronType} onChange={e => setApronType(e.target.value)}>
                  <option value="">Select type</option>
                  {Object.entries(APRON_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label style={lbl}>ID tag</label><input style={inp} type="text" placeholder="e.g. LA-001" value={apronTag} onChange={e => setApronTag(e.target.value)} /></div>
              <div><label style={lbl}>Manufacturer</label><input style={inp} type="text" placeholder="e.g. Infab" value={apronMfr} onChange={e => setApronMfr(e.target.value)} /></div>
              <div><label style={lbl}>Size</label><input style={inp} type="text" placeholder="e.g. Medium" value={apronSize} onChange={e => setApronSize(e.target.value)} /></div>
              <div><label style={lbl}>Condition</label>
                <select style={inp} value={apronCondition} onChange={e => setApronCondition(e.target.value)}>
                  {Object.entries(CONDITIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Last inspection date</label><input style={inp} type="date" value={apronInspection} onChange={e => setApronInspection(e.target.value)} /></div>
            </div>
            <button onClick={handleAddApron} disabled={!apronType || saving}
              style={{ height: '36px', padding: '0 18px', background: !apronType ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: !apronType ? 'default' : 'pointer' }}>
              {saving ? 'Saving...' : 'Add apron'}
            </button>
          </div>
        )}

        {aprons.length === 0 && !showApronForm ? (
          <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>No lead aprons added yet</p>
            <p style={{ fontSize: '13px', color: '#827d76', marginBottom: '16px' }}>Track all lead aprons with ID tags, condition status, and inspection dates.</p>
            <button onClick={() => setShowApronForm(true)} style={{ height: '36px', padding: '0 16px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>Add your first apron</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {aprons.map(ap => {
              const cond = CONDITIONS[ap.condition] || CONDITIONS.good
              return (
                <div key={ap.id} style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '3px' }}>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e' }}>{APRON_TYPES[ap.item_type] || ap.item_type}</p>
                      {ap.id_tag && <span style={{ fontSize: '11px', color: '#827d76' }}>#{ap.id_tag}</span>}
                    </div>
                    <p style={{ fontSize: '11px', color: '#a8a39c' }}>
                      {[ap.manufacturer, ap.size, ap.last_inspection_date && `Last inspected ${new Date(ap.last_inspection_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '500', color: cond.color, background: cond.bg, border: `1px solid ${cond.border}`, borderRadius: '20px', padding: '2px 8px', flexShrink: 0 }}>{cond.label}</span>
                  <button onClick={() => handleDelete(ap.id, 'lead_apron')} style={{ padding: '3px 10px', border: '1px solid #f5c6c9', borderRadius: '6px', background: '#fff', color: '#931621', fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}>Delete</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
