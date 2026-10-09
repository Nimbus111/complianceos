'use client'

interface Props {
  equipmentCount: number
  docCount: number
  operatorCount: number
  rspCount: number
  taskPct: number
}

const prompts = (p: Props) => [
  p.equipmentCount === 0 && {
    section: 'Equipment & Maintenance',
    msg: 'Add your first x-ray device to activate equipment tracking, QA procedures, and service contacts.',
    href: '/dashboard/equipment',
    action: 'Add device'
  },
  p.operatorCount === 0 && {
    section: 'Records & Documents',
    msg: 'Add your licensed x-ray operators with credentials — most states require documented operator records.',
    href: '/dashboard/operators',
    action: 'Add operators'
  },
  p.docCount === 0 && {
    section: 'Records & Documents',
    msg: 'Upload your equipment registration certificate or Assembly Form — this is the most frequently requested document during inspections.',
    href: '/dashboard/documents',
    action: 'Upload document'
  },
  p.rspCount === 0 && {
    section: 'Compliance Toolkit',
    msg: 'Start building your Radiation Protection Program. Many states require a written RPP on file at all times.',
    href: '/dashboard/rsp',
    action: 'Start RPP'
  },
].filter(Boolean) as { section: string; msg: string; href: string; action: string }[]

export default function DashboardEmptyPrompts(props: Props) {
  if (props.taskPct >= 50) return null
  const items = prompts(props)
  if (items.length === 0) return null

  return (
    <div style={{ marginBottom: '20px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', background: '#f8fbfe', border: '1px solid #c2ddf0', borderLeft: '3px solid #1a5fa8', borderRadius: '8px', padding: '12px 16px', marginBottom: '8px' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '10px', fontWeight: '600', color: '#4a6d8c', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 3px' }}>{item.section}</p>
            <p style={{ fontSize: '13px', color: '#0d2d5e', margin: 0, lineHeight: '1.5' }}>{item.msg}</p>
          </div>
          <a href={item.href} style={{ fontSize: '12px', fontWeight: '500', color: '#fff', background: '#1a5fa8', borderRadius: '20px', padding: '5px 14px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, alignSelf: 'center' }}>
            {item.action} →
          </a>
        </div>
      ))}
    </div>
  )
}