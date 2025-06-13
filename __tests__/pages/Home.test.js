import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { useRouter } from 'next/navigation';
import Home from '../../app/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('Home Page', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    fetch.mockClear();
    mockPush.mockClear();

    // Mock router
    useRouter.mockReturnValue({
      push: mockPush,
    });

    // Mock successful API responses - need to reset for each test
    fetch.mockImplementation(url => {
      if (url.includes('random-fact')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: 'Test random fact about music' }),
        });
      } else if (url.includes('recentsearches')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: [
              {
                id: '1',
                name: 'Test Album',
                artist: 'Test Artist',
                image: 'https://example.com/test.jpg',
              },
            ],
          }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the main page without crashing', async () => {
      render(<Home />);

      // Wait for async content to load
      await waitFor(() => {
        expect(screen.getByText(/Happy \w+, friend!/)).toBeInTheDocument();
      });
    });

    it('displays the day greeting with current day', () => {
      render(<Home />);

      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const currentDay = dayNames[new Date().getDay()];

      expect(screen.getByText(`Happy ${currentDay}, friend!`)).toBeInTheDocument();
    });

    it('displays welcome message and navigation links', () => {
      render(<Home />);

      expect(screen.getByText(/Welcome, music traveler/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /get rec'd/i })).toHaveAttribute(
        'href',
        '/recommendations'
      );
    });

    it('displays album search form', () => {
      render(<Home />);

      expect(screen.getByPlaceholderText('Enter album name...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter artist name...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });
  });

  describe('Random Fact Hook', () => {
    it('displays random fact when API call succeeds', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('🧠 Test random fact about music')).toBeInTheDocument();
      });

      expect(fetch).toHaveBeenCalledWith('https://kv-fetch-random-fact.rian-db8.workers.dev/');
    });

    it('displays fallback message when API call fails', async () => {
      fetch.mockImplementation(url => {
        if (url.includes('random-fact')) {
          return Promise.reject(new Error('API Error'));
        } else if (url.includes('recentsearches')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: [] }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText(/error loading a random fact/)).toBeInTheDocument();
      });
    });
  });

  describe('Random Genre Hook', () => {
    it('displays a random genre link', async () => {
      render(<Home />);

      await waitFor(() => {
        // Find the genre link in the welcome message
        const genreLinks = screen
          .getAllByRole('link')
          .filter(link => link.getAttribute('href')?.startsWith('/genre/'));
        expect(genreLinks.length).toBeGreaterThan(0);
        expect(genreLinks[0].getAttribute('href')).toMatch(/^\/genre\/[\w-]+$/);
      });
    });

    it('capitalizes genre names properly', async () => {
      // Mock Math.random to return a predictable genre
      const originalMath = Math.random;
      Math.random = () => 0; // Will select first genre

      render(<Home />);

      await waitFor(() => {
        // The first genre should be displayed with proper capitalization
        const genreText = screen.getByText(/explore the history and seminal albums/);
        expect(genreText).toBeInTheDocument();
      });

      Math.random = originalMath;
    });
  });

  describe('Album Search Functionality', () => {
    it('handles form input changes', () => {
      render(<Home />);

      const albumInput = screen.getByPlaceholderText('Enter album name...');
      const artistInput = screen.getByPlaceholderText('Enter artist name...');

      fireEvent.change(albumInput, { target: { value: 'Test Album' } });
      fireEvent.change(artistInput, { target: { value: 'Test Artist' } });

      expect(albumInput.value).toBe('Test Album');
      expect(artistInput.value).toBe('Test Artist');
    });

    it('shows error when trying to search with empty fields', () => {
      render(<Home />);

      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);

      expect(screen.getByText('Please enter both album and artist names.')).toBeInTheDocument();
    });

    it('navigates to album page when search is valid', () => {
      render(<Home />);

      const albumInput = screen.getByPlaceholderText('Enter album name...');
      const artistInput = screen.getByPlaceholderText('Enter artist name...');
      const searchButton = screen.getByRole('button', { name: /search/i });

      fireEvent.change(albumInput, { target: { value: 'Dark Side of the Moon' } });
      fireEvent.change(artistInput, { target: { value: 'Pink Floyd' } });
      fireEvent.click(searchButton);

      expect(mockPush).toHaveBeenCalledWith('/album/pink-floyd_dark-side-of-the-moon');
    });

    it('handles Enter key press for search', () => {
      render(<Home />);

      const albumInput = screen.getByPlaceholderText('Enter album name...');
      const artistInput = screen.getByPlaceholderText('Enter artist name...');

      fireEvent.change(albumInput, { target: { value: 'Test Album' } });
      fireEvent.change(artistInput, { target: { value: 'Test Artist' } });
      fireEvent.keyDown(albumInput, { key: 'Enter' });

      expect(mockPush).toHaveBeenCalledWith('/album/test-artist_test-album');
    });
  });

  describe('Recent Searches', () => {
    it('displays loading state initially', () => {
      // Mock fetch to never resolve to test loading state
      fetch.mockImplementationOnce(() => new Promise(() => {}));

      render(<Home />);

      expect(screen.getByText('Loading recent searches...')).toBeInTheDocument();
    });

    it('displays recent searches when API call succeeds', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText('Test Album')).toBeInTheDocument();
        // Use getAllByRole since there are multiple links with the same name (image and text)
        const albumLinks = screen.getAllByRole('link', { name: /Test Album/ });
        expect(albumLinks.length).toBeGreaterThan(0);
        expect(albumLinks[0]).toHaveAttribute('href', '/album/test-artist_test-album');
      });

      expect(fetch).toHaveBeenCalledWith('https://kv-fetch-recentsearches.rian-db8.workers.dev/');
    });

    it('handles empty recent searches gracefully', async () => {
      fetch.mockImplementation(url => {
        if (url.includes('random-fact')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: 'Test random fact about music' }),
          });
        } else if (url.includes('recentsearches')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: [] }),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.queryByText('Loading recent searches...')).not.toBeInTheDocument();
      });

      // Should not display recent searches section when empty
      expect(screen.queryByText('Test Album')).not.toBeInTheDocument();
    });

    it('handles API errors gracefully', async () => {
      fetch.mockImplementation(url => {
        if (url.includes('random-fact')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: 'Test random fact about music' }),
          });
        } else if (url.includes('recentsearches')) {
          return Promise.reject(new Error('Recent searches API error'));
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.queryByText('Loading recent searches...')).not.toBeInTheDocument();
      });

      // Should handle error gracefully without crashing
      expect(screen.getByText(/Welcome, music traveler/)).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('renders all main sections together', async () => {
      render(<Home />);

      // Wait for all async content
      await waitFor(() => {
        expect(screen.getByText('🧠 Test random fact about music')).toBeInTheDocument();
        expect(screen.getByText('Test Album')).toBeInTheDocument();
      });

      // Check all main sections are present
      expect(screen.getByText(/Happy \w+, friend!/)).toBeInTheDocument();
      expect(screen.getByText(/Welcome, music traveler/)).toBeInTheDocument();
      expect(screen.getByText('💿 Learn more about an album')).toBeInTheDocument();
      expect(screen.getByText('👀 From the community')).toBeInTheDocument();
    });
  });
});
