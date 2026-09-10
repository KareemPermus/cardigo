import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  const id = Number(req.query.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'PUT') {
    const { title, position } = req.body;
    if (isSupabase()) {
      const updates: any = {};
      if (title !== undefined) updates.title = title;
      if (position !== undefined) updates.position = position;
      const { data, error } = await db.from('columns').update(updates).eq('id', id).select('id, board_id, title, position').single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    if (title !== undefined) db.prepare('UPDATE columns SET title = ? WHERE id = ?').run(title, id);
    if (position !== undefined) db.prepare('UPDATE columns SET position = ? WHERE id = ?').run(position, id);
    const col = db.prepare('SELECT id, board_id, title, position FROM columns WHERE id = ?').get(id);
    return res.json(col);
  }

  if (req.method === 'DELETE') {
    if (isSupabase()) {
      await db.from('columns').delete().eq('id', id);
      return res.json({ success: true });
    }
    db.prepare('DELETE FROM columns WHERE id = ?').run(id);
    return res.json({ success: true });
  }

  res.setHeader('Allow', 'PUT, DELETE');
  res.status(405).end();
}