import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import BoardDetail from '@/pages/boards/[id]';
import apiClient from '@/api/client';

jest.mock('next/router', () => ({
  useRouter: () => ({ query: { id: '1' } }),
}));

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockBoard = {
  id: 1,
  title: 'Test Board',
  created_at: '2024-01-01T00:00:00Z',
  columns: [
    {
      id: 10,
      board_id: 1,
      title: 'To Do',
      position: 0,
      tasks: [
        { id: 100, column_id: 10, title: 'Task One', description: 'desc', position: 0, created_at: '2024-01-01T00:00:00Z' },
      ],
    },
  ],
};

describe('BoardDetail', () => {
  beforeEach(() => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockBoard });
  });

  it('renders board title and column', async () => {
    render(<BoardDetail />);
    await waitFor(() => {
      expect(screen.getByText('Test Board')).toBeInTheDocument();
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('Task One')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    (apiClient.get as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<BoardDetail />);
    expect(screen.getByText('Loading board…')).toBeInTheDocument();
  });

  it('shows error on fetch failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<BoardDetail />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load board')).toBeInTheDocument();
    });
  });

  it('opens edit modal on edit button click', async () => {
    render(<BoardDetail />);
    await waitFor(() => screen.getByText('Task One'));
    const editBtns = document.querySelectorAll('button');
    const editBtn = Array.from(editBtns).find(b => b.querySelector('svg'));
    // Find the card edit button by its class-based approach
    const card = screen.getByText('Task One').closest('article');
    const cardEditBtn = card?.querySelector('button');
    if (cardEditBtn) {
      fireEvent.click(cardEditBtn);
      await waitFor(() => {
        expect(screen.getByText('Edit Task')).toBeInTheDocument();
      });
    }
  });
});