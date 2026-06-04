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

  useEffect(() => {
    fetchInvoices();
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl lg:text-5xl font-semibold text-[#1B3A4C] tracking-tight">Invoices</h1>
          <p className="text-[#8FA8BE] mt-2 text-sm font-medium tracking-wide uppercase">Track payments</p>
        </div>
      </div>

      {loading ? (
        <p className="text-[#8FA8BE]">Loading...</p>
      ) : invoicesList.length === 0 ? (
        <p className="text-[#8FA8BE] italic">No invoices yet. Create one from a quote or project.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-[#E3E8ED] overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1B3A4C] text-white">
              <tr>
                {["Invoice #","Status","Due Date","Subtotal","Total","Actions"].map((h) => (
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
