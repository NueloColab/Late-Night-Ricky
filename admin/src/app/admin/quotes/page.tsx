"use client";

import { useEffect, useState } from "react";

interface Quote {
  id: number;
  projectId: number | null;
  lineItems: { description: string; quantity: number; rate: number; amount: number }[];
  subtotal: number;
  taxRate: number;
  total: number;
  status: string;
  createdAt: string;
}

export default function QuotesPage() {
  const [quotesList, setQuotesList] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([{ description: "", quantity: 1, rate: 0 }]);

  useEffect(() => {
    fetchQuotes();
  }, []);

  async function fetchQuotes() {
    setLoading(true);
    try {
      const res = await fetch("/api/quotes");
      const data = await res.json();
      setQuotesList(data.quotes || []);
    } catch (err) {
      console.error("Failed to load quotes", err);
    }
    setLoading(false);
  }

  async function saveQuote(e: React.FormEvent) {
    e.preventDefault();
    const lineItems = items.map((i) => ({
      description: i.description,
      quantity: Number(i.quantity),
      rate: Number(i.rate),
      amount: Number(i.quantity) * Number(i.rate),
    }));
    const subtotal = lineItems.reduce((s, i) => s + i.amount, 0);
    const total = subtotal; // no tax calc for now
    try {
      await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineItems, subtotal, total, taxRate: 0, status: "draft" }),
      });
      setItems([{ description: "", quantity: 1, rate: 0 }]);
      setShowForm(false);
      fetchQuotes();
    } catch (err) {
      console.error("Save failed", err);
    }
  }

  async function deleteQuote(id: number) {
    if (!confirm("Delete this quote?")) return;
    await fetch(`/api/quotes/${id}`, { method: "DELETE" });
    fetchQuotes();
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
          <h1 className="font-serif text-4xl lg:text-5xl font-semibold text-[#1B3A4C] tracking-tight">Quotes</h1>
          <p className="text-[#8FA8BE] mt-2 text-sm font-medium tracking-wide uppercase">Build and send quotes</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setItems([{ description: "", quantity: 1, rate: 0 }]); }}
          className="px-5 py-2.5 bg-[#1B3A4C] text-white text-sm font-semibold uppercase tracking-wide rounded-lg hover:bg-[#2a4a5c] transition-colors"
        >
          {showForm ? "Cancel" : "+ New Quote"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveQuote} className="bg-white rounded-xl shadow-sm p-6 mb-8 space-y-4 border border-[#E3E8ED]">
          <h3 className="text-lg font-bold text-[#1B3A4C] mb-2">Quote Builder</h3>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(idx, "description", e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#E3E8ED] rounded-lg focus:border-[#1B3A4C] focus:outline-none text-sm"
                  />
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#E3E8ED] rounded-lg focus:border-[#1B3A4C] focus:outline-none text-sm"
                  />
                </div>
                <div className="w-28">
                  <input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => updateItem(idx, "rate", e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#E3E8ED] rounded-lg focus:border-[#1B3A4C] focus:outline-none text-sm"
                  />
                </div>
                <div className="w-20 text-sm text-[#8FA8BE] pt-2">
                  £{(Number(item.quantity) * Number(item.rate)).toLocaleString()}
                </div>
                <button type="button" onClick={() => removeItem(idx)} className="text-red-500 text-sm">×</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="text-sm text-[#8FA8BE] hover:text-[#1B3A4C] underline">+ Add line item</button>
          <div className="flex items-center justify-between pt-4 border-t border-[#E3E8ED]">
            <p className="text-sm text-[#1B3A4C] font-bold">Total: £{items.reduce((s, i) => s + Number(i.quantity) * Number(i.rate), 0).toLocaleString()}</p>
            <button type="submit" className="px-6 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-[#2a4a5c] transition-colors">Save Quote</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-[#8FA8BE]">Loading...</p>
      ) : quotesList.length === 0 ? (
        <p className="text-[#8FA8BE] italic">No quotes yet.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-[#E3E8ED] overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1B3A4C] text-white">
              <tr>
                {["Id","Status","Line Items","Subtotal","Total","",""].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8ED]">
              {quotesList.map((q) => (
                <tr key={q.id} className="hover:bg-[#E3E8ED]/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-[#1B3A4C]">#{q.id}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${statusStyle(q.status)}`}>{q.status}</span></td>
                  <td className="px-4 py-3 text-[#8FA8BE]">{(q.lineItems as any)?.length ?? 0} items</td>
                  <td className="px-4 py-3 text-[#8FA8BE]">£{Number(q.subtotal).toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#1B3A4C] font-semibold">£{Number(q.total).toLocaleString()}</td>
                  <td className="px-4 py-3"><button onClick={() => alert("PDF generation: coming soon")} className="text-xs font-semibold uppercase tracking-wide border border-[#8FA8BE] rounded px-3 py-1 hover:bg-[#8FA8BE] hover:text-white transition-colors">Download PDF</button></td>
                  <td className="px-4 py-3"><button onClick={() => deleteQuote(q.id)} className="text-xs font-semibold uppercase tracking-wide border border-red-300 text-red-600 rounded px-3 py-1 hover:bg-red-600 hover:text-white transition-colors">Delete</button></td>
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
  if (s === "approved") return "bg-[#1B3A4C] text-white";
  return "bg-[#E3E8ED] text-[#1B3A4C]";
}
