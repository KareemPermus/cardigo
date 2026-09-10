import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'PUT') {
    const { title, description, column_id, position } = req.body;
    if (isSupabase()) {
      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (column_id !== undefined) updates.column_id = column_id;
      if (position !== undefined) updates.position = position;
      const { data, error } = await db.from('tasks').update(updates).eq('id', id).select('id, column_id, title, description, position, created_at').single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    if (title !== undefined) db.prepare('UPDATE tasks SET title = ? WHERE id = ?').run(title, id);
    if (description !== undefined) db.prepare('UPDATE tasks SET description = ? WHERE id = ?').run(description, id);
    if (column_id !== undefined) db.prepare('UPDATE tasks SET column_id = ? WHERE id = ?').run(column_id, id);
    if (position !== undefined) db.prepare('UPDATE tasks SET position = ? WHERE id = ?').run(position, id);
    const task = db.prepare('SELECT id, column_id, title, description, position, created_at FROM tasks WHERE id = ?').get(id);
    return res.json(task);
  }

  if (req.method === 'DELETE') {
    if (isSupabase()) {
      await db.from('tasks').delete().eq('id', id);
      return res.json({ success: true });
    }
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return res.json({ success: true });
  }

  res.setHeader('Allow', 'PUT, DELETE');
  res.status(405).end();
}