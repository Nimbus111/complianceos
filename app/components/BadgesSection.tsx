'use client'

export default function BadgesSection({ badges, earnedIds }: {
  badges: any[]
  earnedIds: string[]
}) {
  if (!badges.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden', marginTop: '16px' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef3fb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>Compliance badges</p>
        <span style={{ fontSize: '11px', color: '#a8a39c' }}>{earnedIds.length} of {badges.length} earned</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '16px 20px' }}>
        {badges.map(badge => {
          const earned = earnedIds.includes(badge.id)
          return (
            <div key={badge.id} style={{ border: `1px solid ${earned ? '#b8e8cc' : '#e8e6e2'}`, background: earned ? '#edfaf3' : '#fafcff', borderRadius: '10px', padding: '14px', textAlign: 'center', opacity: earned ? 1 : 0.7 }}>
              <p style={{ fontSize: '28px', marginBottom: '8px', filter: earned ? 'none' : 'grayscale(100%)', opacity: earned ? 1 : 0.5, lineHeight: 1 }}>{badge.icon}</p>
              <p style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>{badge.name}</p>
              <p style={{ fontSize: '11px', color: '#827d76', lineHeight: '1.5', marginBottom: '8px' }}>{badge.description}</p>
              {earned
                ? <span style={{ fontSize: '10px', fontWeight: '500', color: '#2d6a4f', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '20px', padding: '2px 8px' }}>Earned</span>
                : <span style={{ fontSize: '10px', fontWeight: '500', color: '#a8a39c', background: '#f4f7fb', border: '1px solid #e8e6e2', borderRadius: '20px', padding: '2px 8px' }}>Locked</span>
              }
            </div>
          )
        })}
      </div>
      <p style={{ fontSize: '11px', color: '#a8a39c', padding: '8px 20px 10px', borderTop: '1px solid #eef3fb', margin: 0, fontStyle: 'italic' }}>
        Badges are earned by completing real compliance milestones
      </p>
    </div>
  )
}