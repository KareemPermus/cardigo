import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Board } from '@/types';
import { FiPlus, FiLayout, FiX, FiClock } from 'react-icons/fi';

export default function Home() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchBoards = async () => {
    try {
      const res = await apiClient.get('/api/boards');
      setBoards(res.data);
    } catch {
      setError('Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBoards(); }, []);

  const createBoard = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await apiClient.post('/api/boards', { title: newTitle.trim() });
      setNewTitle('');
      setShowModal(false);
      fetchBoards();
    } catch {
      setError('Failed to create board');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Your Boards</h1>
          <p className="text-sm text-zinc-400 mt-1">Organize your projects with kanban boards</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <FiPlus className="w-4 h-4" /> New Board
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">{error}</div>
      )}

      {/* Board Grid */}
      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <FiLayout className="w-12 h-12 mb-4 text-zinc-300" />
          <p className="text-lg font-medium text-zinc-500">No boards yet</p>
          <p className="text-sm mt-1">Create your first board to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            <FiPlus className="w-4 h-4" /> Create Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {boards.map((board) => (
            <Link key={board.id} href={`/boards/${board.id}`}>
              <div className="group bg-white rounded-xl border border-zinc-200 p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <FiLayout className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-zinc-800 truncate group-hover:text-indigo-600 transition-colors">
                      {board.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {new Date(board.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* Add board card */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200 p-5 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors text-zinc-400 hover:text-indigo-600 min-h-[88px]"
          >
            <FiPlus className="w-5 h-5" />
            <span className="text-sm font-medium">Add Board</span>
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white w-96 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">New Board</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-zinc-100">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1">Title</label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createBoard()}
              placeholder="e.g. Sprint 14"
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:border-indigo-400 outline-none mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 text-sm font-semibold rounded-lg border border-zinc-300 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                onClick={createBoard}
                disabled={creating || !newTitle.trim()}
                className="flex-1 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}