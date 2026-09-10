import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const db = getDb();
  const { column_id, title, description, position } = req.body;
  if (!column_id || !title) return res.status(400).json({ error: 'column_id and title required' });
  const pos = position ?? 0;
  const desc = description ?? '';

  if (isSupabase()) {
    const { data, error } = await db.from('tasks').insert({ column_id, title, description: desc, position: pos }).select('id, column_id, title, description, position, created_at').single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }
  const result = db.prepare('INSERT INTO tasks (column_id, title, description, position) VALUES (?, ?, ?, ?)').run(column_id, title, desc, pos);
  const task = db.prepare('SELECT id, column_id, title, description, position, created_at FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json(task);
}