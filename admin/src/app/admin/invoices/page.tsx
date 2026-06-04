"use client";

import { useEffect, useState } from "react";

interface Invoice {
  id: number;
  projectId: number | null;
  invoiceNumber: string;
  lineItems: any;
  subtotal: number;
  taxRate: number;
  total: number;
  status: string;
  dueDate: string | null;
  createdAt: string;
}

export default function InvoicesPage() {
  const [invoicesList, setInvoicesList] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState<{ id: number; title: string }[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [items, setItems] = useState([{ description: "", quantity: 1, rate: 0 }]);
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const pid = url.searchParams.get("projectId");
    if (pid) setProjectId(Number(pid));
    fetchInvoices();
    fetchProjects();
  }, []);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      setInvoicesList(data.invoices || []);
    } catch (err) {
      console.error("Failed to load invoices", err);
    }
    setLoading(false);
  }

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  }

  async function saveInvoice(e: React.FormEvent) {
    e.preventDefault();
    const lineItems = items.map((i) => ({
      description: i.description,
      quantity: Number(i.quantity),
      rate: Number(i.rate),
      amount: Number(i.quantity) * Number(i.rate),
    }));
    const subtotal = lineItems.reduce((s, i) => s + i.amount, 0);
    try {
      await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems, subtotal, total: subtotal, taxRate: 0, status: "draft",
          projectId: projectId || undefined,
          dueDate: dueDate || undefined,
        }),
      });
      setItems([{ description: "", quantity: 1, rate: 0 }]);
      setDueDate("");
      setShowForm(false);
      fetchInvoices();
    } catch (err) {
      console.error("Save failed", err);
    }
  }

  async function updateStatus(id: number, status: string) {
    try {
      await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchInvoices();
    } catch (err) {
      console.error("Update failed", err);
    }
  }

  async function deleteInvoice(id: number) {
    if (!confirm("Delete this invoice?")) return;
    await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    fetchInvoices();
  }

  function addItem() {
    setItems([...items, { description: "", quantity: 1, rate: 0 }]);
  }

  function removeItem(idx: number) {
    setItems(items.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: string, val: string | number) {
    const next = [...items];
    (next as any)[idx][field] = val;
    setItems(next);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl lg:text-5xl font-semibold text-[#1B3A4C] tracking-tight">Invoices</h1>
          <p className="text-[#8FA8BE] mt-2 text-sm font-medium tracking-wide uppercase">Track payments</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setItems([{ description: "", quantity: 1, rate: 0 }]); }}
          className="px-5 py-2.5 bg-[#1B3A4C] text-white text-sm font-semibold uppercase tracking-wide rounded-lg hover:bg-[#2a4a5c] transition-colors"
        >
          {showForm ? "Cancel" : "+ New Invoice"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveInvoice} className="bg-white rounded-xl shadow-sm p-6 mb-8 space-y-4 border border-[#E3E8ED]">
          <h3 className="text-lg font-bold text-[#1B3A4C] mb-2">Invoice Builder</h3>
          {projectId !== null && <p className="text-sm text-[#8FA8BE]">Linked to Project #{projectId}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-1.5">Project</label>
              <select
                value={projectId ?? ""}
                onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border-2 border-[#E3E8ED] rounded-lg text-sm focus:border-[#1B3A4C] focus:outline-none"
              >
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#E3E8ED] rounded-lg text-sm focus:border-[#1B3A4C] focus:outline-none"
              />
            </div>
          </div>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input placeholder="Description" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} className="w-full px-3 py-2 border-2 border-[#E3E8ED] rounded-lg focus:border-[#1B3A4C] focus:outline-none text-sm" />
                </div>
                <div className="w-20">
                  <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} className="w-full px-3 py-2 border-2 border-[#E3E8ED] rounded-lg focus:border-[#1B3A4C] focus:outline-none text-sm" />
                </div>
                <div className="w-28">
                  <input type="number" placeholder="Rate" value={item.rate} onChange={(e) => updateItem(idx, "rate", e.target.value)} className="w-full px-3 py-2 border-2 border-[#E3E8ED] rounded-lg focus:border-[#1B3A4C] focus:outline-none text-sm" />
                </div>
                <div className="w-20 text-sm text-[#8FA8BE] pt-2">£{(Number(item.quantity) * Number(item.rate)).toLocaleString()}</div>
                <button type="button" onClick={() => removeItem(idx)} className="text-red-500 text-sm">×</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="text-sm text-[#8FA8BE] hover:text-[#1B3A4C] underline">+ Add line item</button>
          <div className="flex items-center justify-between pt-4 border-t border-[#E3E8ED]">
            <p className="text-sm text-[#1B3A4C] font-bold">Total: £{items.reduce((s, i) => s + Number(i.quantity) * Number(i.rate), 0).toLocaleString()}</p>
            <button type="submit" className="px-6 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-[#2a4a5c] transition-colors">Save Invoice</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-[#8FA8BE]">Loading...</p>
      ) : invoicesList.length === 0 ? (
        <p className="text-[#8FA8BE] italic">No invoices yet.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-[#E3E8ED] overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1B3A4C] text-white">
              <tr>
                {["Invoice #", "Status", "Due Date", "Subtotal", "Total", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8ED]">
              {invoicesList.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#E3E8ED]/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-[#1B3A4C]">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3">
                    <select
                      value={inv.status}
                      onChange={(e) => updateStatus(inv.id, e.target.value)}
                      className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded border-none cursor-pointer ${statusStyle(inv.status)}`}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-[#8FA8BE]">{inv.dueDate || "—"}</td>
                  <td className="px-4 py-3 text-[#8FA8BE]">£{Number(inv.subtotal).toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#1B3A4C] font-semibold">£{Number(inv.total).toLocaleString()}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <a href={`/api/invoices/${inv.id}/pdf`} download className="text-xs font-semibold uppercase tracking-wide border border-[#8FA8BE] rounded px-3 py-1 hover:bg-[#8FA8BE] hover:text-white transition-colors inline-block">PDF</a>
                    <button onClick={() => deleteInvoice(inv.id)} className="text-xs font-semibold uppercase tracking-wide border border-red-300 text-red-600 rounded px-3 py-1 hover:bg-red-600 hover:text-white transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function statusStyle(s: string) {
  if (s === "draft") return "bg-[#E3E8ED] text-[#1B3A4C]";
  if (s === "sent") return "bg-[#8FA8BE]/20 text-[#1B3A4C]";
  if (s === "paid") return "bg-[#1B3A4C] text-white";
  if (s === "overdue") return "bg-red-100 text-red-700";
  return "bg-[#E3E8ED] text-[#1B3A4C]";
}
