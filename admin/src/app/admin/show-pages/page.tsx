'use client';

import { useState, useEffect } from 'react';

interface ShowPage {
  id: number;
  slug: string;
  title: string;
  venue: string;
  location: string;
  season: string;
  description: string | null;
  heroImage: string | null;
  setLength: string | null;
  isActive: boolean;
}

const emptyForm = {
  slug: '',
  title: '',
  venue: '',
  location: '',
  season: '',
  description: '',
  heroImage: '',
  setLength: '',
};

export default function ShowPagesAdmin() {
  const [showPages, setShowPages] = useState<ShowPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ShowPage | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function fetchShowPages() {
    try {
      const res = await fetch('/api/show-pages');
      const data = await res.json();
      setShowPages(data.showPages || []);
    } catch (err) {
      console.error('Fetch show pages error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchShowPages();
  }, []);

  function startEdit(page: ShowPage) {
    setEditing(page);
    setForm({
      slug: page.slug,
      title: page.title,
      venue: page.venue,
      location: page.location,
      season: page.season,
      description: page.description || '',
      heroImage: page.heroImage || '',
      setLength: page.setLength || '',
    });
  }

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
  }

  async function save() {
    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/show-pages/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            description: form.description || null,
            heroImage: form.heroImage || null,
            setLength: form.setLength || null,
          }),
        });
      } else {
        await fetch('/api/show-pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            description: form.description || null,
            heroImage: form.heroImage || null,
            setLength: form.setLength || null,
          }),
        });
      }
      await fetchShowPages();
      setEditing(null);
      setForm(emptyForm);
    } catch (err) {
      console.error('Save show page error:', err);
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function deletePage(id: number) {
    if (!confirm('Delete this show page?')) return;
    try {
      await fetch(`/api/show-pages/${id}`, { method: 'DELETE' });
      await fetchShowPages();
      if (editing?.id === id) {
        setEditing(null);
        setForm(emptyForm);
      }
    } catch (err) {
      console.error('Delete show page error:', err);
      alert('Delete failed');
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-10">
        <p className="text-xs text-[#6B8FAB] tracking-[3px] uppercase font-semibold mb-4">CMS</p>
        <h1 className="text-[clamp(36px,5.5vw,64px)] font-black text-[#111] tracking-[-2px] uppercase leading-[0.95]">Show Pages</h1>
        <p className="text-sm text-[#5B7A8E] mt-4 font-semibold uppercase tracking-[0.5px]">Manage individual show detail pages</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* List */}
        <div className="lg:col-span-1">
          <div className="bg-white border-2 border-[#111] p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-semibold tracking-[1.5px] uppercase text-[#111]">Pages</h2>
              <button onClick={startCreate} className="text-xs font-semibold tracking-[1px] uppercase px-4 py-2 bg-[#111] text-white hover:bg-[#1B3A4C] transition">
                + New
              </button>
            </div>
            {loading ? (
              <p className="text-sm text-[#6B8FAB]">Loading...</p>
            ) : showPages.length === 0 ? (
              <p className="text-sm text-[#6B8FAB]">No show pages yet.</p>
            ) : (
              <div className="space-y-2">
                {showPages.map((page) => (
                  <div
                    key={page.id}
                    onClick={() => startEdit(page)}
                    className={`p-4 border-2 cursor-pointer transition ${
                      editing?.id === page.id ? 'border-[#111] bg-[#E3E8ED]' : 'border-[#E3E8ED] hover:border-[#A3B5C4]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-[15px] text-[#111]">{page.title}</p>
                        <p className="text-xs text-[#6B8FAB] mt-1">/{page.slug}</p>
                      </div>
                      {!page.isActive && (
                        <span className="text-[10px] font-semibold uppercase tracking-[1px] px-2 py-1 bg-[#A3B5C4] text-white rounded-full">Draft</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-2">
          <div className="bg-white border-2 border-[#111] p-6 md:p-8">
            <h2 className="text-sm font-semibold tracking-[1.5px] uppercase text-[#111] mb-6">
              {editing ? 'Edit Show Page' : 'New Show Page'}
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#6B8FAB] mb-2">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. sidemen"
                  className="w-full border-2 border-[#111] px-4 py-3 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition"
                />
                <p className="text-xs text-[#6B8FAB] mt-1">Used in URL: /show-{'{slug}'}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#6B8FAB] mb-2">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border-2 border-[#111] px-4 py-3 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#6B8FAB] mb-2">Venue *</label>
                  <input
                    type="text"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                    className="w-full border-2 border-[#111] px-4 py-3 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#6B8FAB] mb-2">Location *</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full border-2 border-[#111] px-4 py-3 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#6B8FAB] mb-2">Season *</label>
                  <input
                    type="text"
                    value={form.season}
                    onChange={(e) => setForm({ ...form, season: e.target.value })}
                    placeholder="e.g. Spring / Summer 2025"
                    className="w-full border-2 border-[#111] px-4 py-3 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#6B8FAB] mb-2">Set Length</label>
                  <input
                    type="text"
                    value={form.setLength}
                    onChange={(e) => setForm({ ...form, setLength: e.target.value })}
                    placeholder="e.g. 4 Hour Set"
                    className="w-full border-2 border-[#111] px-4 py-3 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#6B8FAB] mb-2">Hero Image URL</label>
                <input
                  type="text"
                  value={form.heroImage}
                  onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
                  placeholder="/assets/ricky-hero-new.jpg"
                  className="w-full border-2 border-[#111] px-4 py-3 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[1.5px] text-[#6B8FAB] mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full border-2 border-[#111] px-4 py-3 text-[15px] bg-transparent outline-none focus:border-[#1B3A4C] transition resize-y"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 py-3.5 bg-[#111] text-white text-sm font-semibold uppercase tracking-[2px] hover:bg-[#1B3A4C] transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
              {editing && (
                <button
                  onClick={() => deletePage(editing.id)}
                  className="px-6 py-3.5 border-2 border-red-300 text-red-600 text-sm font-semibold uppercase tracking-[2px] hover:bg-red-50 transition"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
