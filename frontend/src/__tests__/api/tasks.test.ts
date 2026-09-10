import { createMocks } from 'node-mocks-http';
import tasksHandler from '@/pages/api/tasks/index';
import taskByIdHandler from '@/pages/api/tasks/[id]';

jest.mock('@/lib/db', () => {
  const tasks: any[] = [];
  let nextId = 1;
  const mockDb = {
    prepare: (sql: string) => ({
      get: (...args: any[]) => tasks.find(t => t.id === args[0]) || null,
      run: (...args: any[]) => {
        if (sql.includes('INSERT')) {
          const task = { id: nextId++, column_id: args[0], title: args[1], description: args[2], position: args[3], created_at: new Date().toISOString() };
          tasks.push(task);
          return { lastInsertRowid: task.id };
        }
        if (sql.includes('DELETE')) {
          const idx = tasks.findIndex(t => t.id === args[0]);
          if (idx >= 0) tasks.splice(idx, 1);
        }
        return {};
      },
    }),
  };
  return { getDb: () => mockDb, isSupabase: () => false };
});

describe('POST /api/tasks', () => {
  it('creates a task', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { column_id: 1, title: 'Task 1' } });
    await tasksHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData()).title).toBe('Task 1');
  });

  it('returns 400 without required fields', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await tasksHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});

describe('DELETE /api/tasks/[id]', () => {
  it('returns success', async () => {
    const { req, res } = createMocks({ method: 'DELETE', query: { id: '1' } });
    await taskByIdHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ success: true });
  });
});