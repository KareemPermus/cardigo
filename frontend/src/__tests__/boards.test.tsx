import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Boards from '@/pages/boards';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }));

const mockBoards = [
  { id: 1, title: 'Sprint 1', created_at: '2024-01-01T00:00:00Z' },
  { id: 2, title: 'Sprint 2', created_at: '2024-02-01T00:00:00Z' },
];

describe('Boards page', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders boards list', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockBoards });
    render(<Boards />);
    await waitFor(() => expect(screen.getByText('Sprint 1')).toBeInTheDocument());
    expect(screen.getByText('Sprint 2')).toBeInTheDocument();
    expect(screen.getByText('2 boards')).toBeInTheDocument();
  });

  it('shows empty state when no boards', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
    render(<Boards />);
    await waitFor(() => expect(screen.getByText(/No boards yet/)).toBeInTheDocument());
  });

  it('opens and closes create modal', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
    render(<Boards />);
    await waitFor(() => screen.getByText('Create Board'));
    fireEvent.click(screen.getByText('New Board'));
    expect(screen.getByText('New Board')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
  });

  it('creates a board', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({ data: mockBoards });
    (apiClient.post as jest.Mock).mockResolvedValue({ data: mockBoards[0] });
    render(<Boards />);
    await waitFor(() => screen.getByText('Create Board'));
    fireEvent.click(screen.getByText('New Board'));
    fireEvent.change(screen.getByPlaceholderText('e.g. Sprint Planning'), { target: { value: 'Sprint 1' } });
    fireEvent.click(screen.getByText('Create'));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/boards', { title: 'Sprint 1' }));
  });

  it('shows error on fetch failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<Boards />);
    await waitFor(() => expect(screen.getByText('Failed to load boards')).toBeInTheDocument());
  });
});