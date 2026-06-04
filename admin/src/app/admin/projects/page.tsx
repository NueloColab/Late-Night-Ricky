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
  inquiry: { bg: 'bg-[#f8f7f6]', text: 'text-[#666]', border: 'border-[#e5e5e5]' },
  quoted: { bg: 'bg-[#5c7a94]/10', text: 'text-[#5c7a94]', border: 'border-[#5c7a94]/30' },
  approved: { bg: 'bg-[#91715c]/10', text: 'text-[#91715c]', border: 'border-[#91715c]/30' },
  'in-progress': { bg: 'bg-[#5c7a94]/10', text: 'text-[#5c7a94]', border: 'border-[#5c7a94]/30' },
  completed: { bg: 'bg-[#91715c]/10', text: 'text-[#91715c]', border: 'border-[#91715c]/30' },
  invoiced: { bg: 'bg-[#5c7a94]/10', text: 'text-[#5c7a94]', border: 'border-[#5c7a94]/30' },
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

const inputClass = 'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c7a94] focus:border-transparent transition-all duration-200'
const cardClass = 'bg-white rounded-lg shadow-sm border border-gray-100 p-6'

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
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-px bg-[#91715c]"></div>
          <p className="text-xs uppercase tracking-widest text-[#5c7a94] font-medium">Project Management</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#1a1a1a] tracking-tight">Projects</h1>
            <p className="text-sm text-[#666] mt-1">Pipeline tracker</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setForm(emptyProject) }}
            className="px-5 py-2.5 bg-[#5c7a94] text-white text-sm font-medium rounded-md hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#1a1a1a] text-white rounded-lg"><FolderOpen size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#1a1a1a]">{loading ? '–' : stats.total}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#666] font-medium">Total Projects</p>
        </div>
        <div className="bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#5c7a94] text-white rounded-lg"><Clock size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#5c7a94]">{loading ? '–' : stats.inquiry}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#666] font-medium">Inquiries</p>
        </div>
        <div className="bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#91715c] text-white rounded-lg"><TrendingUp size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#91715c]">{loading ? '–' : stats.inProgress}</p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#666] font-medium">In Progress</p>
        </div>
        <div className="bg-white border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#2d6a2d] text-white rounded-lg"><CheckCircle size={16} /></div>
          </div>
          <p className="text-2xl font-serif font-semibold text-[#2d6a2d]">
            {loading ? '–' : new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(stats.totalValue)}
          </p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#666] font-medium">Pipeline Value</p>
        </div>
      </div>

      {/* New Project Form */}
      {showForm && (
        <form onSubmit={saveProject} className={`${cardClass} mb-8 space-y-5`}>
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
            <h3 className="text-lg font-serif font-light text-[#1a1a1a]">New Project</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Title <span className="text-red-400">*</span></label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Project title" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                {Object.entries(PROJECT_TYPES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Venue</label>
              <input type="text" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className={inputClass} placeholder="Venue or location" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Event Date</label>
              <input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Fee (£)</label>
              <input type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} className={inputClass} placeholder="0.00" min="0" step="0.01" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-3 bg-[#5c7a94] text-white text-sm font-medium rounded-md hover:opacity-90 transition-opacity">Create Project</button>
          </div>
        </form>
      )}

      {/* Desktop Kanban */}
      {loading ? (
        <p className="text-[#666] text-center py-8">Loading...</p>
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
                    className="flex-1 min-w-[140px] bg-gray-50 rounded-lg p-4 border border-gray-100"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => { if (dragId !== null) { moveStatus(dragId, status); setDragId(null) } }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-[#1a1a1a] uppercase tracking-widest">{PIPELINE_LABELS[status]}</h3>
                      <span className="text-xs text-[#999]">{statusProjects.length}</span>
                    </div>
                    <div className="space-y-2">
                      {statusProjects.map((p) => (
                        <Link
                          key={p.id}
                          href={`/admin/projects/${p.id}`}
                          draggable
                          onDragStart={(e) => { e.preventDefault(); setDragId(p.id) }}
                          className="block bg-white rounded-lg p-3 border border-gray-100 hover:shadow-sm transition-shadow group"
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-semibold text-[#1a1a1a] leading-tight">{p.title}</p>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteProject(p.id) }} className="text-xs text-[#999] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-xs text-[#666] mt-0.5">{p.venue || 'No venue'}</p>
                          {p.fee && <p className="text-xs font-semibold text-[#91715c] mt-1">£{Number(p.fee).toLocaleString()}</p>}
                          <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${style.bg} ${style.text}`}>
                            {PROJECT_TYPES[p.type] || p.type}
                          </span>
                        </Link>
                      ))}
                      {statusProjects.length === 0 && <p className="text-xs text-[#999] italic py-2 text-center">Drop here</p>}
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
                <div key={status} className="bg-white border border-gray-100 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-[#1a1a1a] uppercase tracking-widest mb-3">{PIPELINE_LABELS[status]} <span className="text-[#999] font-normal">({statusProjects.length})</span></h3>
                  <div className="space-y-2">
                    {statusProjects.map((p) => (
                      <div key={p.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <Link href={`/admin/projects/${p.id}`} className="block">
                          <p className="text-sm font-semibold text-[#1a1a1a] leading-tight">{p.title}</p>
                          <p className="text-xs text-[#666] mt-0.5">{p.venue || 'No venue'}</p>
                          {p.fee && <p className="text-xs font-semibold text-[#91715c] mt-1">£{Number(p.fee).toLocaleString()}</p>}
                        </Link>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <select
                            value={p.status}
                            onChange={(e) => moveStatus(p.id, e.target.value)}
                            className={`text-xs font-medium px-2 py-1 rounded-full ${style.bg} ${style.text}`}
                          >
                            {PIPELINE.map((s) => (
                              <option key={s} value={s}>{PIPELINE_LABELS[s]}</option>
                            ))}
                          </select>
                          <button onClick={() => deleteProject(p.id)} className="text-xs text-[#999] hover:text-red-500">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {projects.length === 0 && <p className="text-[#999] text-center py-8">No projects yet. Create your first project above.</p>}
          </div>
        </>
      )}
    </div>
  )
}