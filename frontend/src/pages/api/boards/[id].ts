import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'GET') {
    if (isSupabase()) {
      const { data: board, error } = await db.from('boards').select('id, title, created_at').eq('id', id).single();
      if (error || !board) return res.status(404).json({ error: 'Board not found' });
      const { data: columns } = await db.from('columns').select('id, board_id, title, position').eq('board_id', id).order('position');
      const { data: tasks } = await db.from('tasks').select('id, column_id, title, description, position, created_at').in('column_id', (columns || []).map((c: any) => c.id)).order('position');
      const cols = (columns || []).map((c: any) => ({
        ...c,
        tasks: (tasks || []).filter((t: any) => t.column_id === c.id),
      }));
      return res.json({ ...board, columns: cols });
    }
    const board = db.prepare('SELECT id, title, created_at FROM boards WHERE id = ?').get(id);
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const columns = db.prepare('SELECT id, board_id, title, position FROM columns WHERE board_id = ? ORDER BY position').all(id);
    const colIds = columns.map((c: any) => c.id);
    let tasks: any[] = [];
    if (colIds.length > 0) {
      const placeholders = colIds.map(() => '?').join(',');
      tasks = db.prepare(`SELECT id, column_id, title, description, position, created_at FROM tasks WHERE column_id IN (${placeholders}) ORDER BY position`).all(...colIds);
    }
    const cols = columns.map((c: any) => ({
      ...c,
      tasks: tasks.filter((t: any) => t.column_id === c.id),
    }));
    return res.json({ ...(board as any), columns: cols });
  }

  if (req.method === 'PUT') {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    if (isSupabase()) {
      const { data, error } = await db.from('boards').update({ title }).eq('id', id).select('id, title, created_at').single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    db.prepare('UPDATE boards SET title = ? WHERE id = ?').run(title, id);
    const board = db.prepare('SELECT id, title, created_at FROM boards WHERE id = ?').get(id);
    return res.json(board);
  }

  if (req.method === 'DELETE') {
    if (isSupabase()) {
      await db.from('boards').delete().eq('id', id);
      return res.json({ success: true });
    }
    db.prepare('DELETE FROM boards WHERE id = ?').run(id);
    return res.json({ success: true });
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  res.status(405).end();
}