import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/api/client';
import { Board } from '@/types';
import { FiPlus, FiLayout, FiClock, FiArrowRight } from 'react-icons/fi';
import styles from '@/components/HomePage.module.css';

export default function Home() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
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

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await apiClient.post('/api/boards', { title: newTitle.trim() });
      setNewTitle('');
      setShowCreate(false);
      fetchBoards();
    } catch {
      setError('Failed to create board');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Loading boards…</p>
      </div>
    );
  }

  if (error && boards.length === 0) {
    return (
      <div className={styles.errorWrap}>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.retryBtn} onClick={() => { setError(''); setLoading(true); fetchBoards(); }}>Retry</button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Your Boards</h1>
          <p className={styles.subtitle}>{boards.length} board{boards.length !== 1 ? 's' : ''} total</p>
        </div>
        <button className={styles.createBtn} onClick={() => setShowCreate(true)}>
          <FiPlus size={16} /> New Board
        </button>
      </div>

      {/* KPI row */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Total Boards</span>
            <span className={styles.kpiValue}>{boards.length}</span>
          </div>
          <div className={`${styles.kpiIcon} ${styles.kpiIconPrimary}`}><FiLayout size={20} /></div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiContent}>
            <span className={styles.kpiLabel}>Latest Board</span>
            <span className={styles.kpiValue}>{boards.length > 0 ? boards[boards.length - 1].title : '—'}</span>
          </div>
          <div className={`${styles.kpiIcon} ${styles.kpiIconAccent}`}><FiClock size={20} /></div>
        </div>
      </div>

      {/* Board grid */}
      {boards.length === 0 ? (
        <div className={styles.emptyState}>
          <FiLayout size={48} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No boards yet</p>
          <p className={styles.emptyDesc}>Create your first board to get started with Kanban.</p>
          <button className={styles.createBtn} onClick={() => setShowCreate(true)}>
            <FiPlus size={16} /> Create Board
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {boards.map((b) => (
            <Link key={b.id} href={`/boards/${b.id}`} className={styles.card}>
              <div className={styles.cardColorBar} />
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{b.title}</h3>
                <p className={styles.cardDate}>Created {new Date(b.created_at).toLocaleDateString()}</p>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.cardLink}>Open board <FiArrowRight size={14} /></span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className={styles.overlay} onClick={() => setShowCreate(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>New Board</h3>
            <label className={styles.label}>Title</label>
            <input
              className={styles.input}
              placeholder="e.g. Sprint 15"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowCreate(false)}>Cancel</button>
              <button className={styles.submitBtn} onClick={handleCreate} disabled={creating || !newTitle.trim()}>
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}