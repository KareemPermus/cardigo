import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/client';
import { Board, Column, Task } from '@/types';
import { FiPlus, FiMoreHorizontal, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';
import styles from '@/styles/BoardDetail.module.css';

interface ColumnWithTasks extends Column {
  tasks: Task[];
}

interface BoardWithColumns extends Board {
  columns: ColumnWithTasks[];
}

export default function BoardDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [board, setBoard] = useState<BoardWithColumns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add column
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');

  // Add task
  const [addTaskColId, setAddTaskColId] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Edit task modal
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Drag state
  const [dragTaskId, setDragTaskId] = useState<number | null>(null);

  const fetchBoard = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/api/boards/${id}`);
      const data = res.data;
      data.columns = (data.columns || []).sort((a: ColumnWithTasks, b: ColumnWithTasks) => a.position - b.position);
      data.columns.forEach((c: ColumnWithTasks) => {
        c.tasks = (c.tasks || []).sort((a: Task, b: Task) => a.position - b.position);
      });
      setBoard(data);
      setError('');
    } catch {
      setError('Failed to load board');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  const handleAddColumn = async () => {
    if (!newColTitle.trim() || !board) return;
    try {
      await apiClient.post('/api/columns', {
        board_id: board.id,
        title: newColTitle.trim(),
        position: board.columns.length,
      });
      setNewColTitle('');
      setShowAddColumn(false);
      fetchBoard();
    } catch { /* ignore */ }
  };

  const handleDeleteColumn = async (colId: number) => {
    await apiClient.delete(`/api/columns/${colId}`);
    fetchBoard();
  };

  const handleAddTask = async (columnId: number) => {
    if (!newTaskTitle.trim()) return;
    const col = board?.columns.find(c => c.id === columnId);
    await apiClient.post('/api/tasks', {
      column_id: columnId,
      title: newTaskTitle.trim(),
      description: '',
      position: col ? col.tasks.length : 0,
    });
    setNewTaskTitle('');
    setAddTaskColId(null);
    fetchBoard();
  };

  const handleUpdateTask = async () => {
    if (!editTask) return;
    await apiClient.put(`/api/tasks/${editTask.id}`, {
      title: editTitle,
      description: editDesc,
      column_id: editTask.column_id,
      position: editTask.position,
    });
    setEditTask(null);
    fetchBoard();
  };

  const handleDeleteTask = async (taskId: number) => {
    await apiClient.delete(`/api/tasks/${taskId}`);
    setEditTask(null);
    fetchBoard();
  };

  const handleDrop = async (targetColId: number) => {
    if (dragTaskId === null || !board) return;
    const targetCol = board.columns.find(c => c.id === targetColId);
    await apiClient.put(`/api/tasks/${dragTaskId}`, {
      column_id: targetColId,
      position: targetCol ? targetCol.tasks.length : 0,
    });
    setDragTaskId(null);
    fetchBoard();
  };

  const colColors = ['#a1a1aa', '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading) {
    return <div className={styles.loadingState}>Loading board…</div>;
  }
  if (error || !board) {
    return <div className={styles.errorState}>{error || 'Board not found'}</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.boardTitle}>{board.title}</h1>
          <p className={styles.boardSub}>{board.columns.length} columns · {board.columns.reduce((s, c) => s + c.tasks.length, 0)} tasks</p>
        </div>
        <button className={styles.newCardBtn} onClick={() => setShowAddColumn(true)}>
          <FiPlus size={16} /> Add Column
        </button>
      </div>

      <div className={styles.boardScroll}>
        <div className={styles.columnsRow}>
          {board.columns.map((col, ci) => (
            <section
              key={col.id}
              className={styles.column}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
            >
              <div className={styles.colHeader}>
                <span className={styles.colDot} style={{ background: colColors[ci % colColors.length] }} />
                <h2 className={styles.colTitle}>{col.title}</h2>
                <span className={styles.colCount}>{col.tasks.length}</span>
                <button className={styles.colMenu} onClick={() => handleDeleteColumn(col.id)}>
                  <FiTrash2 size={14} />
                </button>
              </div>
              <div className={styles.taskList}>
                {col.tasks.map(task => (
                  <article
                    key={task.id}
                    className={`${styles.card} ${dragTaskId === task.id ? styles.dragging : ''}`}
                    draggable
                    onDragStart={() => setDragTaskId(task.id)}
                    onDragEnd={() => setDragTaskId(null)}
                  >
                    <p className={styles.cardTitle}>{task.title}</p>
                    {task.description && <p className={styles.cardDesc}>{task.description}</p>}
                    <button className={styles.cardEdit} onClick={() => { setEditTask(task); setEditTitle(task.title); setEditDesc(task.description || ''); }}>
                      <FiEdit2 size={13} />
                    </button>
                  </article>
                ))}
                {addTaskColId === col.id ? (
                  <div className={styles.addTaskForm}>
                    <input
                      autoFocus
                      className={styles.addTaskInput}
                      placeholder="Task title"
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddTask(col.id)}
                    />
                    <div className={styles.addTaskActions}>
                      <button className={styles.addTaskSubmit} onClick={() => handleAddTask(col.id)}>Add</button>
                      <button className={styles.addTaskCancel} onClick={() => { setAddTaskColId(null); setNewTaskTitle(''); }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className={styles.addTaskBtn} onClick={() => setAddTaskColId(col.id)}>
                    <FiPlus size={14} /> Add task
                  </button>
                )}
              </div>
            </section>
          ))}

          {showAddColumn && (
            <div className={styles.addColForm}>
              <input
                autoFocus
                className={styles.addColInput}
                placeholder="Column title"
                value={newColTitle}
                onChange={e => setNewColTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddColumn()}
              />
              <div className={styles.addTaskActions}>
                <button className={styles.addTaskSubmit} onClick={handleAddColumn}>Add</button>
                <button className={styles.addTaskCancel} onClick={() => setShowAddColumn(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Task Modal */}
      {editTask && (
        <div className={styles.modalOverlay} onClick={e => { if (e.target === e.currentTarget) setEditTask(null); }}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Edit Task</h3>
              <button onClick={() => setEditTask(null)}><FiX size={20} /></button>
            </div>
            <label className={styles.label}>Title</label>
            <input className={styles.modalInput} value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            <label className={styles.label}>Description</label>
            <textarea className={styles.modalTextarea} value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} />
            <div className={styles.modalActions}>
              <button className={styles.deleteBtn} onClick={() => handleDeleteTask(editTask.id)}>Delete</button>
              <button className={styles.saveBtn} onClick={handleUpdateTask}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}