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
  Briefcase,
  ExternalLink,
  Mail,
  Paperclip,
  ChevronDown,
  DollarSign,
  CheckSquare,
} from "lucide-react";
import MoodBoardSection from "@/components/MoodBoardSection";

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
  phase?: string;
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

interface Client {
  id: number;
  name: string;
  email: string | null;
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

const SERVICE_STATUSES = ["Pending", "In Progress", "Delivered"];

const SERVICE_STATUS_STYLES: Record<string, string> = {
  Pending: "bg-[#E3E8ED]/50 text-gray-600",
  "In Progress": "bg-[#1B3A4C]/10 text-[#1B3A4C]",
  Delivered: "bg-[#2d6a2d]/10 text-[#2d6a2d]",
};

const TEAM_ROLES = ["DJ", "Producer", "Engineer", "Manager", "Coordinator", "Other"];

const TASK_PHASES = ["ALL", "DISCOVERY", "STRATEGY", "DESIGN", "DEVELOPMENT", "DELIVERY", "REVIEW"];

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0, maximumFractionDigits: 0 });
const gbpFull = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [taskFilter, setTaskFilter] = useState("ALL");

  // Sub-section states
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showReferralForm, setShowReferralForm] = useState(false);

  // Form states
  const [form, setForm] = useState<Partial<Project>>({});
  const [newService, setNewService] = useState({ name: "", status: "Pending", fee: null as number | null });
  const [newTeam, setNewTeam] = useState({ name: "", role: "DJ", email: "", fee: null as number | null, notes: "" });
  const [newTask, setNewTask] = useState({ text: "", assignee: "", dueDate: "", phase: "DISCOVERY" });
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [filePhase, setFilePhase] = useState("");
  const [newReferral, setNewReferral] = useState({ name: "", email: "", commission: null as number | null });

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
      if (projData.project?.clientId) {
        try {
          const clientRes = await fetch(`/api/clients/${projData.project.clientId}`);
          const clientData = await clientRes.json();
          setClient(clientData.client || null);
        } catch {
          setClient(null);
        }
      }
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
    const task: Task = { id: String(Date.now()), text: newTask.text, completed: false, assignee: newTask.assignee, dueDate: newTask.dueDate || null, phase: newTask.phase };
    const tasks = [...(project?.tasks || []), task];
    await updateProject({ tasks });
    setNewTask({ text: "", assignee: "", dueDate: "", phase: "DISCOVERY" });
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
  const profit = (project?.fee || 0) - teamCosts;
  const profitPercent = project?.fee ? Math.round((profit / project.fee) * 100) : 0;
  const progress = calculateProgress();

  const filteredTasks = taskFilter === "ALL"
    ? (project?.tasks || [])
    : (project?.tasks || []).filter((t) => (t.phase || "DISCOVERY") === taskFilter);

  if (loading) return <p className="text-[#5B7A8E] p-8 text-center">Loading...</p>;
  if (!project) return <p className="text-[#5B7A8E] p-8 text-center">Project not found.</p>;

  return (
    <div className="space-y-6">
      {/* Header — Nuelo style */}
      <div>
        <Link href="/admin/projects" className="text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest hover:underline flex items-center gap-1 mb-4">
          <ArrowLeft size={12} /> Back to Pipeline
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            {/* Project code */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-px bg-[#A3B5C4]" />
              <span className="text-xs text-[#999] uppercase tracking-wider">PRJ-{String(project.id).padStart(3, "0")}</span>
            </div>
            {/* Title — elegant serif style */}
            <h1 className="font-bold text-[clamp(24px,3.5vw,36px)] text-[#111] tracking-[-0.5px]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              {project.title}
            </h1>
            {/* Subtitle */}
            <p className="text-sm text-[#5B7A8E] mt-1">
              {client?.name || "Unknown Client"} — Late Night Ricky
            </p>
          </div>
          {/* Status badge */}
          <span className={`text-xs font-medium uppercase tracking-wide px-3 py-1.5 rounded border ${
            project.status === "paid" ? "bg-[#2d6a2d]/5 text-[#2d6a2d] border-[#2d6a2d]/20" :
            project.status === "in-progress" || project.status === "approved" ? "bg-[#1B3A4C]/5 text-[#1B3A4C] border-[#1B3A4C]/20" :
            project.status === "completed" || project.status === "invoiced" ? "bg-[#6B8FAB]/10 text-[#6B8FAB] border-[#6B8FAB]/20" :
            "bg-[#E3E8ED]/50 text-[#5B7A8E] border-[#A3B5C4]/30"
          }`}>
            {PIPELINE_LABELS[project.status] || project.status}
          </span>
        </div>
      </div>

      {/* Progress & Stats Dashboard — Nuelo style */}
      <div className="bg-white border border-[#A3B5C4]/20 rounded-xl p-5"
           style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        {/* Top row: PROGRESS label left, action buttons right */}
        <div className="flex items-start justify-between mb-3"
             style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium">Progress</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTaskInput(!showTaskInput)}
              className="px-4 py-2 bg-[#111] text-white rounded text-xs font-semibold uppercase tracking-wide hover:opacity-90 transition flex items-center gap-1"
            >
              <Plus size={14} /> Task
            </button>
            <button
              onClick={() => setShowFileUpload(!showFileUpload)}
              className="px-4 py-2 border border-[#A3B5C4]/30 rounded text-xs font-semibold uppercase tracking-wide text-[#111] hover:bg-[#E3E8ED]/50 transition flex items-center gap-1"
            >
              <Paperclip size={14} /> File
            </button>
            <div className="relative">
              <button className="px-4 py-2 border border-[#A3B5C4]/30 rounded text-xs font-semibold uppercase tracking-wide text-[#111] hover:bg-[#E3E8ED]/50 transition flex items-center gap-1">
                {PIPELINE_LABELS[project.status] || project.status} <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>
        {/* Metrics row */}
        <div className="flex items-center gap-6 mb-4"
             style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
          <p className="text-3xl font-bold text-[#111]" style={{ fontFamily: "Georgia, serif" }}>{progress}%</p>
          <div className="h-10 w-px bg-[#A3B5C4]/30" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-0.5">Tasks</p>
            <p className="text-sm font-bold text-[#111]">{(project?.tasks || []).filter((t) => t.completed).length}/{(project?.tasks || []).length} done</p>
          </div>
          <div className="h-10 w-px bg-[#A3B5C4]/30 hidden sm:block" />
          <div className="hidden sm:block">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-0.5">Milestones</p>
            <p className="text-sm font-bold text-[#111]">0/0 hit</p>
          </div>
          <div className="h-10 w-px bg-[#A3B5C4]/30 hidden sm:block" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-0.5">Services</p>
            <p className="text-sm font-bold text-[#111]">{(project?.services || []).filter((s) => s.status === "Delivered").length}/{(project?.services || []).length} delivered</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-[#E3E8ED]/50 rounded-full h-2 overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: progress >= 100 ? "#2d6a2d" : "#1B3A4C" }}
          />
        </div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium">Overall Completion</p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6"
           style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {/* LEFT COLUMN — Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tasks & Milestones */}
          <div className="bg-white border border-[#A3B5C4]/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare size={18} className="text-[#6B8FAB]" />
                <h3 className="font-semibold text-base text-[#111]"
                    style={{ fontFamily: "Georgia, serif" }}>Tasks & Milestones</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTaskInput(!showTaskInput)}
                  className="px-4 py-2 border border-[#A3B5C4]/30 rounded text-xs font-semibold uppercase tracking-wide text-[#111] hover:bg-[#E3E8ED]/50 transition flex items-center gap-1"
                >
                  <Plus size={14} /> Milestone
                </button>
                <button
                  onClick={() => setShowTaskInput(!showTaskInput)}
                  className="px-4 py-2 bg-[#111] text-white rounded text-xs font-semibold uppercase tracking-wide hover:opacity-90 transition flex items-center gap-1"
                >
                  <Plus size={14} /> Task
                </button>
              </div>
            </div>

            {/* Phase filter pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {TASK_PHASES.map((phase) => (
                <button
                  key={phase}
                  onClick={() => setTaskFilter(phase)}
                  className={`px-3 py-1.5 rounded text-xs font-medium uppercase tracking-wide transition-colors ${
                    taskFilter === phase
                      ? "bg-[#111] text-white"
                      : "bg-white border border-[#A3B5C4]/30 text-[#5B7A8E] hover:bg-[#E3E8ED]/50"
                  }`}
                >
                  {phase}
                </button>
              ))}
            </div>

            {showTaskInput && (
              <div className="bg-[#E3E8ED]/50 rounded-lg p-4 mb-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input placeholder="Task description" value={newTask.text} onChange={(e) => setNewTask({ ...newTask, text: e.target.value })} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]" />
                  <select value={newTask.phase} onChange={(e) => setNewTask({ ...newTask, phase: e.target.value })} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]">
                    {TASK_PHASES.filter((p) => p !== "ALL").map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input placeholder="Assignee" value={newTask.assignee} onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]" />
                  <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]" />
                </div>
                <div className="flex gap-2">
                  <button onClick={addTask} className="px-4 py-2 bg-[#1B3A4C] text-white text-xs font-semibold rounded-lg hover:opacity-90">Add</button>
                  <button onClick={() => setShowTaskInput(false)} className="px-4 py-2 border border-[#A3B5C4]/30 text-xs font-semibold rounded-lg hover:bg-[#E3E8ED]/50">Cancel</button>
                </div>
              </div>
            )}

            {filteredTasks.length === 0 ? (
              <p className="text-sm text-[#999] italic py-4 text-center">No tasks in this phase yet.</p>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg ${task.completed ? "bg-[#2d6a2d]/5" : "bg-[#E3E8ED]/50"}`}>
                    <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
                      {task.completed ? <CheckCircle size={18} className="text-[#2d6a2d]" /> : <Circle size={18} className="text-[#999]" />}
                    </button>
                    <div className="flex-1">
                      <span className={`text-sm ${task.completed ? "line-through text-[#999]" : "text-[#111]"}`}>{task.text}</span>
                      <div className="flex items-center gap-2 mt-1">
                        {task.phase && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#E3E8ED]/80 text-[#5B7A8E] font-medium">{task.phase}</span>}
                        {task.dueDate && <span className="text-[10px] text-[#999]">{new Date(task.dueDate + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>}
                        {task.assignee && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#1B3A4C]/10 text-[#1B3A4C] font-medium">{task.assignee}</span>}
                      </div>
                    </div>
                    <button onClick={() => removeTask(task.id)} className="text-[#999] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Services */}
          <div className="bg-white border border-[#A3B5C4]/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PoundSterling size={18} className="text-[#6B8FAB]" />
                <h3 className="font-semibold text-base text-[#111]" style={{ fontFamily: "Georgia, serif" }}>Services</h3>
              </div>
              <button
                onClick={() => setShowServiceForm(!showServiceForm)}
                className="px-4 py-2 border border-[#A3B5C4]/30 rounded text-xs font-semibold uppercase tracking-wide text-[#111] hover:bg-[#E3E8ED]/50 transition flex items-center gap-1"
              >
                <Plus size={14} /> Add Service
              </button>
            </div>

            {showServiceForm && (
              <div className="bg-[#E3E8ED]/50 rounded-lg p-4 mb-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input placeholder="Service name" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]" />
                  <select value={newService.status} onChange={(e) => setNewService({ ...newService, status: e.target.value })} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]">
                    {SERVICE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input type="number" placeholder="Fee (£)" value={newService.fee ?? ""} onChange={(e) => setNewService({ ...newService, fee: e.target.value ? Number(e.target.value) : null })} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]" />
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
                      <select value={service.status} onChange={(e) => updateServiceStatus(idx, e.target.value)} className={`text-xs font-medium px-2 py-1 rounded-full ${SERVICE_STATUS_STYLES[service.status] || "bg-[#E3E8ED]/50 text-gray-600"}`}>
                        {SERVICE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={() => removeService(idx)} className="text-[#999] hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mood Boards */}
          <MoodBoardSection projectId={project.id} />

          {/* Team & Assignments */}
          <div className="bg-white border border-[#A3B5C4]/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#6B8FAB]" />
                <h3 className="font-semibold text-base text-[#111]" style={{ fontFamily: "Georgia, serif" }}>Team & Assignments</h3>
              </div>
              <button
                onClick={() => setShowTeamForm(!showTeamForm)}
                className="px-4 py-2 bg-[#111] text-white rounded text-xs font-semibold uppercase tracking-wide hover:opacity-90 transition flex items-center gap-1"
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
                  <div key={member.id || idx} className="flex items-center justify-between p-3 bg-[#E3E8ED]/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1"
                    >
                      {/* Avatar with initial */}
                      <div className="w-10 h-10 rounded bg-[#6B8FAB] flex items-center justify-center flex-shrink-0"
                      >
                        <span className="text-white text-sm font-bold"
                        >{member.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111]"
                        >{member.name}</p>
                        <p className="text-xs text-[#5B7A8E]"
                        >{member.role.toLowerCase()} · {member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2"
                    >
                      <button className="text-[#999] hover:text-[#1B3A4C] transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button onClick={() => removeTeamMember(member.id || String(idx))} className="text-[#999] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Referrals & Commissions */}
          <div className="bg-white border border-[#A3B5C4]/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-[#6B8FAB]" />
                <h3 className="font-semibold text-base text-[#111]" style={{ fontFamily: "Georgia, serif" }}>Referrals & Commissions</h3>
              </div>
              <button
                onClick={() => setShowReferralForm(!showReferralForm)}
                className="px-4 py-2 bg-[#111] text-white rounded text-xs font-semibold uppercase tracking-wide hover:opacity-90 transition flex items-center gap-1"
              >
                <Plus size={14} /> Add Referral
              </button>
            </div>

            {showReferralForm && (
              <div className="bg-[#E3E8ED]/50 rounded-lg p-4 mb-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input placeholder="Referral name" value={newReferral.name} onChange={(e) => setNewReferral({ ...newReferral, name: e.target.value })} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]" />
                  <input placeholder="Email" value={newReferral.email} onChange={(e) => setNewReferral({ ...newReferral, email: e.target.value })} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]" />
                  <input type="number" placeholder="Commission (£)" value={newReferral.commission ?? ""} onChange={(e) => setNewReferral({ ...newReferral, commission: e.target.value ? Number(e.target.value) : null })} className="px-3 py-2 border border-[#A3B5C4]/30 rounded-lg text-sm focus:outline-none focus:border-[#1B3A4C]" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setShowReferralForm(false); setNewReferral({ name: "", email: "", commission: null }); }} className="px-4 py-2 bg-[#1B3A4C] text-white text-xs font-semibold rounded-lg hover:opacity-90">Add</button>
                  <button onClick={() => setShowReferralForm(false)} className="px-4 py-2 border border-[#A3B5C4]/30 text-xs font-semibold rounded-lg hover:bg-[#E3E8ED]/50">Cancel</button>
                </div>
              </div>
            )}

            <p className="text-sm text-[#999] italic py-4 text-center">No referrals added yet</p>
          </div>

          {/* Files & Deliverables */}
          <div className="bg-white border border-[#A3B5C4]/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-[#6B8FAB]" />
                <h3 className="font-semibold text-base text-[#111]" style={{ fontFamily: "Georgia, serif" }}>Files & Deliverables</h3>
              </div>
              <button
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="px-4 py-2 bg-[#111] text-white rounded text-xs font-semibold uppercase tracking-wide hover:opacity-90 transition flex items-center gap-1"
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
            <div className="bg-white border border-[#A3B5C4]/20 rounded-xl p-6">
              <h3 className="font-semibold text-base text-[#111] mb-3" style={{ fontFamily: "Georgia, serif" }}>Notes</h3>
              <p className="text-sm text-[#5B7A8E] whitespace-pre-wrap">{project.notes}</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="bg-white border border-[#A3B5C4]/20 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-[#6B8FAB]" />
                <h3 className="text-sm font-bold text-[#111] uppercase tracking-wider">Details</h3>
              </div>
              <button onClick={() => setEditing(!editing)} className="text-xs text-[#5B7A8E] hover:text-[#1B3A4C] flex items-center gap-1">
                <Edit size={12} /> Edit
              </button>
            </div>

            {/* Client */}
            {client && (
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-1">Client</p>
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-[#6B8FAB]" />
                  <span className="text-sm text-[#111]">{client.email || client.name}</span>
                </div>
              </div>
            )}

            {/* Financial Summary nested */}
            <div className="bg-[#F8F9FA] rounded-lg p-4 mb-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-3">Financial Summary</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#5B7A8E]">Revenue</span>
                <span className="text-sm font-bold text-[#111]">{gbpFull.format(project.fee || totalQuoted || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#5B7A8E]">Profit</span>
                <span className={`text-sm font-bold ${profit >= 0 ? "text-[#2d6a2d]" : "text-red-600"}`}>
                  {gbpFull.format(profit)} {project.fee ? `(${profitPercent}%)` : ""}
                </span>
              </div>
            </div>

            {/* Start / Deadline */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-1">Start</p>
                <p className="text-sm text-[#111] font-medium">{project.createdAt ? new Date(project.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "---"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-1">Deadline</p>
                <p className="text-sm text-[#111] font-medium">{project.deadline ? new Date(project.deadline + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "---"}</p>
              </div>
            </div>

            {/* Description */}
            {project.description && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-1">Description</p>
                <p className="text-sm text-[#5B7A8E]">{project.description}</p>
              </div>
            )}
          </div>

          {/* Financials Card */}
          <div className="bg-white border border-[#A3B5C4]/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <PoundSterling size={16} className="text-[#6B8FAB]" />
              <h3 className="text-sm font-bold text-[#111] uppercase tracking-wider">Financials</h3>
            </div>

            {invoices.length === 0 && quotes.length === 0 ? (
              <p className="text-sm text-[#999] italic text-center py-4">No invoices or quotes yet.</p>
            ) : (
              <div className="space-y-4">
                {invoices.map((inv) => (
                  <div key={inv.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#111]">{inv.invoiceNumber}</span>
                        <ExternalLink size={12} className="text-[#6B8FAB]" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${inv.status === "paid" ? "bg-[#2d6a2d]/10 text-[#2d6a2d]" : inv.status === "sent" ? "bg-[#1B3A4C]/10 text-[#1B3A4C]" : "bg-amber-50 text-amber-600"}`}>
                        {inv.status === "paid" ? "DEPOSIT PAID" : inv.status}
                      </span>
                    </div>
                    {/* Payment schedule */}
                    <div className="bg-[#F8F9FA] rounded-lg p-3 mt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-[#5B7A8E]">Total</span>
                        <span className="text-sm font-bold text-[#111]">{gbpFull.format(inv.total)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-[#5B7A8E]">Status</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${inv.status === "paid" ? "bg-[#2d6a2d]/10 text-[#2d6a2d]" : "bg-red-50 text-red-600"}`}>
                          {inv.status === "paid" ? "PAID" : "PARTIALLY PAID"}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-[10px] text-[#999] mb-1">
                          <span>{gbpFull.format(totalPaid)} paid</span>
                          <span>{gbpFull.format(inv.total)} total</span>
                        </div>
                        <div className="w-full bg-[#E3E8ED]/50 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full rounded-full bg-[#8B7355]" style={{ width: `${inv.status === "paid" ? 100 : 50}%` }} />
                        </div>
                        <p className="text-[10px] text-[#999] text-right mt-1">{inv.status === "paid" ? "100%" : "50%"} paid</p>
                      </div>
                      {/* Paid / Outstanding boxes */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-[#E8F5E9] rounded p-2 text-center">
                          <p className="text-[10px] uppercase text-[#999] mb-1">Paid</p>
                          <p className="text-sm font-bold text-[#2d6a2d]">{gbpFull.format(totalPaid)}</p>
                        </div>
                        <div className="bg-[#F8F9FA] rounded p-2 text-center">
                          <p className="text-[10px] uppercase text-[#999] mb-1">Outstanding</p>
                          <p className="text-sm font-bold text-[#111]">{gbpFull.format(outstanding)}</p>
                        </div>
                      </div>
                      {/* Payment milestones */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 bg-[#E8F5E9] rounded">
                          <CheckCircle size={16} className="text-[#2d6a2d] flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#111]">Deposit</p>
                            <p className="text-[10px] text-[#999]">Due upfront</p>
                          </div>
                          <span className="text-sm font-bold text-[#111]">{gbpFull.format(totalPaid)}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-[#2d6a2d]/10 text-[#2d6a2d]">PAID ✓</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-white border border-[#A3B5C4]/20 rounded">
                          <Circle size={16} className="text-[#999] flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#111]">Final Payment</p>
                            <p className="text-[10px] text-[#999]">Due on completion</p>
                          </div>
                          <span className="text-sm font-bold text-[#111]">{gbpFull.format(outstanding)}</span>
                          <button
                            onClick={async () => {
                              const unpaid = invoices.find((i) => i.status !== "paid");
                              if (unpaid) {
                                await fetch(`/api/invoices/${unpaid.id}`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: "paid", paidAt: new Date().toISOString() }),
                                });
                                fetchAll();
                              }
                            }}
                            className="px-3 py-1.5 bg-[#111] text-white text-[10px] font-semibold uppercase tracking-wide rounded hover:opacity-90"
                          >
                            Mark Paid
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {quotes.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-3 bg-[#E3E8ED]/50 rounded-lg">
                    <span className="text-sm font-semibold text-[#111]">Quote #{q.id}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${q.status === "accepted" ? "bg-[#2d6a2d]/10 text-[#2d6a2d]" : q.status === "sent" ? "bg-[#1B3A4C]/10 text-[#1B3A4C]" : "bg-[#E3E8ED]/50 text-[#5B7A8E]"}`}>
                        {q.status}
                      </span>
                      <span className="text-sm font-semibold text-[#111]">{gbp.format(q.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Send reminder */}
            {invoices.length > 0 && (
              <button className="w-full mt-4 px-4 py-3 border border-[#A3B5C4]/30 rounded-lg text-xs font-semibold uppercase tracking-wide text-amber-600 hover:bg-amber-50 transition flex items-center justify-center gap-2">
                <Mail size={14} /> Send Payment Reminder
              </button>
            )}

            <div className="flex gap-2 mt-4">
              <Link
                href={`/admin/quotes?projectId=${project.id}`}
                className="flex-1 px-4 py-2 border border-[#A3B5C4]/30 rounded-lg text-xs font-semibold uppercase tracking-wide text-[#111] hover:bg-[#E3E8ED]/50 text-center"
              >
                + Quote
              </Link>
              <Link
                href={`/admin/invoices?projectId=${project.id}`}
                className="flex-1 px-4 py-2 border border-[#A3B5C4]/30 rounded-lg text-xs font-semibold uppercase tracking-wide text-[#111] hover:bg-[#E3E8ED]/50 text-center"
              >
                + Invoice
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={saveEdit} className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-[#111]" style={{ fontFamily: "Georgia, serif" }}>Edit Project</h3>
              <button type="button" onClick={() => setEditing(false)} className="text-[#999] hover:text-[#111]"><Trash2 size={18} /></button>
            </div>
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
              <button type="submit" className="px-7 py-3 bg-[#111] text-white rounded-lg text-[13px] font-semibold uppercase tracking-[1.5px] hover:opacity-90 transition">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
