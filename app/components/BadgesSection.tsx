'use client'

import { useEffect, useState } from 'react'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlock_condition?: string
}

function BadgeShield({ badge, earned, facilityName }: { badge: Badge; earned: boolean; facilityName?: string }) {
  const shareText = encodeURIComponent(
    `${facilityName || 'Our facility'} just earned the "${badge.name}" badge on ComplianceOS — ${badge.description}. Managing x-ray compliance at app.theradiologycoach.com #RadiationSafety #XrayCompliance`
  )

  const colors = {
    earned: { bg: '#edfaf3', border: '#40916c', icon: '#2d6a4f', badge: '#40916c' },
    locked: { bg: '#f4f7fb', border: '#dce8f5', icon: '#c2ddf0', badge: '#a8a39c' },
  }
  const c = earned ? colors.earned : colors.locked

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ position: 'relative', width: '64px', height: '72px' }}>
        {/* Shield SVG */}
        <svg width="64" height="72" viewBox="0 0 64 72" fill="none">
          <path d="M32 2L4 14V36C4 52 16 65 32 70C48 65 60 52 60 36V14L32 2Z"
            fill={c.bg} stroke={c.border} strokeWidth={earned ? 2 : 1.5}
            style={{ filter: earned ? 'drop-shadow(0 2px 4px rgba(64,145,108,.2))' : 'none' }} />
          {earned ? (
            <text x="32" y="44" textAnchor="middle" fontSize="24" dominantBaseline="middle"
              style={{ filter: 'none' }}>
              {badge.icon}
            </text>
          ) : (
            <path d="M24 36l6 6 10-10" stroke={c.icon} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
        {earned && (
          <div style={{ position: 'absolute', top: -4, right: -4, width: '18px', height: '18px', background: '#40916c', borderRadius: '50%', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '10px', fontWeight: '500' }}>✓</span>
          </div>
        )}
      </div>
      <p style={{ fontSize: '10px', fontWeight: '500', color: earned ? '#0d2d5e' : '#a8a39c', textAlign: 'center', lineHeight: '1.3', maxWidth: '72px', margin: 0 }}>
        {badge.name}
      </p>
      {earned && (
        <div style={{ display: 'flex', gap: '4px' }}>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=https://app.theradiologycoach.com&summary=${shareText}`}
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '9px', color: '#0077b5', background: '#e8f4fd', border: '1px solid #bdddf0', borderRadius: '3px', padding: '1px 5px', textDecoration: 'none' }}>
            in
          </a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=https://app.theradiologycoach.com"
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '9px', color: '#1877f2', background: '#e7f0fd', border: '1px solid #b8d0f8', borderRadius: '3px', padding: '1px 5px', textDecoration: 'none' }}>
            fb
          </a>
        </div>
      )}
    </div>
  )
}

export default function BadgesSection({ badges, earnedIds, facilityName, ktsComplete, techniqueAccessed }: {
  badges: Badge[]
  earnedIds: string[]
  facilityName?: string
  ktsComplete?: boolean
  techniqueAccessed?: boolean
}) {
  const [localEarned, setLocalEarned] = useState<string[]>(earnedIds)

  useEffect(() => {
    setLocalEarned(earnedIds)
  }, [earnedIds])

  const earnedCount = localEarned.length + (ktsComplete ? 1 : 0) + (techniqueAccessed ? 1 : 0)
  const totalCount = badges.length + 2

  const specialBadges = [
    {
      id: 'kts_complete',
      name: 'Training Complete',
      description: 'All Keys to Success items checked',
      icon: '🎓',
      earned: ktsComplete || false,
    },
    {
      id: 'technique_ready',
      name: 'Technique Ready',
      description: 'Technique chart accessed',
      icon: '📐',
      earned: techniqueAccessed || false,
    },
  ]

  return (
    <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #eef3fb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>Compliance badges</p>
        <span style={{ fontSize: '11px', color: '#a8a39c' }}>{earnedCount} of {totalCount} earned</span>
      </div>

      {/* Progress strip */}
      <div style={{ height: '2px', background: '#eef3fb' }}>
        <div style={{ height: '100%', width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%`, background: '#40916c', transition: 'width .4s' }} />
      </div>

      <div style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
        {/* Regular badges */}
        {badges.map(badge => (
          <BadgeShield
            key={badge.id}
            badge={badge}
            earned={localEarned.includes(badge.id)}
            facilityName={facilityName}
          />
        ))}
        {/* Special badges */}
        {specialBadges.map(badge => (
          <BadgeShield
            key={badge.id}
            badge={badge}
            earned={badge.earned}
            facilityName={facilityName}
          />
        ))}
      </div>

      <p style={{ fontSize: '11px', color: '#a8a39c', padding: '8px 20px 12px', borderTop: '1px solid #eef3fb', margin: 0, fontStyle: 'italic', textAlign: 'center' }}>
        Earned by completing real compliance milestones · Share achievements on social media
      </p>
    </div>
  )
}