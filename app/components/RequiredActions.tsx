'use client'

import { useState } from 'react'

interface Task {
  id: string
  task_text: string
  task_category?: string
  detail_text?: string | null
  urgency: string
  sort_order: number
  link_to?: string | null
}

interface Props {
  tasks: Task[]
  completedIds: string[]
  facilityState?: string
}

export default function RequiredActions({ tasks, completedIds, facilityState }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set(completedIds))
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = async (taskId: string) => {
    const isChecked = checked.has(taskId)
    const next = new Set(checked)
    isChecked ? next.delete(taskId) : next.add(taskId)
    setChecked(next)
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId, completed: !isChecked })
    })
  }

  const toggleExpand = (taskId: string) => {
    const next = new Set(expanded)
    next.has(taskId) ? next.delete(taskId) : next.add(taskId)
    setExpanded(next)
  }

  const [showOngoing, setShowOngoing] = useState(false)

  const immeditateTasks = tasks.filter(t => t.urgency === 'Immediate')
  const ongoingTasks = tasks.filter(t => t.urgency === 'Ongoing')
  const groups = [
    { label: 'Immediate', color: '#931621', bg: '#fefafb', border: '#f5c6c9', leftBorder: '#931621', tasks: immeditateTasks },
    { label: 'Ongoing', color: '#1a5fa8', bg: '#f4f7fb', border: '#c2ddf0', leftBorder: '#c2ddf0', tasks: ongoingTasks },
  ].filter(g => g.tasks.length > 0)

  const totalApplicable = tasks.length
  const totalCompleted = tasks.filter(t => checked.has(t.id)).length
  const pct = totalApplicable > 0 ? Math.round((totalCompleted / totalApplicable) * 100) : 0

  if (tasks.length === 0) return (
    <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
      <p style={{ fontSize: '13px', color: '#a8a39c', margin: 0 }}>
        No regulation data found for your state and facility type.{' '}
        <a href="/dashboard/settings" style={{ color: '#1a5fa8', textDecoration: 'none' }}>Check your facility settings →</a>
      </p>
    </div>
  )

  return (
    <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>

      {/* Header */}
      <div style={{ padding: '14px 20px', background: '#0d2d5e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#fff', margin: 0 }}>Required Actions</p>
          <p style={{ fontSize: '11px', color: '#8bb4d4', margin: '2px 0 0' }}>
            {totalCompleted} of {totalApplicable} complete · filtered to your state and modalities
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '26px', fontWeight: '500', color: pct === 100 ? '#40916c' : '#fff', lineHeight: 1, margin: 0 }}>{pct}%</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '3px', background: '#1a3a6a' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#40916c' : '#4a9eff', transition: 'width .4s' }} />
      </div>

      {/* Task groups */}
      <div style={{ padding: '12px 0' }}>
        {groups.filter(g => g.label === 'Immediate' || showOngoing).map(group => (
          <div key={group.label} style={{ marginBottom: '8px' }}>
            <div style={{ padding: '6px 20px 4px' }}>
              <span style={{ fontSize: '10px', fontWeight: '500', color: group.color, background: group.bg, border: `1px solid ${group.border}`, borderRadius: '20px', padding: '2px 10px', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                {group.label} — {group.tasks.filter(t => checked.has(t.id)).length}/{group.tasks.length}
              </span>
            </div>

            {group.tasks.map(task => {
              const done = checked.has(task.id)
              const isExpanded = expanded.has(task.id)
              const hasDetail = !!(task.detail_text || task.task_category)

              return (
                <div key={task.id} style={{ borderBottom: '1px solid #f4f7fb' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '9px 16px 9px 20px', background: done ? '#f8fffe' : '#fff', borderLeft: `3px solid ${done ? '#b8e8cc' : (task.urgency === 'Immediate' ? '#f5c6c9' : '#dce8f5')}` }}>

                    {/* Checkbox */}
                    <button onClick={() => toggle(task.id)}
                      style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${done ? '#40916c' : '#c2ddf0'}`, background: done ? '#40916c' : '#fff', cursor: 'pointer', flexShrink: 0, marginTop: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                      {done && <span style={{ color: '#fff', fontSize: '12px', lineHeight: 1 }}>✓</span>}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <p style={{ fontSize: '13px', fontWeight: done ? '400' : '500', color: done ? '#a8a39c' : '#0d2d5e', margin: 0, textDecoration: done ? 'line-through' : 'none', flex: 1 }}>
                          {task.task_text}
                        </p>
                        {task.link_to && !done && (
                          <a href={task.link_to}
                            style={{ fontSize: '10px', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '1px 8px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            Open →
                          </a>
                        )}
                        {hasDetail && (
                          <button onClick={() => toggleExpand(task.id)}
                            style={{ fontSize: '11px', color: '#a8a39c', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', flexShrink: 0 }}>
                            {isExpanded ? '▲' : '▼'}
                          </button>
                        )}
                      </div>

                      {/* Expandable detail */}
                      {isExpanded && (
                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {task.task_category && (
                            <p style={{ fontSize: '12px', color: '#4a6d8c', lineHeight: '1.65', margin: 0 }}>
                              {task.task_category}
                            </p>
                          )}
                          {task.detail_text && task.detail_text !== task.task_category && (
                            <div style={{ background: '#f4f7fb', borderLeft: '3px solid #c2ddf0', borderRadius: '0 6px 6px 0', padding: '8px 12px' }}>
                              <p style={{ fontSize: '10px', fontWeight: '500', color: '#4a6d8c', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '.06em' }}>State requirement</p>
                              <p style={{ fontSize: '12px', color: '#1e1c1a', lineHeight: '1.65', margin: 0 }}>{task.detail_text}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {ongoingTasks.length > 0 && (
        <button onClick={() => setShowOngoing(!showOngoing)}
          style={{ width: '100%', padding: '10px 20px', background: '#f4f7fb', border: 'none', borderTop: '1px solid #eef3fb', cursor: 'pointer', fontSize: '12px', color: '#4a6d8c', fontWeight: '500', textAlign: 'left', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{showOngoing ? '▲ Hide' : '▾ Show'} {ongoingTasks.length} ongoing compliance items</span>
          <span style={{ fontSize: '10px', color: '#a8a39c', fontWeight: '400' }}>
            {ongoingTasks.filter(t => checked.has(t.id)).length} of {ongoingTasks.length} complete
          </span>
        </button>
      )}

      {pct === 100 && (
        <div style={{ padding: '12px 20px', background: '#edfaf3', borderTop: '1px solid #b8e8cc', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', color: '#2d6a4f', margin: 0 }}>
            ✓ All required actions complete — inspection ready
          </p>
        </div>
      )}
    </div>
  )
}