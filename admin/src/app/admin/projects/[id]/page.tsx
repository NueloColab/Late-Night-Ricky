"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  notes: string | null;
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

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Project>>({});

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

  async function updateProject(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          type: form.type,
          status: form.status,
          venue: form.venue,
          eventDate: form.eventDate,
          fee: form.fee ? Number(form.fee) : null,
          notes: form.notes,
        }),
      });
      setEditing(false);
      fetchAll();
    } catch (err) {
      console.error("Update failed", err);
    }
  }

  async function moveStatus(newStatus: string) {
    try {
      await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchAll();
    } catch (err) {
      console.error("Move failed", err);
    }
  }

  const totalQuoted = quotes.reduce((s, q) => s + Number(q.total), 0);
  const totalInvoiced = invoices.reduce((s, i) => s + Number(i.total), 0);
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total), 0);
  const outstanding = totalInvoiced - totalPaid;

  if (loading) return <p className="text-[#8FA3B3] p-8">Loading…</p>;
  if (!project) return <p className="text-[#8FA3B3] p-8">Project not found.</p>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link href="/admin/projects" className="text-xs font-semibold text-[#8FA3B3] uppercase tracking-widest hover:text-white transition-colors">
            ← Back to Pipeline
          </Link>
          <h1 className="font-serif text-4xl lg:text-5xl font-semibold text-white tracking-tight mt-2">
            {project.title}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 bg-[#1B3A4C] text-white rounded">
              {PIPELINE_LABELS[project.status] || project.status}
            </span>
            <span className="text-xs text-[#8FA3B3] uppercase tracking-wide">
              {project.type.replace("-", " ")}
            </span>
            {project.venue && (
              <span className="text-xs text-[#8FA3B3]">· {project.venue}</span>
            )}
            {project.eventDate && (
              <span className="text-xs text-[#8FA3B3]">· {project.eventDate}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 border-2 border-[#1B3A4C] text-white rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-[#1B3A4C] hover:text-white transition-colors"
          >
            {editing ? "Cancel" : "Edit Project"}
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Agreed Fee", value: project.fee ? `£${Number(project.fee).toLocaleString()}` : "—" },
          { label: "Total Quoted", value: `£${totalQuoted.toLocaleString()}` },
          { label: "Total Invoiced", value: `£${totalInvoiced.toLocaleString()}` },
          { label: "Outstanding", value: `£${outstanding.toLocaleString()}` },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#111318] p-6 rounded-2xl border border-[#2A2E36]">
            <p className="text-xs font-semibold text-[#8FA3B3] uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Edit form */}
      {editing && (
        <form onSubmit={updateProject} className="bg-[#111318] rounded-2xl p-6 border border-[#2A2E36] space-y-4">
          <h3 className="text-lg font-bold text-white">Edit Project</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white uppercase tracking-widest mb-1.5">Title</label>
              <input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border-2 border-[#2A2E36] rounded-lg text-sm focus:border-[#1B3A4C] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white uppercase tracking-widest mb-1.5">Status</label>
              <select value={form.status || ""} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border-2 border-[#2A2E36] rounded-lg text-sm focus:border-[#1B3A4C] focus:outline-none">
                {Object.entries(PIPELINE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white uppercase tracking-widest mb-1.5">Type</label>
              <select value={form.type || ""} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border-2 border-[#2A2E36] rounded-lg text-sm focus:border-[#1B3A4C] focus:outline-none">
                <option value="dj-booking">DJ Booking</option>
                <option value="production">Production</option>
                <option value="remix">Remix</option>
                <option value="consulting">Consulting</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white uppercase tracking-widest mb-1.5">Venue</label>
              <input value={form.venue || ""} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="w-full px-3 py-2 border-2 border-[#2A2E36] rounded-lg text-sm focus:border-[#1B3A4C] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white uppercase tracking-widest mb-1.5">Event Date</label>
              <input type="date" value={form.eventDate || ""} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} className="w-full px-3 py-2 border-2 border-[#2A2E36] rounded-lg text-sm focus:border-[#1B3A4C] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white uppercase tracking-widest mb-1.5">Fee</label>
              <input type="number" value={form.fee ?? ""} onChange={(e) => setForm({ ...form, fee: e.target.value ? Number(e.target.value) : null })} className="w-full px-3 py-2 border-2 border-[#2A2E36] rounded-lg text-sm focus:border-[#1B3A4C] focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white uppercase tracking-widest mb-1.5">Notes</label>
            <textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-3 py-2 border-2 border-[#2A2E36] rounded-lg text-sm focus:border-[#1B3A4C] focus:outline-none resize-y" />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-[#2a4a5c] transition-colors">Save Changes</button>
          </div>
        </form>
      )}

      {/* Status quick actions */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(PIPELINE_LABELS).map(([k, v]) => (
          <button
            key={k}
            onClick={() => moveStatus(k)}
            disabled={project.status === k}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors ${
              project.status === k
                ? "bg-[#1B3A4C] text-white"
                : "bg-[#0A0A0A] text-white hover:bg-[#1B3A4C] hover:text-white"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Notes */}
      {project.notes && (
        <div className="bg-[#111318] rounded-2xl p-6 border border-[#2A2E36]">
          <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-2">Notes</h3>
          <p className="text-sm text-[#8FA3B3] whitespace-pre-wrap">{project.notes}</p>
        </div>
      )}

      {/* Quotes */}
      <div className="bg-[#111318] rounded-2xl p-6 border border-[#2A2E36]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl font-semibold text-white">Quotes</h3>
          <Link
            href={`/admin/quotes?projectId=${project.id}`}
            className="px-4 py-2 bg-[#1B3A4C] text-white rounded-lg text-xs font-semibold uppercase tracking-wide hover:bg-[#2a4a5c] transition-colors"
          >
            + New Quote
          </Link>
        </div>
        {quotes.length === 0 ? (
          <p className="text-[#8FA3B3] text-sm italic">No quotes yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1B3A4C] text-white">
              <tr>
                {["Id", "Status", "Total", "Date", ""].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2E36]">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-[#0A0A0A]/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">#{q.id}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${q.status === "draft" ? "bg-[#0A0A0A] text-white" : q.status === "sent" ? "bg-[#8FA8BE]/20 text-white" : "bg-[#1B3A4C] text-white"}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white font-semibold">£{Number(q.total).toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#8FA3B3]">{new Date(q.createdAt).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3">
                    <a href={`/api/quotes/${q.id}/pdf`} download className="text-xs font-semibold uppercase tracking-wide border border-[#8FA8BE] rounded px-3 py-1 hover:bg-[#8FA8BE] hover:text-white transition-colors inline-block">PDF</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-[#111318] rounded-2xl p-6 border border-[#2A2E36]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl font-semibold text-white">Invoices</h3>
          <Link
            href={`/admin/invoices?projectId=${project.id}`}
            className="px-4 py-2 bg-[#1B3A4C] text-white rounded-lg text-xs font-semibold uppercase tracking-wide hover:bg-[#2a4a5c] transition-colors"
          >
            + New Invoice
          </Link>
        </div>
        {invoices.length === 0 ? (
          <p className="text-[#8FA3B3] text-sm italic">No invoices yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1B3A4C] text-white">
              <tr>
                {["Invoice #", "Status", "Due Date", "Total", "", ""].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2E36]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#0A0A0A]/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${inv.status === "paid" ? "bg-[#1B3A4C] text-white" : inv.status === "sent" ? "bg-[#8FA8BE]/20 text-white" : "bg-[#0A0A0A] text-white"}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#8FA3B3]">{inv.dueDate || "—"}</td>
                  <td className="px-4 py-3 text-white font-semibold">£{Number(inv.total).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <a href={`/api/invoices/${inv.id}/pdf`} download className="text-xs font-semibold uppercase tracking-wide border border-[#8FA8BE] rounded px-3 py-1 hover:bg-[#8FA8BE] hover:text-white transition-colors inline-block">PDF</a>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={async () => {
                        await fetch(`/api/invoices/${inv.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: inv.status === "paid" ? "sent" : "paid" }),
                        });
                        fetchAll();
                      }}
                      className="text-xs font-semibold uppercase tracking-wide border border-[#1B3A4C] rounded px-3 py-1 hover:bg-[#1B3A4C] hover:text-white transition-colors"
                    >
                      {inv.status === "paid" ? "Mark Unpaid" : "Mark Paid"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
