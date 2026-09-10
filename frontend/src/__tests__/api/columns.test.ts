import { createMocks } from 'node-mocks-http';
import columnsHandler from '@/pages/api/columns/index';
import columnByIdHandler from '@/pages/api/columns/[id]';

jest.mock('@/lib/db', () => {
  const cols: any[] = [];
  let nextId = 1;
  const mockDb = {
    prepare: (sql: string) => ({
      get: (...args: any[]) => cols.find(c => c.id === args[0]) || null,
      run: (...args: any[]) => {
        if (sql.includes('INSERT')) {
          const col = { id: nextId++, board_id: args[0], title: args[1], position: args[2] };
          cols.push(col);
          return { lastInsertRowid: col.id };
        }
        if (sql.includes('DELETE')) {
          const idx = cols.findIndex(c => c.id === args[0]);
          if (idx >= 0) cols.splice(idx, 1);
        }
        return {};
      },
    }),
  };
  return { getDb: () => mockDb, isSupabase: () => false };
});

describe('POST /api/columns', () => {
  it('creates a column', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { board_id: 1, title: 'To Do' } });
    await columnsHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData()).title).toBe('To Do');
  });

  it('returns 400 without required fields', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await columnsHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});

describe('DELETE /api/columns/[id]', () => {
  it('returns success', async () => {
    const { req, res } = createMocks({ method: 'DELETE', query: { id: '1' } });
    await columnByIdHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ success: true });
  });
});