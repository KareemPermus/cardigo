import { createMocks } from 'node-mocks-http';
import boardsHandler from '@/pages/api/boards/index';
import boardByIdHandler from '@/pages/api/boards/[id]';

jest.mock('@/lib/db', () => {
  const rows: any[] = [];
  let nextId = 1;
  const mockDb = {
    prepare: (sql: string) => ({
      all: (...args: any[]) => {
        if (sql.includes('FROM boards')) return rows;
        if (sql.includes('FROM columns')) return [];
        if (sql.includes('FROM tasks')) return [];
        return [];
      },
      get: (...args: any[]) => {
        const id = args[0];
        return rows.find(r => r.id === id) || null;
      },
      run: (...args: any[]) => {
        if (sql.includes('INSERT')) {
          const board = { id: nextId++, title: args[0], created_at: new Date().toISOString() };
          rows.push(board);
          return { lastInsertRowid: board.id };
        }
        if (sql.includes('UPDATE')) {
          const r = rows.find(r => r.id === args[1]);
          if (r) r.title = args[0];
          return {};
        }
        if (sql.includes('DELETE')) {
          const idx = rows.findIndex(r => r.id === args[0]);
          if (idx >= 0) rows.splice(idx, 1);
          return {};
        }
        return {};
      },
    }),
  };
  return { getDb: () => mockDb, isSupabase: () => false };
});

describe('GET /api/boards', () => {
  it('returns empty array initially', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await boardsHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(expect.any(Array));
  });
});

describe('POST /api/boards', () => {
  it('creates a board', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { title: 'Test Board' } });
    await boardsHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.title).toBe('Test Board');
    expect(data.id).toBeDefined();
  });

  it('returns 400 without title', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await boardsHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});

describe('DELETE /api/boards/[id]', () => {
  it('returns success', async () => {
    const { req, res } = createMocks({ method: 'DELETE', query: { id: '1' } });
    await boardByIdHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ success: true });
  });
});

describe('PUT /api/boards/[id]', () => {
  it('returns 400 without title', async () => {
    const { req, res } = createMocks({ method: 'PUT', query: { id: '1' }, body: {} });
    await boardByIdHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});