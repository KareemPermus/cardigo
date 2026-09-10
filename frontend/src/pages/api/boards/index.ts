import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();

  if (req.method === 'GET') {
    if (isSupabase()) {
      const { data, error } = await db.from('boards').select('id, title, created_at').order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }
    const rows = db.prepare('SELECT id, title, created_at FROM boards ORDER BY created_at DESC').all();
    return res.json(rows);
  }

  if (req.method === 'POST') {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    if (isSupabase()) {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
      const { data, error } = await db.from('boards').insert({ title, slug }).select('id, title, created_at').single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    }
    const result = db.prepare('INSERT INTO boards (title) VALUES (?)').run(title);
    const board = db.prepare('SELECT id, title, created_at FROM boards WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(board);
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end();
}