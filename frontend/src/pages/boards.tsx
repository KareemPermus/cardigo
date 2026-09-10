import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Board } from '@/types';
import { FiPlus, FiLayout, FiTrash2, FiX } from 'react-icons/fi';

export default function Boards() {
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

  const deleteBoard = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this board?')) return;
    try {
      await apiClient.delete(`/api/boards/${id}`);
      setBoards(prev => prev.filter(b => b.id !== id));
    } catch {
      setError('Failed to delete board');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error && boards.length === 0) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-zinc-500">{error}</p>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Boards</h1>
          <p className="text-sm text-zinc-400 mt-1">{boards.length} board{boards.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <FiPlus className="w-4 h-4" /> New Board
        </button>
      </div>

      {/* Board Grid */}
      {boards.length === 0 ? (
        <div className="text-center py-20">
          <FiLayout className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500 mb-4">No boards yet. Create your first one!</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            Create Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {boards.map(board => (
            <Link href={`/boards/${board.id}`} key={board.id}>
              <div className="group bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                    <FiLayout className="w-5 h-5 text-indigo-600" />
                  </div>
                  <button
                    onClick={(e) => deleteBoard(board.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-zinc-100 transition-opacity text-zinc-400 hover:text-red-500"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-semibold text-sm text-zinc-800 truncate">{board.title}</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {new Date(board.created_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white w-96 rounded-2xl shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">New Board</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-zinc-100">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <label className="block text-xs font-semibold text-zinc-500 mb-1">Title</label>
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createBoard()}
              placeholder="e.g. Sprint Planning"
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 focus:border-indigo-400 outline-none mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-sm font-semibold rounded-lg border border-zinc-300 hover:bg-zinc-50">
                Cancel
              </button>
              <button
                onClick={createBoard}
                disabled={creating || !newTitle.trim()}
                className="flex-1 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}