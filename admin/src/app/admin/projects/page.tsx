'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, FolderOpen, Clock, CheckCircle, TrendingUp, Trash2 } from 'lucide-react'

interface Project {
  id: number
  clientId: number | null
  title: string
  type: string
  status: string
  venue: string | null
  eventDate: string | null
  fee: number | null
  currency: string
}

const PIPELINE = [
  'inquiry',
  'quoted',
  'approved',
  'in-progress',
  'completed',
  'invoiced',
  'paid',
]

const PIPELINE_LABELS: Record<string, string> = {
  inquiry: 'Inquiry',
  quoted: 'Quoted',
  approved: 'Approved',
  'in-progress': 'In Progress',
  completed: 'Completed',
  invoiced: 'Invoiced',
  paid: 'Paid',
}

const PIPELINE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  inquiry: { bg: 'bg-[#E3E8ED]', text: 'text-[#5B7A8E]', border: 'border-[#A3B5C4]/30' },
  quoted: { bg: 'bg-[#1B3A4C]/10', text: 'text-[#1B3A4C]', border: 'border-[#1B3A4C]/30' },
  approved: { bg: 'bg-[#91715c]/10', text: 'text-[#91715c]', border: 'border-[#91715c]/30' },
  'in-progress': { bg: 'bg-[#1B3A4C]/10', text: 'text-[#1B3A4C]', border: 'border-[#1B3A4C]/30' },
  completed: { bg: 'bg-[#91715c]/10', text: 'text-[#91715c]', border: 'border-[#91715c]/30' },
  invoiced: { bg: 'bg-[#1B3A4C]/10', text: 'text-[#1B3A4C]', border: 'border-[#1B3A4C]/30' },
  paid: { bg: 'bg-[#2d6a2d]/10', text: 'text-[#2d6a2d]', border: 'border-[#2d6a2d]/30' },
}

const PROJECT_TYPES: Record<string, string> = {
  'dj-booking': 'DJ Booking',
  'album-release': 'Album Release',
  'track-release': 'Track/Single Release',
  'remix': 'Remix Project',
  'mix-podcast': 'Mix/Podcast',
  'partnership': 'Brand Partnership',
  'livestream': 'Live Stream',
  'consulting': 'Consulting',
  'production': 'Production',
}

const emptyProject = { title: '', type: 'dj-booking', status: 'inquiry', venue: '', eventDate: '', fee: '', currency: 'GBP', notes: '' }

const inputClass = 'w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-[#1B3A4C] placeholder-[#A3B5C4] text-sm focus:outline-none focus:border-[#1B3A4C] transition-all'
const cardClass = 'bg-white border border-[#A3B5C4]/30 p-6'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [dragId, setDragId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyProject)

  useEffect(() => { fetchProjects() }, [])

  async function fetchProjects() {
    setLoading(true)
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (err) { console.error('Failed to load projects', err) }
    setLoading(false)
  }

  async function moveStatus(id: number, status: string) {
    try {
      await fetch(`/api/projects/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      fetchProjects()
    } catch (err) { console.error('Move failed', err) }
  }

  async function saveProject(e: React.FormEvent) {
    e.preventDefault()
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, fee: form.fee ? Number(form.fee) : null }),
      })
      setForm(emptyProject)
      setShowForm(false)
      fetchProjects()
    } catch (err) { console.error('Save failed', err) }
  }

  async function deleteProject(id: number) {
    if (!confirm('Delete this project?')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    fetchProjects()
  }

  const stats = {
    total: projects.length,
    inquiry: projects.filter(p => p.status === 'inquiry').length,
    inProgress: projects.filter(p => ['approved', 'in-progress'].includes(p.status)).length,
    completed: projects.filter(p => ['completed', 'invoiced', 'paid'].includes(p.status)).length,
    totalValue: projects.reduce((sum, p) => sum + (p.fee || 0), 0),
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">Project Management</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">Projects</h1>
            <p className="text-sm text-[#5B7A8E] mt-4 font-semibold uppercase tracking-[0.5px]">Pipeline tracker</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setForm(emptyProject) }}
            className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white border border-[#A3B5C4]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#111] text-white rounded-lg"><FolderOpen size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#111] leading-none tracking-[-1px]">{loading ? '–' : stats.total}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B8FAB] font-medium mt-2">Total Projects</p>
        </div>
        <div className="bg-white border border-[#A3B5C4]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#1B3A4C] text-white rounded-lg"><Clock size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#1B3A4C] leading-none tracking-[-1px]">{loading ? '–' : stats.inquiry}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B8FAB] font-medium mt-2">Inquiries</p>
        </div>
        <div className="bg-white border border-[#A3B5C4]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#91715c] text-white rounded-lg"><TrendingUp size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#91715c] leading-none tracking-[-1px]">{loading ? '–' : stats.inProgress}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B8FAB] font-medium mt-2">In Progress</p>
        </div>
        <div className="bg-white border border-[#A3B5C4]/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#2d6a2d] text-white rounded-lg"><CheckCircle size={16} /></div>
          </div>
          <p className="text-[clamp(28px,4vw,42px)] font-black text-[#2d6a2d] leading-none tracking-[-1px]">
            {loading ? '–' : new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(stats.totalValue)}
          </p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#6B8FAB] font-medium mt-2">Pipeline Value</p>
        </div>
      </div>

      {/* New Project Form */}
      {showForm && (
        <form onSubmit={saveProject} className={`${cardClass} mb-8 space-y-5`}>
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#A3B5C4]/30">
            <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold">New Project</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Title <span className="text-red-400">*</span></label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Project title" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                {Object.entries(PROJECT_TYPES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Venue</label>
              <input type="text" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className={inputClass} placeholder="Venue or location" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Event Date</label>
              <input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B8FAB] uppercase tracking-[3px] mb-2">Fee (£)</label>
              <input type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} className={inputClass} placeholder="0.00" min="0" step="0.01" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition">Create Project</button>
          </div>
        </form>
      )}

      {/* Desktop Kanban */}
      {loading ? (
        <p className="text-[#6B8FAB] text-center py-8">Loading...</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <div className="flex gap-4 min-w-[900px]">
              {PIPELINE.map((status) => {
                const style = PIPELINE_STYLES[status] || PIPELINE_STYLES.inquiry
                const statusProjects = projects.filter(p => p.status === status)
                return (
                  <div
                    key={status}
                    className="flex-1 min-w-[140px] bg-[#E3E8ED]/50 rounded-lg p-4 border border-[#A3B5C4]/30"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => { if (dragId !== null) { moveStatus(dragId, status); setDragId(null) } }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-[#111] uppercase tracking-[3px]">{PIPELINE_LABELS[status]}</p>
                      <span className="text-xs text-[#6B8FAB]">{statusProjects.length}</span>
                    </div>
                    <div className="space-y-2">
                      {statusProjects.map((p) => (
                        <Link
                          key={p.id}
                          href={`/admin/projects/${p.id}`}
                          draggable
                          onDragStart={(e) => { e.preventDefault(); setDragId(p.id) }}
                          className="block bg-white rounded-lg p-3 border border-[#A3B5C4]/30 hover:border-[#1B3A4C] transition-shadow group"
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-semibold text-[#1B3A4C] leading-tight">{p.title}</p>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteProject(p.id) }} className="text-xs text-[#A3B5C4] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-xs text-[#5B7A8E] mt-0.5">{p.venue || 'No venue'}</p>
                          {p.fee && <p className="text-xs font-semibold text-[#91715c] mt-1">£{Number(p.fee).toLocaleString()}</p>}
                          <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${style.bg} ${style.text}`}>
                            {PROJECT_TYPES[p.type] || p.type}
                          </span>
                        </Link>
                      ))}
                      {statusProjects.length === 0 && <p className="text-xs text-[#A3B5C4] italic py-2 text-center">Drop here</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mobile List */}
          <div className="md:hidden space-y-6">
            {PIPELINE.map((status) => {
              const style = PIPELINE_STYLES[status] || PIPELINE_STYLES.inquiry
              const statusProjects = projects.filter(p => p.status === status)
              if (statusProjects.length === 0) return null
              return (
                <div key={status} className="bg-white border border-[#A3B5C4]/30 p-4">
                  <p className="text-xs font-bold text-[#111] uppercase tracking-[3px] mb-3">{PIPELINE_LABELS[status]} <span className="text-[#6B8FAB] font-normal">({statusProjects.length})</span></p>
                  <div className="space-y-2">
                    {statusProjects.map((p) => (
                      <div key={p.id} className="bg-[#E3E8ED]/50 rounded-lg p-3 border border-[#A3B5C4]/30">
                        <Link href={`/admin/projects/${p.id}`} className="block">
                          <p className="text-sm font-semibold text-[#1B3A4C] leading-tight">{p.title}</p>
                          <p className="text-xs text-[#5B7A8E] mt-0.5">{p.venue || 'No venue'}</p>
                          {p.fee && <p className="text-xs font-semibold text-[#91715c] mt-1">£{Number(p.fee).toLocaleString()}</p>}
                        </Link>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#A3B5C4]/30">
                          <select
                            value={p.status}
                            onChange={(e) => moveStatus(p.id, e.target.value)}
                            className={`text-xs font-medium px-2 py-1 rounded-full ${style.bg} ${style.text}`}
                          >
                            {PIPELINE.map((s) => (
                              <option key={s} value={s}>{PIPELINE_LABELS[s]}</option>
                            ))}
                          </select>
                          <button onClick={() => deleteProject(p.id)} className="text-xs text-[#A3B5C4] hover:text-red-500">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {projects.length === 0 && <p className="text-[#6B8FAB] text-center py-8">No projects yet. Create your first project above.</p>}
          </div>
        </>
      )}
    </div>
  )
}
