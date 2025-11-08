import { render, screen, waitFor, act, suppressConsoleError } from '../utils/test-utils';
import AlbumPage from '../../app/album/[artistAndAlbum]/page';

// Mock utility functions
jest.mock('../../app/utils/slugify', () => ({
  generateArtistSlug: jest.fn(name => name.toLowerCase().replace(/\s+/g, '-')),
  generateAlbumSlug: jest.fn(name => name.toLowerCase().replace(/\s+/g, '-')),
  generateLastfmArtistSlug: jest.fn(name => name.toLowerCase().replace(/\s+/g, '-')),
  generateGenreSlug: jest.fn(name => name.toLowerCase().replace(/\s+/g, '-')),
}));

// Mock marked for markdown parsing
jest.mock('marked', () => ({
  marked: jest.fn(text => text),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock fetch globally
global.fetch = jest.fn();

// Mock Spotify album data structure
const mockSpotifyAlbumData = {
  data: [
    {
      name: 'Dark Side of the Moon',
      artist: 'Pink Floyd',
      url: 'https://open.spotify.com/album/test',
      releaseDate: '1973-03-01',
      tracks: 10,
      artistIds: ['spotify-artist-id-123'],
      image: 'https://example.com/album-cover.jpg',
    },
  ],
};

const mockSongLinkData = {
  pageUrl: 'https://song.link/test',
  appleUrl: 'https://music.apple.com/album/test',
  youtubeUrl: 'https://youtube.com/watch?v=test',
};

const mockOpenAISummary = {
  data: {
    content: 'This album is considered one of the greatest albums of all time...',
    citations: [
      'https://en.wikipedia.org/wiki/The_Dark_Side_of_the_Moon',
      'https://www.allmusic.com/album/dark-side-of-the-moon',
      'https://www.rollingstone.com/music/albumreviews/dark-side-of-the-moon',
    ],
  },
  kvKey: 'test-kv-key',
};

const mockArtistGenres = {
  data: {
    genres: ['Progressive Rock', 'Psychedelic Rock', 'Classic Rock'],
  },
};

describe('Album Page', () => {
  const mockParams = {
    artistAndAlbum: 'pink-floyd_dark-side-of-the-moon',
  };

  // Suppress console.error for tests that intentionally trigger errors
  const mockConsoleError = suppressConsoleError();

  beforeEach(() => {
    fetch.mockClear();

    // Mock successful API responses by default
    fetch.mockImplementation(url => {
      if (url.includes('api-spotify-search')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSpotifyAlbumData,
        });
      } else if (url.includes('api-songlink')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSongLinkData,
        });
      } else if (url.includes('/api/album-detail') || url.includes('api-perplexity-albumdetail')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockOpenAISummary,
        });
      } else if (url.includes('api-spotify-artists')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockArtistGenres,
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders loading state initially', async () => {
      // Mock fetch to never resolve
      fetch.mockImplementation(() => new Promise(() => {}));

      await act(async () => {
        render(<AlbumPage params={mockParams} />);
      });

      expect(screen.getByText('Loading content...')).toBeInTheDocument();
    });

    it('parses artist and album from URL correctly', async () => {
      await act(async () => {
        render(<AlbumPage params={mockParams} />);
      });

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Dark Side of the Moon by Pink Floyd/ })
        ).toBeInTheDocument();
      });
    });

    it('displays error state when album not found', async () => {
      fetch.mockImplementation(url => {
        if (url.includes('api-spotify-search')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: [] }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      await act(async () => {
        render(<AlbumPage params={mockParams} />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Album not found/)).toBeInTheDocument();
      });
    });
  });

  describe('Album Data Display', () => {
    it('displays album information correctly', async () => {
      await act(async () => {
        render(<AlbumPage params={mockParams} />);
      });

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Dark Side of the Moon by Pink Floyd/ })
        ).toBeInTheDocument();
        expect(screen.getByText('1973')).toBeInTheDocument();
      });
    });

    it('displays genres when available', async () => {
      await act(async () => {
        render(<AlbumPage params={mockParams} />);
      });

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Dark Side of the Moon by Pink Floyd/ })
        ).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Progressive Rock')).toBeInTheDocument();
        expect(screen.getByText('Psychedelic Rock')).toBeInTheDocument();
        expect(screen.getByText('Classic Rock')).toBeInTheDocument();
      });
    });
  });

  describe('Streaming Links', () => {
    it('displays streaming platform information when available', async () => {
      await act(async () => {
        render(<AlbumPage params={mockParams} />);
      });

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Dark Side of the Moon by Pink Floyd/ })
        ).toBeInTheDocument();
      });

      // Check for streaming platform links/text
      await waitFor(() => {
        expect(screen.getByText(/Songlink/)).toBeInTheDocument();
      });
    });

    it('handles streaming API errors gracefully', async () => {
      fetch.mockImplementation(url => {
        if (url.includes('api-spotify-search')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockSpotifyAlbumData,
          });
        } else if (url.includes('api-songlink')) {
          return Promise.reject(new Error('Streaming API Error'));
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      await act(async () => {
        render(<AlbumPage params={mockParams} />);
      });

      // When SongLink API fails, the component shows "Not available" instead of crashing
      await waitFor(
        () => {
          expect(screen.getByText('Spotify ↗')).toBeInTheDocument(); // Spotify should still work
          expect(screen.getByText(/Not available/)).toBeInTheDocument(); // At least one "Not available" should appear
        },
        { timeout: 2000 }
      );
    });
  });

  describe('AI Summary', () => {
    it('displays AI summary when available', async () => {
      await act(async () => {
        render(<AlbumPage params={mockParams} />);
      });

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Dark Side of the Moon by Pink Floyd/ })
        ).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.getByText(/This album is considered one of the greatest albums of all time/)
        ).toBeInTheDocument();
      });
    });

    it('handles AI summary errors gracefully', async () => {
      fetch.mockImplementation(url => {
        if (url.includes('api-spotify-search')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockSpotifyAlbumData,
          });
        } else if (
          url.includes('/api/album-detail') ||
          url.includes('api-perplexity-albumdetail')
        ) {
          return Promise.reject(new Error('AI API Error'));
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      await act(async () => {
        render(<AlbumPage params={mockParams} />);
      });

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Dark Side of the Moon by Pink Floyd/ })
        ).toBeInTheDocument();
      });

      // Should handle error gracefully
      await waitFor(() => {
        expect(screen.getByText(/Failed to load summary/)).toBeInTheDocument();
      });
    });

    it('shows generating message initially', async () => {
      // Mock fetch to delay the AI summary response
      fetch.mockImplementation(url => {
        if (url.includes('api-spotify-search')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockSpotifyAlbumData,
          });
        } else if (
          url.includes('/api/album-detail') ||
          url.includes('api-perplexity-albumdetail')
        ) {
          // Return a promise that never resolves to keep showing generating message
          return new Promise(() => {});
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      await act(async () => {
        render(<AlbumPage params={mockParams} />);
      });

      // Wait for album data to load first
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Dark Side of the Moon by Pink Floyd/ })
        ).toBeInTheDocument();
      });

      // Then check for generating message
      expect(screen.getByText('Generating summary...')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles malformed URL parameters', async () => {
      const malformedParams = {
        artistAndAlbum: 'invalid-url-format',
      };

      // Mock fetch to delay response so we can see loading state
      fetch.mockImplementation(() => {
        return new Promise(() => {}); // Never resolves, keeps loading
      });

      await act(async () => {
        render(<AlbumPage params={malformedParams} />);
      });

      // Should handle gracefully without crashing and show loading
      expect(screen.getByText('Loading content...')).toBeInTheDocument();
    });

    it('handles empty URL parameters', async () => {
      const emptyParams = {
        artistAndAlbum: '',
      };

      await act(async () => {
        render(<AlbumPage params={emptyParams} />);
      });

      // Should handle gracefully without crashing
      expect(screen.getByText(/Loading/)).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('renders main sections when data loads successfully', async () => {
      // Mock to delay async sections to see loading states
      fetch.mockImplementation(url => {
        if (url.includes('api-spotify-search')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockSpotifyAlbumData,
          });
        } else if (url.includes('api-songlink')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockSongLinkData,
          });
        } else if (
          url.includes('/api/album-detail') ||
          url.includes('api-perplexity-albumdetail')
        ) {
          // Delay to see generating message
          return new Promise(() => {});
        } else if (url.includes('api-spotify-artists')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockArtistGenres,
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      await act(async () => {
        render(<AlbumPage params={mockParams} />);
      });

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Dark Side of the Moon by Pink Floyd/ })
        ).toBeInTheDocument();
        expect(screen.getByText('1973')).toBeInTheDocument();
      });

      // Check that main content sections are present
      expect(screen.getByText('Generating summary...')).toBeInTheDocument();
    });

    it('maintains proper loading states', async () => {
      // Mock to delay all requests to maintain loading state
      fetch.mockImplementation(() => {
        return new Promise(() => {}); // Never resolves, keeps loading
      });

      await act(async () => {
        render(<AlbumPage params={mockParams} />);
      });

      // Should show loading state when all requests are pending
      expect(screen.getByText('Loading content...')).toBeInTheDocument();
    });

    it('handles complete API failure gracefully', async () => {
      fetch.mockImplementation(() => {
        return Promise.reject(new Error('Complete API failure'));
      });

      await act(async () => {
        render(<AlbumPage params={mockParams} />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Album not found/)).toBeInTheDocument();
      });
    });
  });
});
