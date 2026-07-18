'use client'

export default function BadgesSection({ badges, earnedIds, facilityName }: {
  badges: any[]
  earnedIds: string[]
  facilityName?: string
}) {
  if (!badges.length) return null

  const shareText = (badge: any) => {
    const name = facilityName || 'Our facility'
    return encodeURIComponent(`${name} just earned the "${badge.name}" compliance badge on ComplianceOS — ${badge.description} Managing x-ray compliance at app.theradiologycoach.com #RadiationSafety #XrayCompliance #TheRadiologyCoach`)
  }

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
              {earned ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: '500', color: '#2d6a4f', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '20px', padding: '2px 8px', marginBottom: '4px' }}>✓ Earned</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=https://app.theradiologycoach.com&summary=${shareText(badge)}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '10px', color: '#0077b5', background: '#e8f4fd', border: '1px solid #bdddf0', borderRadius: '4px', padding: '2px 7px', textDecoration: 'none' }}>
                      LinkedIn
                    </a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=https://app.theradiologycoach.com`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '10px', color: '#1877f2', background: '#e7f0fd', border: '1px solid #b8d0f8', borderRadius: '4px', padding: '2px 7px', textDecoration: 'none' }}>
                      Facebook
                    </a>
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: '10px', fontWeight: '500', color: '#a8a39c', background: '#f4f7fb', border: '1px solid #e8e6e2', borderRadius: '20px', padding: '2px 8px' }}>Locked</span>
              )}
            </div>
          )
        })}
      </div>
      <p style={{ fontSize: '11px', color: '#a8a39c', padding: '8px 20px 10px', borderTop: '1px solid #eef3fb', margin: 0, fontStyle: 'italic' }}>
        Badges earned by completing real compliance milestones · Share your achievement on social media
      </p>
    </div>
  )
}