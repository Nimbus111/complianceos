// ─────────────────────────────────────────────────────────
// ADD YOUR VIDEOS HERE
// For each video:
//   id: the part after ?v= in your YouTube URL
//   title: your video's actual title
//   description: one sentence describing what it covers
//   category: group name (videos with the same category appear together)
// ─────────────────────────────────────────────────────────

const videos = [
  {
    id: 'H9o-N_8wSds&t',
    title: 'What is a SHIELDING PLAN and Do I NEED One??',
    description: ' The Radiology Coach breaks this down Shielding Plans into digestible information so your clinic can make proper assessments.',
    category: 'Getting Started',
  },
  {
    id: 'YSva26QVKVM',
    title: 'BUYING X ray Machines WHERE DO I EVEN START??!!',
    description: 'There is no manual on how to buy x-ray machines (until now!!). Here are some hints on how to land the best system for your practice, with little or no regrets.',
    category: 'Getting Started',
  },
  {
    id: 'Kolux_kGFO8',
    title: '6 THINGS EVERY Medical X ray Department SHOULD HAVE',
    description: 'Often, managers are tasked with equipping x-ray rooms  with the basic components. it takes foresight and experience to determine what is needed in these environments. Here are a few items that should be considered to enable a practice to run their department proficiently.',
    category: 'Getting Started',
  },
  {
    id: 'CvwCsr9TSx4',
    title: 'Does My X-RAY MACHINE Need Regular SERVICING??',
    description: 'X-ray machine lifespans are usually decades long. However, some machines do experience frequent servicing, shorter lifespans, and nagging glitches when not appropriately cared for. Here are some points of interest regarding x-ray machines.',
    category: 'Getting Started',
  },
  {
    id: 'hIgJKoKK6XU',
    title: 'Is It Better to Buy from X-RAY MANUFACTURERS??',
    description: 'Here are a few insights for medical leaders looking for the best solutions.',
    category: 'Getting Started',
  },
  {
    id: 'rfKPb5ibiy8&t',
    title: '5 Things THEY NEVER TELL YOU About X ray APRONS',
    description: 'Here are some helpful hints on choosing and tending to these garments.',
    category: 'Lead Aprons',
  },
  {
    id: 'Wgj9GXYRhnM',
    title: 'How to INSPECT Lead APRONS',
    description: 'Here are some pointers on effectively keeping your lead protection in working order.',
    category: 'Lead Aprons',
  },
  // Add as many as you want — just copy a block above and fill it in
]

// ─────────────────────────────────────────────────────────
// NO CHANGES NEEDED BELOW THIS LINE
// ─────────────────────────────────────────────────────────

export default function TrainingPage() {
  const categories = [...new Set(videos.map(v => v.category))]

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
        <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>Video Training Center</h1>
            <p style={{ fontSize: '13px', color: '#827d76' }}>Expert x-ray compliance guidance from Gregory Turner — The Radiology Coach</p>
          </div>
          <a href="https://www.youtube.com/c/TheRadiologyCoach" target="_blank" rel="noopener noreferrer"
            style={{ height: '36px', padding: '0 16px', background: '#ff0000', color: '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: '500', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            ▶ Subscribe on YouTube
          </a>
        </div>

        {videos.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>No videos added yet</p>
            <p style={{ fontSize: '13px', color: '#827d76' }}>Add your YouTube videos to the top of the training page file.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {categories.map(cat => (
              <div key={cat}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>{cat}</p>
                  <div style={{ flex: 1, height: '1px', background: '#dce8f5' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {videos.filter(v => v.category === cat).map(video => (
                    <a key={video.id}
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}>
                      <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#0d2d5e' }}>
                          <iframe
                            src={`https://www.youtube.com/embed/${video.id}`}
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <div style={{ padding: '12px 14px' }}>
                          <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px', lineHeight: '1.4' }}>{video.title}</p>
                          <p style={{ fontSize: '11px', color: '#827d76', lineHeight: '1.55', margin: 0 }}>{video.description}</p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '10px', padding: '14px 20px', marginTop: '28px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <p style={{ fontSize: '13px', color: '#0d2d5e', flex: 1, margin: 0 }}>To add more videos, open the training page file and add entries to the <strong>videos</strong> list at the top.</p>
        </div>
      </div>
    </div>
  )
}