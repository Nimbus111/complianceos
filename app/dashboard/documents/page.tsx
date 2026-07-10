'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const CATEGORIES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  all:                   { label: 'All documents',           color: '#0d2d5e', bg: '#e8f3fb',  border: '#c2ddf0' },
  compliance_programs:   { label: 'Compliance programs',     color: '#2d6a4f', bg: '#edfaf3',  border: '#b8e8cc' },
  registrations_licenses:{ label: 'Registrations & licenses',color: '#0d2d5e', bg: '#e8f3fb',  border: '#c2ddf0' },
  inspection_reports:    { label: 'Inspection reports',      color: '#9a3510', bg: '#fff6e8',  border: '#f0d4a0' },
  equipment_records:     { label: 'Equipment records',       color: '#4c1d95', bg: '#f5f3ff',  border: '#c4b5fd' },
  personnel_records:     { label: 'Personnel records',       color: '#1a5fa8', bg: '#e8f3fb',  border: '#c2ddf0' },
  dosimetry_reports:     { label: 'Dosimetry reports',       color: '#7a2a10', bg: '#fff6e8',  border: '#f0d4a0' },
  correspondence_forms:  { label: 'Correspondence & forms',  color: '#827d76', bg: '#f4f7fb',  border: '#e8e6e2' },
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [orgName, setOrgName] = useState('')
  const [orgId, setOrgId] = useState('')
  const router = useRouter()

  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [customName, setCustomName] = useState('')

  const fetchDocs = useCallback(async () => {
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

    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('org_id', profile.org_id)
      .order('created_at', { ascending: false })

    setDocs(data || [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchDocs() }, [fetchDocs])

  const handleUpload = async () => {
    if (!file || !category) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    form.append('category', category)
    form.append('filename', customName || file.name)
    if (expirationDate) form.append('expiration_date', expirationDate)

    const res = await fetch('/api/documents/upload', { method: 'POST', body: form })
    if (res.ok) {
      setFile(null); setCategory(''); setExpirationDate(''); setCustomName('')
      setShowUpload(false)
      fetchDocs()
    } else {
      const r = await res.json()
      alert(r.error || 'Upload failed')
    }
    setUploading(false)
  }

  const handleDownload = async (doc: any) => {
    const res = await fetch('/api/documents/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storage_path: doc.storage_path })
    })
    const { url, error } = await res.json()
    if (url) window.open(url, '_blank')
    else alert(error || 'Download failed')
  }

  const handleDelete = async (doc: any) => {
    if (!confirm(`Delete "${doc.filename}"? This cannot be undone.`)) return
    const res = await fetch('/api/documents/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: doc.id, storage_path: doc.storage_path })
    })
    if (res.ok) fetchDocs()
    else alert('Delete failed')
  }

  const today = new Date()
  const filtered = activeCategory === 'all' ? docs : docs.filter(d => d.category === activeCategory)

  const getExpiryStatus = (date: string | null) => {
    if (!date) return null
    const d = new Date(date)
    const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return { label: 'Expired', color: '#931621', bg: '#fefafb', border: '#f5c6c9' }
    if (diff <= 30) return { label: `Expires in ${diff}d`, color: '#c44a1a', bg: '#fff6e8', border: '#f0d4a0' }
    if (diff <= 90) return { label: `Expires in ${diff}d`, color: '#9a6510', bg: '#fffbf0', border: '#f0d4a0' }
    return { label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), color: '#40916c', bg: '#edfaf3', border: '#b8e8cc' }
  }

  const getFileExt = (filename: string) => {
    const ext = filename.split('.').pop()?.toUpperCase() || 'FILE'
    return ext.slice(0, 4)
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>Document repository</h1>
            <p style={{ fontSize: '13px', color: '#827d76' }}>{orgName} · {docs.length} document{docs.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            style={{ height: '40px', padding: '0 18px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
          >
            {showUpload ? 'Cancel' : '+ Upload document'}
          </button>
        </div>

        {showUpload && (
          <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '16px' }}>Upload document</p>
            <div
              onClick={() => document.getElementById('file-input')?.click()}
              style={{ border: `2px dashed ${file ? '#40916c' : '#c2ddf0'}`, borderRadius: '8px', padding: '24px', textAlign: 'center', cursor: 'pointer', marginBottom: '14px', background: file ? '#edfaf3' : '#fafcff' }}
            >
              <input id="file-input" type="file" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setCustomName(f.name) } }} />
              {file ? (
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#2d6a4f' }}>{file.name} ({(file.size / 1024).toFixed(0)} KB)</p>
              ) : (
                <>
                  <p style={{ fontSize: '13px', color: '#827d76', marginBottom: '4px' }}>Click to select a file</p>
                  <p style={{ fontSize: '11px', color: '#a8a39c' }}>PDF, Word, Excel, images — up to 50 MB</p>
                </>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={lbl}>Category</label>
                <select style={inp} value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">Select category</option>
                  {Object.entries(CATEGORIES).filter(([k]) => k !== 'all').map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lbl}>Expiration date (optional)</label>
                <input style={inp} type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={lbl}>Document name</label>
              <input style={inp} type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Document name" />
            </div>
            <button
              onClick={handleUpload}
              disabled={!file || !category || uploading}
              style={{ height: '38px', padding: '0 20px', background: (!file || !category) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: (!file || !category) ? 'default' : 'pointer' }}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {Object.entries(CATEGORIES).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setActiveCategory(k)}
              style={{ padding: '5px 12px', borderRadius: '20px', border: `1px solid ${activeCategory === k ? v.border : '#e8e6e2'}`, background: activeCategory === k ? v.bg : '#fff', color: activeCategory === k ? v.color : '#827d76', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}
            >
              {v.label}
              {k !== 'all' && <span style={{ marginLeft: '4px', color: activeCategory === k ? v.color : '#a8a39c' }}>·{docs.filter(d => d.category === k).length}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#a8a39c', padding: '40px', fontSize: '13px' }}>Loading documents...</p>
        ) : filtered.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>No documents yet</p>
            <p style={{ fontSize: '13px', color: '#827d76', lineHeight: '1.6', maxWidth: '360px', margin: '0 auto 20px' }}>
              Upload your compliance documents — registrations, inspection reports, RPPs, dosimetry records, and more.
            </p>
            <button onClick={() => setShowUpload(true)} style={{ height: '40px', padding: '0 20px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
              Upload your first document
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(doc => {
              const cat = CATEGORIES[doc.category] || CATEGORIES.correspondence_forms
              const expiry = getExpiryStatus(doc.expiration_date)
              const ext = getFileExt(doc.filename)
              return (
                <div key={doc.id} style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e8f3fb', border: '1px solid #c2ddf0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '9px', fontWeight: '500', color: '#0d2d5e' }}>{ext}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</p>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', fontWeight: '500', color: cat.color, background: cat.bg, border: `1px solid ${cat.border}`, borderRadius: '20px', padding: '1px 7px' }}>{cat.label}</span>
                      {expiry && <span style={{ fontSize: '10px', fontWeight: '500', color: expiry.color, background: expiry.bg, border: `1px solid ${expiry.border}`, borderRadius: '20px', padding: '1px 7px' }}>{expiry.label}</span>}
                      <span style={{ fontSize: '11px', color: '#a8a39c' }}>{new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      onClick={() => handleDownload(doc)}
                      style={{ padding: '5px 12px', border: '1px solid #c2ddf0', borderRadius: '6px', background: '#fff', color: '#1a5fa8', fontSize: '11px', fontWeight: '500', cursor: 'pointer' }}
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      style={{ padding: '5px 12px', border: '1px solid #f5c6c9', borderRadius: '6px', background: '#fff', color: '#931621', fontSize: '11px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}