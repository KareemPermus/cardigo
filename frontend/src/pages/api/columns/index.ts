import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const db = getDb();
  const { board_id, title, position } = req.body;
  if (!board_id || !title) return res.status(400).json({ error: 'board_id and title required' });
  const pos = position ?? 0;

  if (isSupabase()) {
    const { data, error } = await db.from('columns').insert({ board_id, title, position: pos }).select('id, board_id, title, position').single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }
  const result = db.prepare('INSERT INTO columns (board_id, title, position) VALUES (?, ?, ?)').run(board_id, title, pos);
  const col = db.prepare('SELECT id, board_id, title, position FROM columns WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json(col);
}