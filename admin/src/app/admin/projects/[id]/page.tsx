"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Plus,
  Trash2,
  Upload,
  Users,
  FileText,
  CheckCircle,
  Circle,
  PoundSterling,
  AlertTriangle,
} from "lucide-react";

interface Service {
  name: string;
  status: string;
  fee: number | null;
}

interface TeamMember {
  id?: string;
  name: string;
  role: string;
  email: string;
  fee: number | null;
  notes: string;
}

interface ProjectFile {
  name: string;
  url: string;
  phase: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  assignee: string;
  dueDate: string | null;
}

interface MoodBoardImage {
  url: string;
  caption: string;
}

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
  notes: string | null;
  description: string | null;
  priority: string | null;
  deadline: string | null;
  progress: number | null;
  services: Service[] | null;
  team: TeamMember[] | null;
  files: ProjectFile[] | null;
  tasks: Task[] | null;
  moodBoard: MoodBoardImage[] | null;
  contractNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Quote {
  id: number;
  status: string;
  subtotal: number;
  total: number;
  createdAt: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  status: string;
  subtotal: number;
  total: number;
  dueDate: string | null;
  createdAt: string;
}

const PIPELINE_LABELS: Record<string, string> = {
  inquiry: "Inquiry",
  quoted: "Quoted",
  approved: "Approved",
  "in-progress": "In Progress",
  completed: "Completed",
  invoiced: "Invoiced",
  paid: "Paid",
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  medium: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  low: { bg: "bg-[#E3E8ED]/50", text: "text-gray-600", border: "border-[#A3B5C4]/30" },
};

const SERVICE_STATUSES = ["Pending", "In Progress", "Delivered"];

const SERVICE_STATUS_STYLES: Record<string, string> = {
  Pending: "bg-[#E3E8ED]/50 text-gray-600",
  "In Progress": "bg-[#1B3A4C]/10 text-[#1B3A4C]",
  Delivered: "bg-[#2d6a2d]/10 text-[#2d6a2d]",
};

const TEAM_ROLES = ["DJ", "Producer", "Engineer", "Manager", "Coordinator", "Other"];

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0, maximumFractionDigits: 0 });

function getDeadlineInfo(deadline: string | null, status: string) {
  if (!deadline) return null;
  const s = (status || "").toLowerCase();
  if (s === "completed" || s === "paid" || s === "cancelled") return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dl = new Date(deadline);
  dl.setHours(0, 0, 0, 0);
  const diffDays = Math.round((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { text: `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""} overdue`, color: "text-red-600", overdue: true };
  if (diffDays === 0) return { text: "Due today", color: "text-red-600", overdue: false };
  if (diffDays <= 7) return { text: `Due in ${diffDays} day${diffDays !== 1 ? "s" : ""}`, color: "text-amber-600", overdue: false };
  return { text: `Due in ${diffDays} days`, color: "text-[#2d6a2d]", overdue: false };
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Sub-section states
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  // Form states
  const [form, setForm] = useState<Partial<Project>>({});
  const [newService, setNewService] = useState({ name: "", status: "Pending", fee: null as number | null });
  const [newTeam, setNewTeam] = useState({ name: "", role: "DJ", email: "", fee: null as number | null, notes: "" });
  const [newTask, setNewTask] = useState({ text: "", assignee: "", dueDate: "" });
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [filePhase, setFilePhase] = useState("");

  // File ref removed - upload uses URL input

  useEffect(() => {
    if (!id) return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [projRes, quotesRes, invRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/projects/${id}/quotes`),
        fetch(`/api/projects/${id}/invoices`),
      ]);
      const projData = await projRes.json();
      const quotesData = await quotesRes.json();
      const invData = await invRes.json();
      setProject(projData.project);
      setQuotes(quotesData.quotes || []);
      setInvoices(invData.invoices || []);
      if (projData.project) setForm(projData.project);
    } catch (err) {
      console.error("Failed to load project", err);
    }
    setLoading(false);
  }

  async function updateProject(updates: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      setProject(data.project);
      if (data.project) setForm(data.project);
    } catch (err) {
      console.error("Update failed", err);
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    await updateProject({
      title: form.title,
      type: form.type,
      status: form.status,
      venue: form.venue,
      eventDate: form.eventDate,
      fee: form.fee ? Number(form.fee) : null,
      notes: form.notes,
      description: form.description,
      priority: form.priority,
      deadline: form.deadline,
    });
    setEditing(false);
  }

  async function moveStatus(newStatus: string) {
    await updateProject({ status: newStatus });
  }

  // Services
  async function addService() {
    if (!newService.name.trim()) return;
    const services = [...(project?.services || []), { ...newService }];
    await updateProject({ services });
    setNewService({ name: "", status: "Pending", fee: null });
    setShowServiceForm(false);
  }

  async function removeService(index: number) {
    const services = (project?.services || []).filter((_, i) => i !== index);
    await updateProject({ services });
  }

  async function updateServiceStatus(index: number, status: string) {
    const services = [...(project?.services || [])];
    services[index] = { ...services[index], status };
    await updateProject({ services });
  }

  // Team
  async function addTeamMember() {
    if (!newTeam.name.trim()) return;
    const member: TeamMember = { ...newTeam, id: String(Date.now()) };
    const team = [...(project?.team || []), member];
    await updateProject({ team });
    setNewTeam({ name: "", role: "DJ", email: "", fee: null, notes: "" });
    setShowTeamForm(false);
  }

  async function removeTeamMember(memberId: string) {
    const team = (project?.team || []).filter((m) => m.id !== memberId);
    await updateProject({ team });
  }

  // Tasks
  async function addTask() {
    if (!newTask.text.trim()) return;
    const task: Task = { id: String(Date.now()), text: newTask.text, completed: false, assignee: newTask.assignee, dueDate: newTask.dueDate || null };
    const tasks = [...(project?.tasks || []), task];
    await updateProject({ tasks });
    setNewTask({ text: "", assignee: "", dueDate: "" });
    setShowTaskInput(false);
  }

  async function toggleTask(taskId: string) {
    const tasks = (project?.tasks || []).map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    await updateProject({ tasks });
  }

  async function removeTask(taskId: string) {
    const tasks = (project?.tasks || []).filter((t) => t.id !== taskId);
    await updateProject({ tasks });
  }

  // Files
  async function addFile() {
    if (!fileName.trim() || !fileUrl.trim()) return;
    const file: ProjectFile = { name: fileName, url: fileUrl, phase: filePhase || "General", uploadedAt: new Date().toISOString(), uploadedBy: "Admin" };
    const files = [...(project?.files || []), file];
    await updateProject({ files });
    setFileName("");
    setFileUrl("");
    setFilePhase("");
    setShowFileUpload(false);
  }

  async function removeFile(index: number) {
    const files = (project?.files || []).filter((_, i) => i !== index);
    await updateProject({ files });
  }

  // Progress
  async function updateProgress(value: number) {
    await updateProject({ progress: value });
  }

  // Auto-progress based on completed tasks
  function calculateProgress() {
    const tasks = project?.tasks || [];
    if (tasks.length === 0) return project?.progress || 0;
    const completed = tasks.filter((t) => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  }

  const totalQuoted = quotes.reduce((s, q) => s + Number(q.total), 0);
  const totalInvoiced = invoices.reduce((s, i) => s + Number(i.total), 0);
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total), 0);
  const outstanding = totalInvoiced - totalPaid;
  const teamCosts = (project?.team || []).reduce((s, m) => s + (Number(m.fee) || 0), 0);
  const deadlineInfo = getDeadlineInfo(project?.deadline || null, project?.status || "");
  const progress = calculateProgress();

  if (loading) return <p className="text-[#5B7A8E] p-8 text-center">Loading...</p>;
  if (!project) return <p className="text-[#5B7A8E] p-8 text-center">Project not found.</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/projects" className="text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest hover:underline flex items-center gap-1 mb-3">
          <ArrowLeft size={12} /> Back to Pipeline
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="font-black text-[clamp(28px,4vw,42px)] text-[#111] tracking-[-1px] uppercase">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded ${project.status === "paid" ? "bg-[#2d6a2d]/10 text-[#2d6a2d]" : project.status === "in-progress" || project.status === "approved" ? "bg-[#1B3A4C]/10 text-[#1B3A4C]" : project.status === "completed" || project.status === "invoiced" ? "bg-[#6B8FAB]/10 text-[#6B8FAB]" : "bg-[#E3E8ED]/50 text-[#5B7A8E]"}`}>
                {PIPELINE_LABELS[project.status] || project.status}
              </span>
              <span className="text-xs text-[#5B7A8E] uppercase tracking-wide">{project.type.replace(/-/g, " ")}</span>
              {project.venue && <span className="text-xs text-[#5B7A8E]">· {project.venue}</span>}
              {project.eventDate && <span className="text-xs text-[#5B7A8E]">· {new Date(project.eventDate + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>}
              {project.priority && (
                <span className={`text-xs font-medium uppercase tracking-wide px-2 py-0.5 rounded ${PRIORITY_STYLES[project.priority]?.bg || ""} ${PRIORITY_STYLES[project.priority]?.text || ""}`}>
                  {project.priority}
                </span>
              )}
              {deadlineInfo && (
                <span className={`text-xs font-medium flex items-center gap-1 ${deadlineInfo.color}`}>
                  {deadlineInfo.overdue && <AlertTriangle size={12} />}
                  {deadlineInfo.text}
                </span>
              )}
            </div>
            {project.description && <p className="text-sm text-[#5B7A8E] mt-2 max-w-2xl">{project.description}</p>}
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="px-5 py-2 border-2 border-[#A3B5C4]/30 rounded-full text-[11px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:border-[#1B3A4C] transition flex items-center gap-2 flex-shrink-0"
          >
            <Edit size={14} /> {editing ? "Cancel" : "Edit Project"}
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Agreed Fee", value: project.fee ? gbp.format(project.fee) : "---", colour: "#1a1a1a" },
          { label: "Total Quoted", value: gbp.format(totalQuoted), colour: "#1B3A4C" },
          { label: "Total Invoiced", value: gbp.format(totalInvoiced), colour: "#6B8FAB" },
          { label: "Outstanding", value: gbp.format(outstanding), colour: outstanding > 0 ? "#b45309" : "#2d6a2d" },
          { label: "Team Costs", value: gbp.format(teamCosts), colour: "#666" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[#A3B5C4]/30 rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-1">{stat.label}</p>
            <p className="text-xl font-serif font-semibold" style={{ color: stat.colour }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="bg-white border border-[#A3B5C4]/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-[#111] uppercase tracking-widest">Progress</p>
          <span className="text-sm font-semibold text-[#111]">{progress}%</span>
        </div>
        <div className="w-full bg-[#E3E8ED]/50 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: progress >= 100 ? "#2d6a2d" : "#1B3A4C" }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-[#999] uppercase tracking-wide">
            {(project?.tasks || []).filter((t) => t.completed).length}/{(project?.tasks || []).length} tasks completed
          </span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => updateProgress(Number(e.target.value))}
              className="w-20 h-1 accent-[#1B3A4C]"
            />
            <span className="text-[10px] text-[#999]">Manual override</span>
          </div>
        </div>
      </div>

      {/* Status Workflow */}
      <div className="bg-white border border-[#A3B5C4]/30 rounded-xl p-4">
        <p className="text-xs font-semibold text-[#111] uppercase tracking-widest mb-3">Pipeline Status</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PIPELINE_LABELS).map(([k, v]) => (
            <button
              key={k}
              onClick={() => moveStatus(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors ${
                project.status === k
                  ? "bg-[#1B3A4C] text-white"
                  : "bg-[#E3E8ED]/50 text-[#5B7A8E] hover:bg-[#1B3A4C]/10 hover:text-[#1B3A4C]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <form onSubmit={saveEdit} className="bg-white border border-[#A3B5C4]/30 rounded-xl p-6 space-y-4">
          <h3 className="font-black text-lg text-[#111] tracking-[-0.5px] uppercase">Edit Project</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#111] uppercase tracking-widest mb-1.5">Title</label>
              <input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#111] uppercase tracking-widest mb-1.5">Type</label>
              <select value={form.type || ""} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C]">
                <option value="dj-booking">DJ Booking</option>
                <option value="production">Production</option>
                <option value="remix">Remix</option>
                <option value="mix-podcast">Mix / Podcast</option>
                <option value="partnership">Brand Partnership</option>
                <option value="livestream">Live Stream</option>
                <option value="consulting">Consulting</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#111] uppercase tracking-widest mb-1.5">Priority</label>
              <select value={form.priority || "medium"} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C]">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#111] uppercase tracking-widest mb-1.5">Venue</label>
              <input value={form.venue || ""} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#111] uppercase tracking-widest mb-1.5">Event Date</label>
              <input type="date" value={form.eventDate || ""} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#111] uppercase tracking-widest mb-1.5">Deadline</label>
              <input type="date" value={form.deadline || ""} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#111] uppercase tracking-widest mb-1.5">Fee (£)</label>
              <input type="number" value={form.fee ?? ""} onChange={(e) => setForm({ ...form, fee: e.target.value ? Number(e.target.value) : null })} className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#111] uppercase tracking-widest mb-1.5">Description</label>
              <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C] resize-y" placeholder="Project description..." />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#111] uppercase tracking-widest mb-1.5">Notes</label>
              <textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-white border border-[#A3B5C4]/30 rounded-lg text-sm text-[#111] focus:outline-none focus:border-[#1B3A4C] resize-y" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm font-medium text-[#111] hover:bg-[#E3E8ED]/50">Cancel</button>
            <button type="submit" className="px-7 py-3 border-2 border-[#111] rounded-full text-[13px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition">Save Changes</button>
          </div>
        </form>
      )}

      {/* Services */}
      <div className="bg-white border border-[#A3B5C4]/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PoundSterling size={18} className="text-[#6B8FAB]" />
            <h3 className="font-black text-lg text-[#111] tracking-[-0.5px] uppercase">Services</h3>
          </div>
          <button
            onClick={() => setShowServiceForm(!showServiceForm)}
            className="px-5 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition transition-opacity flex items-center gap-1"
          >
            <Plus size={14} /> Add Service
          </button>
        </div>

        {showServiceForm && (
          <div className="bg-[#E3E8ED]/50 rounded-lg p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                placeholder="Service name"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]"
              />
              <select
                value={newService.status}
                onChange={(e) => setNewService({ ...newService, status: e.target.value })}
                className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]"
              >
                {SERVICE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                type="number"
                placeholder="Fee (£)"
                value={newService.fee ?? ""}
                onChange={(e) => setNewService({ ...newService, fee: e.target.value ? Number(e.target.value) : null })}
                className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={addService} className="px-4 py-2 bg-[#1B3A4C] text-white text-xs font-semibold rounded-lg hover:opacity-90">Add</button>
              <button onClick={() => setShowServiceForm(false)} className="px-4 py-2 border border-[#A3B5C4]/30 text-xs font-semibold rounded-lg hover:bg-[#E3E8ED]/50">Cancel</button>
            </div>
          </div>
        )}

        {(project.services || []).length === 0 ? (
          <p className="text-sm text-[#999] italic py-4 text-center">No services yet. Add service line items to track deliverables.</p>
        ) : (
          <div className="space-y-2">
            {(project.services || []).map((service, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#E3E8ED]/50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm font-medium text-[#111]">{service.name}</span>
                  {service.fee && <span className="text-sm text-[#6B8FAB] font-semibold">{gbp.format(service.fee)}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={service.status}
                    onChange={(e) => updateServiceStatus(idx, e.target.value)}
                    className={`text-xs font-medium px-2 py-1 rounded-full ${SERVICE_STATUS_STYLES[service.status] || "bg-[#E3E8ED]/50 text-gray-600"}`}
                  >
                    {SERVICE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => removeService(idx)} className="text-[#999] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team & Assignments */}
      <div className="bg-white border border-[#A3B5C4]/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[#6B8FAB]" />
            <h3 className="font-black text-lg text-[#111] tracking-[-0.5px] uppercase">Team & Assignments</h3>
          </div>
          <button
            onClick={() => setShowTeamForm(!showTeamForm)}
            className="px-5 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition transition-opacity flex items-center gap-1"
          >
            <Plus size={14} /> Add Member
          </button>
        </div>

        {showTeamForm && (
          <div className="bg-[#E3E8ED]/50 rounded-lg p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Name" value={newTeam.name} onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]" />
              <select value={newTeam.role} onChange={(e) => setNewTeam({ ...newTeam, role: e.target.value })} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]">
                {TEAM_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <input placeholder="Email" value={newTeam.email} onChange={(e) => setNewTeam({ ...newTeam, email: e.target.value })} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]" />
              <input type="number" placeholder="Fee (£)" value={newTeam.fee ?? ""} onChange={(e) => setNewTeam({ ...newTeam, fee: e.target.value ? Number(e.target.value) : null })} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]" />
              <input placeholder="Notes" value={newTeam.notes} onChange={(e) => setNewTeam({ ...newTeam, notes: e.target.value })} className="sm:col-span-2 px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]" />
            </div>
            <div className="flex gap-2">
              <button onClick={addTeamMember} className="px-4 py-2 bg-[#1B3A4C] text-white text-xs font-semibold rounded-lg hover:opacity-90">Add</button>
              <button onClick={() => setShowTeamForm(false)} className="px-4 py-2 border border-[#A3B5C4]/30 text-xs font-semibold rounded-lg hover:bg-[#E3E8ED]/50">Cancel</button>
            </div>
          </div>
        )}

        {(project.team || []).length === 0 ? (
          <p className="text-sm text-[#999] italic py-4 text-center">No team members assigned yet.</p>
        ) : (
          <div className="space-y-2">
            {(project.team || []).map((member, idx) => (
              <div key={member.id || idx} className="flex items-center justify-between p-3 bg-[#E3E8ED]/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#111]">{member.name}</span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#1B3A4C]/10 text-[#1B3A4C] font-medium">{member.role}</span>
                  </div>
                  {member.email && <p className="text-xs text-[#5B7A8E] mt-0.5">{member.email}</p>}
                  {member.notes && <p className="text-xs text-[#999] mt-0.5">{member.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  {member.fee && <span className="text-sm font-semibold text-[#6B8FAB]">{gbp.format(member.fee)}</span>}
                  <button onClick={() => removeTeamMember(member.id || String(idx))} className="text-[#999] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="bg-white border border-[#A3B5C4]/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-[#6B8FAB]" />
            <h3 className="font-black text-lg text-[#111] tracking-[-0.5px] uppercase">Tasks</h3>
          </div>
          <button
            onClick={() => setShowTaskInput(!showTaskInput)}
            className="px-5 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition transition-opacity flex items-center gap-1"
          >
            <Plus size={14} /> Add Task
          </button>
        </div>

        {showTaskInput && (
          <div className="bg-[#E3E8ED]/50 rounded-lg p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input placeholder="Task description" value={newTask.text} onChange={(e) => setNewTask({ ...newTask, text: e.target.value })} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]" />
              <input placeholder="Assignee" value={newTask.assignee} onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]" />
              <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]" />
            </div>
            <div className="flex gap-2">
              <button onClick={addTask} className="px-4 py-2 bg-[#1B3A4C] text-white text-xs font-semibold rounded-lg hover:opacity-90">Add</button>
              <button onClick={() => setShowTaskInput(false)} className="px-4 py-2 border border-[#A3B5C4]/30 text-xs font-semibold rounded-lg hover:bg-[#E3E8ED]/50">Cancel</button>
            </div>
          </div>
        )}

        {(project.tasks || []).length === 0 ? (
          <p className="text-sm text-[#999] italic py-4 text-center">No tasks yet. Add tasks to track project progress.</p>
        ) : (
          <div className="space-y-2">
            {(project.tasks || []).map((task) => (
              <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg ${task.completed ? "bg-[#2d6a2d]/5" : "bg-[#E3E8ED]/50"}`}>
                <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                  {task.completed ? <CheckCircle size={18} className="text-[#2d6a2d]" /> : <Circle size={18} className="text-[#999]" />}
                </button>
                <div className="flex-1">
                  <span className={`text-sm ${task.completed ? "line-through text-[#999]" : "text-[#111]"}`}>{task.text}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {task.assignee && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#1B3A4C]/10 text-[#1B3A4C] font-medium">{task.assignee}</span>}
                    {task.dueDate && <span className="text-[10px] text-[#999]">{new Date(task.dueDate + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
                  </div>
                </div>
                <button onClick={() => removeTask(task.id)} className="text-[#999] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Files & Deliverables */}
      <div className="bg-white border border-[#A3B5C4]/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-[#6B8FAB]" />
            <h3 className="font-black text-lg text-[#111] tracking-[-0.5px] uppercase">Files & Deliverables</h3>
          </div>
          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            className="px-5 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition transition-opacity flex items-center gap-1"
          >
            <Plus size={14} /> Add File
          </button>
        </div>

        {showFileUpload && (
          <div className="bg-[#E3E8ED]/50 rounded-lg p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input placeholder="File name" value={fileName} onChange={(e) => setFileName(e.target.value)} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]" />
              <input placeholder="URL (paste link)" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]" />
              <input placeholder="Phase (e.g. Brief, Draft, Final)" value={filePhase} onChange={(e) => setFilePhase(e.target.value)} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]" />
            </div>
            <div className="flex gap-2">
              <button onClick={addFile} className="px-4 py-2 bg-[#1B3A4C] text-white text-xs font-semibold rounded-lg hover:opacity-90">Add Link</button>
              <button onClick={() => setShowFileUpload(false)} className="px-4 py-2 border border-[#A3B5C4]/30 text-xs font-semibold rounded-lg hover:bg-[#E3E8ED]/50">Cancel</button>
            </div>
          </div>
        )}

        {(project.files || []).length === 0 ? (
          <div className="border border-dashed border-[#A3B5C4]/30 rounded-lg p-8 text-center">
            <Upload size={28} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-[#999]">No files uploaded yet.</p>
            <p className="text-xs text-[#999] mt-1">Add links to contracts, MP3s, briefs, and other documents.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(project.files || []).map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#E3E8ED]/50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <FileText size={16} className="text-[#1B3A4C]" />
                  <div>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#111] hover:text-[#1B3A4C]">{file.name}</a>
                    {file.phase && <span className="text-[10px] ml-2 uppercase tracking-wider px-2 py-0.5 rounded bg-[#6B8FAB]/10 text-[#6B8FAB] font-medium">{file.phase}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#999]">{new Date(file.uploadedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                  <button onClick={() => removeFile(idx)} className="text-[#999] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      {project.notes && (
        <div className="bg-white border border-[#A3B5C4]/30 rounded-xl p-6">
          <h3 className="font-black text-lg text-[#111] tracking-[-0.5px] uppercase mb-3">Notes</h3>
          <p className="text-sm text-[#5B7A8E] whitespace-pre-wrap">{project.notes}</p>
        </div>
      )}

      {/* Quotes */}
      <div className="bg-white border border-[#A3B5C4]/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg text-[#111] tracking-[-0.5px] uppercase">Quotes</h3>
          <Link
            href={`/admin/quotes?projectId=${project.id}`}
            className="px-5 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition transition-opacity flex items-center gap-1"
          >
            <Plus size={14} /> New Quote
          </Link>
        </div>
        {quotes.length === 0 ? (
          <p className="text-sm text-[#999] italic py-4 text-center">No quotes yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#A3B5C4]/30">
                  {["Quote #", "Status", "Total", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#5B7A8E]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-[#E3E8ED]/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#111]">#{q.id}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${q.status === "draft" ? "bg-[#E3E8ED]/50 text-[#5B7A8E]" : q.status === "sent" ? "bg-[#1B3A4C]/10 text-[#1B3A4C]" : q.status === "accepted" ? "bg-[#2d6a2d]/10 text-[#2d6a2d]" : "bg-red-50 text-red-600"}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#111] font-semibold">{gbp.format(q.total)}</td>
                    <td className="px-4 py-3 text-[#5B7A8E]">{new Date(q.createdAt).toLocaleDateString("en-GB")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-white border border-[#A3B5C4]/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg text-[#111] tracking-[-0.5px] uppercase">Invoices</h3>
          <Link
            href={`/admin/invoices?projectId=${project.id}`}
            className="px-5 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#111] hover:text-white transition transition-opacity flex items-center gap-1"
          >
            <Plus size={14} /> New Invoice
          </Link>
        </div>
        {invoices.length === 0 ? (
          <p className="text-sm text-[#999] italic py-4 text-center">No invoices yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#A3B5C4]/30">
                  {["Invoice #", "Status", "Due Date", "Total"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-xs text-[#5B7A8E]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#E3E8ED]/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-[#111]">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${inv.status === "paid" ? "bg-[#2d6a2d]/10 text-[#2d6a2d]" : inv.status === "sent" ? "bg-[#1B3A4C]/10 text-[#1B3A4C]" : inv.status === "overdue" ? "bg-red-50 text-red-600" : "bg-[#E3E8ED]/50 text-[#5B7A8E]"}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#5B7A8E]">{inv.dueDate || "---"}</td>
                    <td className="px-4 py-3 text-[#111] font-semibold">{gbp.format(inv.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}