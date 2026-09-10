import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '@/pages/home';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('next/link', () => {
  return ({ children, href, ...rest }: any) => <a href={href} {...rest}>{children}</a>;
});

const mockBoards = [
  { id: 1, title: 'Sprint 14', created_at: '2024-01-01T00:00:00Z' },
  { id: 2, title: 'Marketing', created_at: '2024-02-01T00:00:00Z' },
];

describe('Home page', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders boards after loading', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockBoards });
    render(<Home />);
    expect(screen.getByText('Loading boards…')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Sprint 14')).toBeInTheDocument());
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('2 boards total')).toBeInTheDocument();
  });

  it('shows empty state when no boards', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });
    render(<Home />);
    await waitFor(() => expect(screen.getByText('No boards yet')).toBeInTheDocument());
  });

  it('shows error state on failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<Home />);
    await waitFor(() => expect(screen.getByText('Failed to load boards')).toBeInTheDocument());
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('opens create modal and creates a board', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockBoards });
    (apiClient.post as jest.Mock).mockResolvedValue({ data: { id: 3, title: 'New', created_at: '2024-03-01T00:00:00Z' } });
    render(<Home />);
    await waitFor(() => screen.getByText('Sprint 14'));

    fireEvent.click(screen.getAllByText('New Board')[0]);
    expect(screen.getByText('New Board', { selector: 'h3' }) || screen.getByPlaceholderText('e.g. Sprint 15')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('e.g. Sprint 15');
    fireEvent.change(input, { target: { value: 'New Board Title' } });
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/boards', { title: 'New Board Title' }));
  });
});