'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const DOC_TYPES = [
  { key: 'certification', label: 'X-ray Certifications & Credentials', color: '#1a5fa8', bg: '#e8f3fb', border: '#c2ddf0' },
  { key: 'safety_training', label: 'Radiation Safety Training', color: '#2d6a4f', bg: '#edfaf3', border: '#b8e8cc' },
  { key: 'equipment_training', label: 'Equipment Training', color: '#9a3510', bg: '#fff6e8', border: '#f0d4a0' },
  { key: 'ceu', label: 'CEU Certificates', color: '#6d28d9', bg: '#f5f0ff', border: '#c4b5fd' },
]

const inp: React.CSSProperties = {
  width: '100%', height: '38px', border: '1px solid #c2ddf0', borderRadius: '8px',
  padding: '0 12px', fontSize: '13px', color: '#0d2d5e', background: '#fff',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif'
}

function isExpiringSoon(dateStr: string) {
  const d = new Date(dateStr)
  const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  return diff < 90
}

function isExpired(dateStr: string) {
  return new Date(dateStr) < new Date()
}

export default function OperatorsPage() {
  const [operators, setOperators] = useState<any[]>([])
  const [docsMap, setDocsMap] = useState<Record<string, any[]>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAddOp, setShowAddOp] = useState(false)
  const [editingOp, setEditingOp] = useState<any>(null)
  const [opForm, setOpForm] = useState({ name: '', license_number: '', license_state: '', license_expiry: '' })
  const [uploadingTo, setUploadingTo] = useState<{ opId: string; docType: string } | null>(null)
  const [docForm, setDocForm] = useState({ document_name: '', issued_date: '', expiry_date: '', notes: '' })
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const fetchAll = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) { router.push('/onboarding'); return }
    const [{ data: ops }, { data: docs }] = await Promise.all([
      supabase.from('xray_operators').select('*').eq('org_id', profile.org_id).order('name'),
      supabase.from('operator_documents').select('*').eq('org_id', profile.org_id).order('created_at', { ascending: false }),
    ])
    setOperators(ops || [])
    const map: Record<string, any[]> = {}
    for (const doc of docs || []) {
      if (!map[doc.operator_id]) map[doc.operator_id] = []
      map[doc.operator_id].push(doc)
    }
    setDocsMap(map)
    setLoading(false)
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleSaveOp = async () => {
    const body = editingOp
      ? { _action: 'save_operator', id: editingOp.id, ...opForm }
      : { _action: 'save_operator', ...opForm }
    await fetch('/api/operators', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setShowAddOp(false)
    setEditingOp(null)
    setOpForm({ name: '', license_number: '', license_state: '', license_expiry: '' })
    fetchAll()
  }

  const handleDeleteOp = async (id: string) => {
    if (!confirm('Remove this operator and all their documents?')) return
    await fetch('/api/operators', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'delete_operator', id }) })
    fetchAll()
  }

  const startEdit = (op: any) => {
    setEditingOp(op)
    setOpForm({ name: op.name, license_number: op.license_number || '', license_state: op.license_state || '', license_expiry: op.license_expiry || '' })
    setShowAddOp(true)
  }

  const handleUpload = async (opId: string, docType: string, file: File) => {
    setUploading(true)
    const supabase = createClient()
    const path = `${opId}/${docType}/${Date.now()}_${file.name}`
    const { error: storageError } = await supabase.storage.from('operator-docs').upload(path, file)
    if (storageError) { alert('Upload failed: ' + storageError.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('operator-docs').getPublicUrl(path)
    await fetch('/api/operators', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _action: 'save_document',
        operator_id: opId,
        document_type: docType,
        document_name: docForm.document_name || file.name,
        storage_path: path,
        file_url: publicUrl,
        issued_date: docForm.issued_date || null,
        expiry_date: docForm.expiry_date || null,
        notes: docForm.notes || null,
      })
    })
    setDocForm({ document_name: '', issued_date: '', expiry_date: '', notes: '' })
    setUploadingTo(null)
    setUploading(false)
    fetchAll()
  }

  const handleDeleteDoc = async (id: string, storagePath: string) => {
    if (!confirm('Remove this document?')) return
    const supabase = createClient()
    if (storagePath) await supabase.storage.from('operator-docs').remove([storagePath])
    await fetch('/api/operators', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'delete_document', id }) })
    fetchAll()
  }

  const handleDownload = async (storagePath: string, fileName: string) => {
    const supabase = createClient()
    const { data } = await supabase.storage.from('operator-docs').createSignedUrl(storagePath, 3600)
    if (data?.signedUrl) {
      const a = document.createElement('a')
      a.href = data.signedUrl
      a.download = fileName
      a.click()
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <p style={{ color: '#a8a39c' }}>Loading operators...</p>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>X-ray Operators</h1>
            <p style={{ fontSize: '13px', color: '#827d76' }}>Credentials, certifications, and training records for all staff who operate x-ray equipment.</p>
          </div>
          <button onClick={() => { setShowAddOp(!showAddOp); setEditingOp(null); setOpForm({ name: '', license_number: '', license_state: '', license_expiry: '' }) }}
            style={{ height: '38px', padding: '0 16px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
            + Add operator
          </button>
        </div>

        {/* Add/Edit operator form */}
        {showAddOp && (
          <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '14px' }}>
              {editingOp ? `Edit — ${editingOp.name}` : 'New X-ray Operator / RT'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <input style={{ ...inp, gridColumn: 'span 2' }} placeholder="Full name *" value={opForm.name} onChange={e => setOpForm(p => ({ ...p, name: e.target.value }))} />
              <input style={inp} placeholder="License / certification number" value={opForm.license_number} onChange={e => setOpForm(p => ({ ...p, license_number: e.target.value }))} />
              <input style={inp} placeholder="Issuing state" value={opForm.license_state} onChange={e => setOpForm(p => ({ ...p, license_state: e.target.value }))} />
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '11px', color: '#4a6d8c', display: 'block', marginBottom: '4px' }}>License expiry date</label>
                <input style={{ ...inp, width: '50%' }} type="date" value={opForm.license_expiry} onChange={e => setOpForm(p => ({ ...p, license_expiry: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { setShowAddOp(false); setEditingOp(null) }}
                style={{ flex: 1, height: '38px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSaveOp} disabled={!opForm.name}
                style={{ flex: 2, height: '38px', background: opForm.name ? '#0d2d5e' : '#c2ddf0', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                {editingOp ? 'Save changes' : 'Add operator'}
              </button>
            </div>
          </div>
        )}

        {operators.length === 0 && !showAddOp ? (
          <div style={{ background: '#fff', border: '1px dashed #c2ddf0', borderRadius: '12px', padding: '64px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>No operators added yet</p>
            <p style={{ fontSize: '13px', color: '#a8a39c', maxWidth: '400px', margin: '0 auto 20px' }}>Add each staff member who operates x-ray equipment and upload their credentials.</p>
            <button onClick={() => setShowAddOp(true)}
              style={{ fontSize: '13px', fontWeight: '500', color: '#fff', background: '#0d2d5e', padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
              Add first operator →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {operators.map(op => {
              const docs = docsMap[op.id] || []
              const isOpen = expanded === op.id
              const expiredDocs = docs.filter(d => d.expiry_date && isExpired(d.expiry_date))
              const expiringSoon = docs.filter(d => d.expiry_date && !isExpired(d.expiry_date) && isExpiringSoon(d.expiry_date))
              const licenseExpired = op.license_expiry && isExpired(op.license_expiry)
              const licenseWarn = op.license_expiry && !licenseExpired && isExpiringSoon(op.license_expiry)

              return (
                <div key={op.id} style={{ background: '#fff', border: `1px solid ${expiredDocs.length > 0 || licenseExpired ? '#f5c6c9' : expiringSoon.length > 0 || licenseWarn ? '#f0d4a0' : '#dce8f5'}`, borderRadius: '12px', overflow: 'hidden' }}>

                  {/* Operator header */}
                  <div onClick={() => setExpanded(isOpen ? null : op.id)}
                    style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', background: isOpen ? '#f4f7fb' : '#fff' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e8f3fb', border: '2px solid #c2ddf0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '15px', fontWeight: '500', color: '#0d2d5e' }}>
                      {op.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e' }}>{op.name}</span>
                        {licenseExpired && <span style={{ fontSize: '10px', fontWeight: '500', color: '#931621', background: '#fefafb', border: '1px solid #f5c6c9', borderRadius: '20px', padding: '1px 7px' }}>License expired</span>}
                        {licenseWarn && !licenseExpired && <span style={{ fontSize: '10px', fontWeight: '500', color: '#9a3510', background: '#fff6e8', border: '1px solid #f0d4a0', borderRadius: '20px', padding: '1px 7px' }}>License expiring soon</span>}
                        {expiredDocs.length > 0 && <span style={{ fontSize: '10px', fontWeight: '500', color: '#931621', background: '#fefafb', border: '1px solid #f5c6c9', borderRadius: '20px', padding: '1px 7px' }}>{expiredDocs.length} doc{expiredDocs.length !== 1 ? 's' : ''} expired</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {op.license_number && <span style={{ fontSize: '11px', color: '#827d76' }}>License: {op.license_number}</span>}
                        {op.license_state && <span style={{ fontSize: '11px', color: '#827d76' }}>{op.license_state}</span>}
                        {op.license_expiry && <span style={{ fontSize: '11px', color: licenseExpired ? '#931621' : '#827d76' }}>Expires: {new Date(op.license_expiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{ fontSize: '12px', color: '#827d76' }}>{docs.length} doc{docs.length !== 1 ? 's' : ''}</span>
                      <span style={{ color: '#a8a39c', fontSize: '16px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isOpen && (
                    <div style={{ padding: '16px 20px', borderTop: '1px solid #eef3fb' }}>

                      {/* Quick actions */}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <button onClick={() => startEdit(op)}
                          style={{ height: '30px', padding: '0 12px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' }}>
                          Edit info
                        </button>
                        <button onClick={() => handleDeleteOp(op.id)}
                          style={{ height: '30px', padding: '0 12px', background: '#fff', color: '#931621', border: '1px solid #f5c6c9', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' }}>
                          Remove operator
                        </button>
                      </div>

                      {/* Document sections by type */}
                      {DOC_TYPES.map(docType => {
                        const typeDocs = docs.filter(d => d.document_type === docType.key)
                        const isUploading = uploadingTo?.opId === op.id && uploadingTo?.docType === docType.key

                        return (
                          <div key={docType.key} style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <p style={{ fontSize: '12px', fontWeight: '500', color: docType.color, margin: 0 }}>
                                {docType.label}
                                {typeDocs.length > 0 && <span style={{ fontWeight: '400', color: '#a8a39c', marginLeft: '6px' }}>({typeDocs.length})</span>}
                              </p>
                              <button onClick={() => setUploadingTo(isUploading ? null : { opId: op.id, docType: docType.key })}
                                style={{ height: '26px', padding: '0 10px', background: docType.bg, color: docType.color, border: `1px solid ${docType.border}`, borderRadius: '6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}>
                                + Upload
                              </button>
                            </div>

                            {/* Upload form */}
                            {isUploading && (
                              <div style={{ background: '#f4f7fb', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                  <input style={{ ...inp, gridColumn: 'span 2' }} placeholder="Document name (or leave blank to use filename)" value={docForm.document_name} onChange={e => setDocForm(p => ({ ...p, document_name: e.target.value }))} />
                                  <div>
                                    <label style={{ fontSize: '11px', color: '#4a6d8c', display: 'block', marginBottom: '3px' }}>Issue date</label>
                                    <input style={inp} type="date" value={docForm.issued_date} onChange={e => setDocForm(p => ({ ...p, issued_date: e.target.value }))} />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '11px', color: '#4a6d8c', display: 'block', marginBottom: '3px' }}>Expiry date</label>
                                    <input style={inp} type="date" value={docForm.expiry_date} onChange={e => setDocForm(p => ({ ...p, expiry_date: e.target.value }))} />
                                  </div>
                                </div>
                                <input
                                  ref={fileRef}
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  style={{ display: 'none' }}
                                  onChange={e => {
                                    const file = e.target.files?.[0]
                                    if (file) handleUpload(op.id, docType.key, file)
                                  }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button onClick={() => setUploadingTo(null)}
                                    style={{ flex: 1, height: '34px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' }}>
                                    Cancel
                                  </button>
                                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                                    style={{ flex: 2, height: '34px', background: uploading ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                                    {uploading ? 'Uploading...' : 'Choose file & upload'}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Document list */}
                            {typeDocs.length === 0 && !isUploading ? (
                              <p style={{ fontSize: '12px', color: '#a8a39c', fontStyle: 'italic', padding: '6px 0' }}>No {docType.label.toLowerCase()} uploaded</p>
                            ) : (
                              typeDocs.map(doc => {
                                const expired = doc.expiry_date && isExpired(doc.expiry_date)
                                const warn = doc.expiry_date && !expired && isExpiringSoon(doc.expiry_date)
                                return (
                                  <div key={doc.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 12px', background: expired ? '#fefafb' : warn ? '#fffdf5' : '#fff', border: `1px solid ${expired ? '#f5c6c9' : warn ? '#f0d4a0' : '#eef3fb'}`, borderRadius: '7px', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '16px', flexShrink: 0 }}>📄</span>
                                    <div style={{ flex: 1 }}>
                                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: '0 0 2px' }}>{doc.document_name}</p>
                                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {doc.issued_date && <span style={{ fontSize: '11px', color: '#a8a39c' }}>Issued: {new Date(doc.issued_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>}
                                        {doc.expiry_date && (
                                          <span style={{ fontSize: '11px', fontWeight: '500', color: expired ? '#931621' : warn ? '#9a3510' : '#2d6a4f' }}>
                                            {expired ? '⚠ Expired: ' : warn ? '⚡ Expires: ' : '✓ Valid until: '}
                                            {new Date(doc.expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                      {doc.storage_path && (
                                        <button onClick={() => handleDownload(doc.storage_path, doc.document_name)}
                                          style={{ fontSize: '11px', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '5px', padding: '3px 8px', cursor: 'pointer' }}>
                                          Download
                                        </button>
                                      )}
                                      <button onClick={() => handleDeleteDoc(doc.id, doc.storage_path)}
                                        style={{ fontSize: '11px', color: '#a8a39c', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 6px' }}>
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                )
                              })
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div style={{ background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '10px', padding: '14px 20px', marginTop: '24px', fontSize: '12px', color: '#0d2d5e', lineHeight: '1.6' }}>
          <strong>Compliance note:</strong> Most states require x-ray operators to maintain current certifications and complete continuing education. Upload all credential documents here and set expiry dates to receive automatic warnings when renewals are due.
        </div>
      </div>
    </div>
  )
}