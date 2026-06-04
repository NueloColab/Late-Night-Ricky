"use client";

import { useEffect, useState } from "react";

interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  totalBookings: number | null;
  totalRevenue: number | null;
  createdAt: string;
}

const emptyClient = { name: "", email: "", phone: "", instagram: "", notes: "" };

export default function ClientsPage() {
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyClient);
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClientsList(data.clients || []);
    } catch (err) {
      console.error("Failed to load clients", err);
    }
    setLoading(false);
  }

  async function saveClient(e: React.FormEvent) {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/clients/${editId}` : "/api/clients";
    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm(emptyClient);
      setShowForm(false);
      setEditId(null);
      fetchClients();
    } catch (err) {
      console.error("Save failed", err);
    }
  }

  async function deleteClient(id: number) {
    if (!confirm("Delete this client?")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    fetchClients();
  }

  function openEdit(c: Client) {
    setForm({
      name: c.name,
      email: c.email || "",
      phone: c.phone || "",
      instagram: c.instagram || "",
      notes: "",
    });
    setEditId(c.id);
    setShowForm(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1B3A4C] tracking-tight">Clients</h1>
          <p className="text-[#8FA8BE] text-sm mt-1 font-medium uppercase tracking-wide">{clientsList.length} contact{clientsList.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyClient); }}
          className="px-5 py-2.5 bg-[#1B3A4C] text-white text-sm font-semibold uppercase tracking-wide rounded-lg hover:bg-[#2a4a5c] transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Client"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveClient} className="bg-white rounded-xl shadow-sm p-6 mb-8 space-y-4 border border-[#E3E8ED]">
          <h3 className="text-lg font-bold text-[#1B3A4C] mb-2">{editId ? "Edit Client" : "New Client"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(["name","email","phone","instagram"] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-[#1B3A4C] uppercase tracking-widest mb-1.5">{field}</label>
                <input
                  type={field === "email" ? "email" : "text"}
                  required={field === "name"}
                  value={form[field as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-[#E3E8ED] rounded-lg focus:border-[#1B3A4C] focus:outline-none text-sm"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2.5 bg-[#1B3A4C] text-white rounded-lg text-sm font-semibold uppercase tracking-wide hover:bg-[#2a4a5c] transition-colors">Save</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-[#8FA8BE]">Loading...</p>
      ) : clientsList.length === 0 ? (
        <p className="text-[#8FA8BE] italic">No clients yet.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-[#E3E8ED] overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1B3A4C] text-white">
              <tr>
                {["Name","Email","Phone","Instagram","Bookings","Revenue",""].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8ED]">
              {clientsList.map((c) => (
                <tr key={c.id} className="hover:bg-[#E3E8ED]/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-[#1B3A4C]">{c.name}</td>
                  <td className="px-4 py-3 text-[#8FA8BE]">{c.email || "—"}</td>
                  <td className="px-4 py-3 text-[#8FA8BE]">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-[#8FA8BE]">{c.instagram || "—"}</td>
                  <td className="px-4 py-3 text-[#8FA8BE]">{c.totalBookings ?? 0}</td>
                  <td className="px-4 py-3 text-[#8FA8BE]">£{c.totalRevenue ? c.totalRevenue.toLocaleString() : 0}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(c)} className="px-3 py-1 text-xs font-semibold uppercase tracking-wide border border-[#8FA8BE] rounded hover:bg-[#8FA8BE] hover:text-white transition-colors">Edit</button>
                    <button onClick={() => deleteClient(c.id)} className="px-3 py-1 text-xs font-semibold uppercase tracking-wide border border-red-300 text-red-600 rounded hover:bg-red-600 hover:text-white transition-colors">Delete</button>
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
