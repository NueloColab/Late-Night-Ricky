'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Plus,
  Trash2,
  ImageIcon,
} from 'lucide-react';

interface MoodBoard {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  shareToken: string | null;
  createdAt: Date;
}

interface MoodBoardPin {
  id: number;
  boardId: number;
  imageUrl: string;
  caption: string | null;
  positionX: number;
  positionY: number;
  createdAt: Date;
}

interface MoodBoardSectionProps {
  projectId: number;
}

export default function MoodBoardSection({ projectId }: MoodBoardSectionProps) {
  const [boards, setBoards] = useState<MoodBoard[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<MoodBoard | null>(null);
  const [pins, setPins] = useState<MoodBoardPin[]>([]);
  const [, setLoading] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [showPinForm, setShowPinForm] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [newPinUrl, setNewPinUrl] = useState('');
  const [newPinCaption, setNewPinCaption] = useState('');

  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}/mood-boards`);
      const data = await res.json();
      setBoards(data.boards || []);
    } catch (e) {
      console.error('Failed to fetch mood boards:', e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchPins = useCallback(async (boardId: number) => {
    try {
      const res = await fetch(`/api/mood-boards/${boardId}/pins`);
      const data = await res.json();
      setPins(data.pins || []);
    } catch (e) {
      console.error('Failed to fetch pins:', e);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const selectBoard = async (board: MoodBoard) => {
    setSelectedBoard(board);
    await fetchPins(board.id);
  };

  const createBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/mood-boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newBoardTitle, description: newBoardDesc }),
      });
      if (res.ok) {
        setNewBoardTitle('');
        setNewBoardDesc('');
        setShowCreator(false);
        await fetchBoards();
      }
    } catch (e) {
      console.error('Create board failed:', e);
    }
  };

  const addPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoard || !newPinUrl.trim()) return;
    try {
      const res = await fetch(`/api/mood-boards/${selectedBoard.id}/pins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: newPinUrl, caption: newPinCaption }),
      });
      if (res.ok) {
        setNewPinUrl('');
        setNewPinCaption('');
        setShowPinForm(false);
        await fetchPins(selectedBoard.id);
      }
    } catch (e) {
      console.error('Add pin failed:', e);
    }
  };

  const deletePin = async (pinId: number) => {
    if (!selectedBoard) return;
    try {
      await fetch(`/api/mood-boards/${selectedBoard.id}/pins/${pinId}`, { method: 'DELETE' });
      await fetchPins(selectedBoard.id);
    } catch (e) {
      console.error('Delete pin failed:', e);
    }
  };

  return (
    <div className="bg-white border border-[#b0b0b0]/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ImageIcon size={18} className="text-[#b0b0b0]" />
          <h3 className="font-black text-lg text-[#111] tracking-[-0.5px] uppercase">Mood Boards</h3>
        </div>
        <button
          onClick={() => setShowCreator(!showCreator)}
          className="px-4 py-2 bg-[#3a3a3a] text-white rounded text-xs font-semibold uppercase tracking-wide hover:opacity-90 transition flex items-center gap-1"
        >
          <Plus size={14} /> New Board
        </button>
      </div>

      {showCreator && (
        <form onSubmit={createBoard} className="bg-[#8a8a8a]/50 rounded-lg p-4 mb-4 space-y-3">
          <input
            placeholder="Board title"
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            className="w-full px-3 py-2 border border-[#b0b0b0]/30 rounded-lg text-sm text-[#111] focus:outline-none focus:border-[#7a7a7a]"
          />
          <input
            placeholder="Description (optional)"
            value={newBoardDesc}
            onChange={(e) => setNewBoardDesc(e.target.value)}
            className="w-full px-3 py-2 border border-[#b0b0b0]/30 rounded-lg text-sm text-[#111] focus:outline-none focus:border-[#7a7a7a]"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCreator(false)}
              className="px-5 py-2 border-2 border-[#b0b0b0]/30 rounded-full text-[11px] font-semibold uppercase tracking-[1.5px] text-[#7a7a7a] hover:border-[#7a7a7a] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#3a3a3a] hover:text-white transition"
            >
              Create Board
            </button>
          </div>
        </form>
      )}

      {boards.length === 0 && !showCreator && (
        <div className="text-center py-8">
          <ImageIcon size={32} className="mx-auto text-[#b0b0b0] mb-3" />
          <p className="text-sm text-[#999]">No mood boards yet. Create one to start collecting visual inspiration.</p>
        </div>
      )}

      {boards.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => selectBoard(board)}
              className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-[1.5px] rounded-full transition ${
                selectedBoard?.id === board.id
                  ? 'bg-[#7a7a7a] text-white'
                  : 'border-2 border-[#b0b0b0]/30 text-[#7a7a7a] hover:border-[#7a7a7a]'
              }`}
            >
              {board.title}
            </button>
          ))}
        </div>
      )}

      {selectedBoard && (
        <div className="border-t border-[#b0b0b0]/30 pt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-sm text-[#111]">{selectedBoard.title}</p>
              {selectedBoard.description && (
                <p className="text-xs text-[#b0b0b0]">{selectedBoard.description}</p>
              )}
            </div>
            <button
              onClick={() => setShowPinForm(!showPinForm)}
              className="px-5 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#3a3a3a] hover:text-white transition flex items-center gap-1"
            >
              <Plus size={14} /> Add Pin
            </button>
          </div>

          {showPinForm && (
            <form onSubmit={addPin} className="bg-[#8a8a8a]/50 rounded-lg p-4 mb-4 space-y-3">
              <input
                placeholder="Image URL"
                value={newPinUrl}
                onChange={(e) => setNewPinUrl(e.target.value)}
                className="w-full px-3 py-2 border border-[#b0b0b0]/30 rounded-lg text-sm text-[#111] focus:outline-none focus:border-[#7a7a7a]"
              />
              <input
                placeholder="Caption (optional)"
                value={newPinCaption}
                onChange={(e) => setNewPinCaption(e.target.value)}
                className="w-full px-3 py-2 border border-[#b0b0b0]/30 rounded-lg text-sm text-[#111] focus:outline-none focus:border-[#7a7a7a]"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinForm(false)}
                  className="px-5 py-2 border-2 border-[#b0b0b0]/30 rounded-full text-[11px] font-semibold uppercase tracking-[1.5px] text-[#7a7a7a] hover:border-[#7a7a7a] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 border-2 border-[#111] rounded-full text-[11px] font-semibold uppercase tracking-[1.5px] text-[#111] hover:bg-[#3a3a3a] hover:text-white transition"
                >
                  Add Pin
                </button>
              </div>
            </form>
          )}

          {pins.length === 0 && !showPinForm && (
            <p className="text-sm text-[#b0b0b0] text-center py-8">No pins yet. Add images to build your mood board.</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pins.map((pin) => (
              <div key={pin.id} className="group relative aspect-square bg-[#8a8a8a] rounded-xl overflow-hidden">
                <img
                  src={pin.imageUrl}
                  alt={pin.caption || 'Mood board pin'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/placeholder.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end justify-between p-3">
                  <button
                    onClick={() => deletePin(pin.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 bg-white/90 rounded-full text-red-500 hover:bg-white transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {pin.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-white/90 px-3 py-2">
                    <p className="text-xs text-[#111] truncate">{pin.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
