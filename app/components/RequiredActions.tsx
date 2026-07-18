'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Task { id: string; task_text: string; urgency: string; sort_order: number }

export default function RequiredActions({ tasks, completedIds }: {
  tasks: Task[]
  completedIds: string[]
}) {
  const [done, setDone] = useState<Set<string>>(new Set(completedIds))
  const router = useRouter()

  const toggle = async (taskId: string) => {
    const isCompleted = done.has(taskId)
    const newDone = new Set(done)
    if (isCompleted) newDone.delete(taskId)
    else newDone.add(taskId)
    setDone(newDone)
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId, completed: !isCompleted })
    })
    router.refresh()
  }

  const total = tasks.length
  const completedCount = done.size
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0

  const groups = [
    { key: 'immediate', label: 'Immediate', color: '#931621', bg: '#fefafb', border: '#f5c6c9' },
    { key: 'upcoming', label: 'Upcoming', color: '#9a3510', bg: '#fff6e8', border: '#f0d4a0' },
    { key: 'ongoing', label: 'Ongoing', color: '#1a5fa8', bg: '#e8f3fb', border: '#c2ddf0' },
  ]

  return (
    <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
      <div style={{ background: '#0d2d5e', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ color: '#fff', fontSize: '14px', fontWeight: '500', margin: 0 }}>Required actions</p>
        <span style={{ fontSize: '12px', color: '#8bb4d4' }}>{completedCount} of {total} complete</span>
      </div>
      <div style={{ height: '3px', background: 'rgba(13,45,94,.12)', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: '#40916c', transition: 'width .4s ease' }} />
      </div>
      <div style={{ padding: '8px 0' }}>
        {groups.map(group => {
          const groupTasks = tasks.filter(t => t.urgency === group.key)
          if (!groupTasks.length) return null
          return (
            <div key={group.key} style={{ padding: '0 14px 4px' }}>
              <p style={{ fontSize: '9px', fontWeight: '500', color: '#a8a39c', textTransform: 'uppercase', letterSpacing: '.1em', padding: '8px 0 4px', margin: 0 }}>{group.label}</p>
              {groupTasks.map(task => {
                const isChecked = done.has(task.id)
                return (
                  <div key={task.id} onClick={() => toggle(task.id)}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '7px 6px', borderRadius: '6px', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f4f7fb')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: isChecked ? 'none' : '1.5px solid #c2ddf0', flexShrink: 0, marginTop: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isChecked ? '#2d6a4f' : '#fff', transition: 'all .15s' }}>
                      {isChecked && <span style={{ color: '#fff', fontSize: '10px', fontWeight: '500' }}>✓</span>}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', color: isChecked ? '#a8a39c' : '#0d2d5e', textDecoration: isChecked ? 'line-through' : 'none', margin: 0, lineHeight: '1.45', transition: 'all .2s' }}>{task.task_text}</p>
                      <span style={{ fontSize: '10px', color: group.color, background: group.bg, border: `1px solid ${group.border}`, borderRadius: '20px', padding: '1px 7px', marginTop: '3px', display: 'inline-block' }}>{group.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
      <p style={{ fontSize: '11px', color: '#a8a39c', padding: '8px 14px 10px', borderTop: '1px solid #eef3fb', margin: 0, fontStyle: 'italic' }}>
        Tasks based on your state&apos;s requirements · Check each item as you complete it · Items can be unchecked
      </p>
    </div>
  )
}