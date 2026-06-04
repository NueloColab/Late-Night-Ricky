"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Project {
  id: number;
  clientId: number | null;
  title: string;
  type: string;
  status: string;
  venue: string | null;
  eventDate: string | null;
  fee: number | null;
  currency: string;
}

const PIPELINE = [
  "inquiry",
  "quoted",
  "approved",
  "in-progress",
  "completed",
  "invoiced",
  "paid",
];

const PIPELINE_LABELS: Record<string, string> = {
  inquiry: "Inquiry",
  quoted: "Quoted",
  approved: "Approved",
  "in-progress": "In Progress",
  completed: "Completed",
  invoiced: "Invoiced",
  paid: "Paid",
};

const emptyProject = { title: "", type: "dj-booking", status: "inquiry", venue: "", eventDate: "", fee: "", currency: "GBP", notes: "" };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyProject);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Failed to load projects", err);
    }
    setLoading(false);
  }

  async function moveStatus(id: number, status: string) {
    try {
      await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchProjects();
    } catch (err) {
      console.error("Move failed", err);
    }
  }

  async function saveProject(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fee: form.fee ? Number(form.fee) : null,
        }),
      });
      setForm(emptyProject);
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      console.error("Save failed", err);
    }
  }

  async function deleteProject(id: number) {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    fetchProjects();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl lg:text-5xl font-semibold text-[#1B3A4C] tracking-tight">Projects</h1>
          <p className="text-[#8FA8BE] mt-2 text-sm font-medium tracking-wide uppercase">Pipeline tracker</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm(emptyProject); }}
          className="px-5 py-2.5 bg-[#1B3A4C] text-white text-sm font-semibold uppercase tracking-wide rounded-lg hover:bg-[#2a4a5c] transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Project"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveProject} className="bg-white rounded-xl shadow-sm p-6 mb-8 space-y-4 border border-[#E3E8ED]">
          <h3 className="text-lg font-bold text-[#1B3A4C] mb-2">New Project</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Title", key: "title", type: "text", required: true },
              { label: "Venue", key: "venue", type: "text", required: false },
              { label: "Event Date", key: "eventDate", type: "date", required: false },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  required={f.required}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-[#E3E8ED] rounded-lg focus:border-[#1B3A4C] focus:outline-none text-sm"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border-2 border-[#E3E8ED] rounded-lg focus:border-[#1B3A4C] focus:outline-none text-sm"
              >
                <option value="dj-booking">DJ Booking</option>
                <option value="production">Production</option>
                <option value="remix">Remix</option>
                <option value="consulting">Consulting</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-1.5">Fee</label>
              <input
                type="number"
                value={form.fee}
                onChange={(e) => setForm({ ...form, fee: e.target.value })}
                className="w-full px-3 py-2 border-2 border-[#E3E8ED] rounded-lg focus:border-[#1B3A4C] focus:outline-none text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-[#2a4a5c] transition-colors">Save</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-[#8FA8BE]">Loading...</p>
      ) : (
        <>
          {/* Desktop kanban */}
          <div className="hidden md:block overflow-x-auto">
            <div className="flex gap-4 min-w-[900px]">
              {PIPELINE.map((status) => (
                <div
                  key={status}
                  className="flex-1 min-w-[140px] bg-white rounded-xl p-4 border border-[#E3E8ED]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragId !== null) {
                      moveStatus(dragId, status);
                      setDragId(null);
                    }
                  }}
                >
                  <h3 className="text-xs font-bold text-[#1B3A4C] uppercase tracking-widest mb-3">{PIPELINE_LABELS[status]}</h3>
                  <div className="space-y-2">
                    {projects
                      .filter((p) => p.status === status)
                      .map((p) => (
                        <Link
                          key={p.id}
                          href={`/admin/projects/${p.id}`}
                          draggable
                          onDragStart={(e) => {
                            e.preventDefault();
                            setDragId(p.id);
                          }}
                          className="bg-[#E3E8ED] rounded-lg p-3 cursor-move hover:bg-[#d1d8dd] transition-colors group block"
                        >
                          <p className="text-sm font-semibold text-[#1B3A4C] leading-tight">{p.title}</p>
                          <p className="text-xs text-[#8FA8BE] mt-0.5">{p.venue || "No venue"}</p>
                          {p.fee && <p className="text-xs font-semibold text-[#1B3A4C] mt-1">£{Number(p.fee).toLocaleString()}</p>}
                          <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => deleteProject(p.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                          </div>
                        </Link>
                      ))}
                    {projects.filter((p) => p.status === status).length === 0 && (
                      <p className="text-xs text-[#8FA8BE] italic">Drop here</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile list view */}
          <div className="md:hidden space-y-6">
            {PIPELINE.map((status) => {
              const statusProjects = projects.filter((p) => p.status === status);
              if (statusProjects.length === 0) return null;
              return (
                <div key={status} className="bg-white rounded-xl p-4 border border-[#E3E8ED]">
                  <h3 className="text-xs font-bold text-[#1B3A4C] uppercase tracking-widest mb-3">{PIPELINE_LABELS[status]} <span className="text-[#8FA8BE] font-normal">({statusProjects.length})</span></h3>
                  <div className="space-y-2">
                    {statusProjects.map((p) => (
                      <div key={p.id} className="bg-[#E3E8ED] rounded-lg p-3">
                        <Link href={`/admin/projects/${p.id}`} className="block">
                          <p className="text-sm font-semibold text-[#1B3A4C] leading-tight">{p.title}</p>
                          <p className="text-xs text-[#8FA8BE] mt-0.5">{p.venue || "No venue"}</p>
                          {p.fee && <p className="text-xs font-semibold text-[#1B3A4C] mt-1">£{Number(p.fee).toLocaleString()}</p>}
                        </Link>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/50">
                          <select
                            value={p.status}
                            onChange={(e) => moveStatus(p.id, e.target.value)}
                            className="text-xs bg-white border border-[#E3E8ED] rounded px-2 py-1 text-[#1B3A4C]"
                          >
                            {PIPELINE.map((s) => (
                              <option key={s} value={s}>{PIPELINE_LABELS[s]}</option>
                            ))}
                          </select>
                          <button onClick={() => deleteProject(p.id)} className="text-xs text-red-500">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {projects.length === 0 && <p className="text-[#8FA8BE] text-center py-8">No projects yet. Tap "+ Add Project" to create one.</p>}
          </div>
        </>
      )}
    </div>
  );
}
