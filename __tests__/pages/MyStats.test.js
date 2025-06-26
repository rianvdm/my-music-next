import { render, screen, waitFor, act } from '../utils/test-utils';
import MyStats from '../../app/mystats/page';

// Mock utility functions
jest.mock('../../app/utils/slugify', () => ({
  generateArtistSlug: jest.fn(name => (name ? name.toLowerCase().replace(/\s+/g, '-') : '')),
  generateAlbumSlug: jest.fn(name => (name ? name.toLowerCase().replace(/\s+/g, '-') : '')),
  generateLastfmArtistSlug: jest.fn(name => (name ? name.toLowerCase().replace(/\s+/g, '-') : '')),
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

// Mock data
const mockRecentTracks = {
  last_artist: 'Pink Floyd',
  last_album: 'Dark Side of the Moon',
};

const mockArtistSummary = {
  data: 'Pink Floyd is a legendary progressive rock band known for their conceptual albums.',
};

const mockTopArtists = [
  {
    name: 'Pink Floyd',
    tags: ['Progressive Rock'],
    image: 'https://example.com/pink-floyd.jpg',
    playcount: 1234,
  },
  {
    name: 'Led Zeppelin',
    tags: ['Classic Rock', 'Hard Rock'],
    image: 'https://example.com/led-zeppelin.jpg',
    playcount: 987,
  },
  {
    name: 'The Beatles',
    tags: [],
    image: null,
    playcount: 2345,
  },
];

const mockTopAlbums = [
  {
    name: 'The Wall',
    artist: 'Pink Floyd',
    image: 'https://example.com/the-wall.jpg',
    playcount: 567,
  },
  {
    name: 'Led Zeppelin IV',
    artist: 'Led Zeppelin',
    image: 'https://example.com/led-zep-iv.jpg',
    playcount: 432,
  },
];

const mockDiscogsCollection = [
  {
    title: 'Abbey Road',
    artist: 'The Beatles (UK Band)',
    imageUrl: 'https://example.com/abbey-road.jpg',
    discogsUrl: 'https://discogs.com/abbey-road',
    addedDate: '2024-01-15T10:00:00Z',
    format: 'Vinyl, LP, Album',
    genre: 'Rock',
    year: '1969',
  },
  {
    title: 'Rumours',
    artist: 'Fleetwood Mac',
    imageUrl: 'https://example.com/rumours.jpg',
    discogsUrl: 'https://discogs.com/rumours',
    addedDate: '2024-01-10T10:00:00Z',
    format: 'CD, Remastered',
    genre: 'Pop Rock',
    year: null,
  },
];

describe('MyStats Page', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Loading States', () => {
    it('shows loading spinners for all sections initially', async () => {
      // Mock fetch to delay forever
      fetch.mockImplementation(() => new Promise(() => {}));

      await act(async () => {
        render(<MyStats />);
      });

      expect(screen.getByText('Real-time listening stats')).toBeInTheDocument();
      expect(screen.getByText('Loading recent tracks...')).toBeInTheDocument();
      expect(screen.getByText('Loading artists...')).toBeInTheDocument();
      expect(screen.getByText('Loading albums...')).toBeInTheDocument();
      expect(screen.getByText('Loading collection data...')).toBeInTheDocument();
    });
  });

  describe('Recent Tracks Section', () => {
    it('displays recent track information when data loads', async () => {
      fetch.mockImplementation(url => {
        if (url.includes('api-lastfm-recenttracks')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockRecentTracks,
          });
        } else if (url.includes('api-perplexity-artistsentence')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockArtistSummary,
          });
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      await act(async () => {
        render(<MyStats />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Most recently I listened to/)).toBeInTheDocument();
        expect(screen.getByText('Dark Side of the Moon')).toBeInTheDocument();
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
      });

      // Wait for artist summary
      await waitFor(() => {
        expect(
          screen.getByText(/Pink Floyd is a legendary progressive rock band/)
        ).toBeInTheDocument();
      });
    });

    it('handles recent tracks API error gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      fetch.mockImplementation(url => {
        if (url.includes('api-lastfm-recenttracks')) {
          return Promise.reject(new Error('API Error'));
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      await act(async () => {
        render(<MyStats />);
      });

      await waitFor(() => {
        expect(screen.queryByText(/Most recently I listened to/)).not.toBeInTheDocument();
      });

      expect(consoleError).toHaveBeenCalledWith('Error fetching recent tracks:', expect.any(Error));

      consoleError.mockRestore();
    });

    it('shows loading state for artist summary while fetching', async () => {
      fetch.mockImplementation(url => {
        if (url.includes('api-lastfm-recenttracks')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockRecentTracks,
          });
        } else if (url.includes('api-perplexity-artistsentence')) {
          // Never resolve to keep loading state
          return new Promise(() => {});
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      await act(async () => {
        render(<MyStats />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Most recently I listened to/)).toBeInTheDocument();
        expect(screen.getByText('...')).toBeInTheDocument();
      });
    });
  });

  describe('Top Artists Section', () => {
    it('displays top artists when data loads successfully', async () => {
      fetch.mockImplementation(url => {
        if (url.includes('kv-fetch-top-artists')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockTopArtists,
          });
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      await act(async () => {
        render(<MyStats />);
      });

      await waitFor(() => {
        expect(screen.getByText('👩‍🎤 Top Artists')).toBeInTheDocument();
        expect(
          screen.getByText('The top artists I listened to in the past 7 days.')
        ).toBeInTheDocument();

        // Check first artist
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
        expect(screen.getByText('Progressive Rock')).toBeInTheDocument();
        expect(screen.getByText('1234 plays')).toBeInTheDocument();

        // Check artist with no genre
        expect(screen.getByText('The Beatles')).toBeInTheDocument();
        expect(screen.getByText('No genre')).toBeInTheDocument();
      });
    });

    it('handles top artists API error gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      fetch.mockImplementation(url => {
        if (url.includes('kv-fetch-top-artists')) {
          return Promise.reject(new Error('API Error'));
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      await act(async () => {
        render(<MyStats />);
      });

      await waitFor(() => {
        expect(screen.getByText('Loading artists...')).toBeInTheDocument();
      });

      expect(consoleError).toHaveBeenCalledWith('Error fetching top artists:', expect.any(Error));

      consoleError.mockRestore();
    });
  });

  describe('Top Albums Section', () => {
    it('displays top albums when data loads successfully', async () => {
      fetch.mockImplementation(url => {
        if (url.includes('kv-fetch-top-albums')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockTopAlbums,
          });
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      await act(async () => {
        render(<MyStats />);
      });

      await waitFor(() => {
        expect(screen.getByText('🏆 Top Albums')).toBeInTheDocument();
        expect(
          screen.getByText('The top albums I listened to in the past 30 days.')
        ).toBeInTheDocument();

        // Check albums
        expect(screen.getByText('The Wall')).toBeInTheDocument();
        expect(screen.getByText('567 plays')).toBeInTheDocument();
        expect(screen.getByText('Led Zeppelin IV')).toBeInTheDocument();
        expect(screen.getByText('432 plays')).toBeInTheDocument();
      });
    });
  });

  describe('Discogs Collection Section', () => {
    it('displays recent collection additions when data loads successfully', async () => {
      fetch.mockImplementation(url => {
        if (url.includes('kv-fetch-discogs-collection')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockDiscogsCollection,
          });
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      await act(async () => {
        render(<MyStats />);
      });

      await waitFor(() => {
        expect(screen.getByText('💿 Recent Collection Additions')).toBeInTheDocument();
        expect(
          screen.getByText('The most recent additions to my physical music collection.')
        ).toBeInTheDocument();

        // Check first item
        expect(screen.getByText('Abbey Road')).toBeInTheDocument();
        expect(screen.getByText('The Beatles')).toBeInTheDocument(); // (UK Band) should be stripped
        expect(screen.getByText(/Vinyl added on January 15, 2024/)).toBeInTheDocument();
        expect(screen.getByText(/Rock album released in 1969/)).toBeInTheDocument();

        // Check item with no year
        expect(screen.getByText('Rumours')).toBeInTheDocument();
        expect(screen.getByText(/Pop Rock album unknown release date/)).toBeInTheDocument();
      });
    });

    it('only displays first 6 items from collection', async () => {
      const manyItems = Array(10)
        .fill(null)
        .map((_, i) => ({
          ...mockDiscogsCollection[0],
          title: `Album ${i}`,
          discogsUrl: `https://discogs.com/album-${i}`,
        }));

      fetch.mockImplementation(url => {
        if (url.includes('kv-fetch-discogs-collection')) {
          return Promise.resolve({
            ok: true,
            json: async () => manyItems,
          });
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      await act(async () => {
        render(<MyStats />);
      });

      await waitFor(() => {
        expect(screen.getByText('Album 0')).toBeInTheDocument();
        expect(screen.getByText('Album 5')).toBeInTheDocument();
        expect(screen.queryByText('Album 6')).not.toBeInTheDocument();
      });
    });
  });

  describe('Links and Navigation', () => {
    it('generates correct links for artists and albums', async () => {
      fetch.mockImplementation(url => {
        if (url.includes('api-lastfm-recenttracks')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockRecentTracks,
          });
        } else if (url.includes('kv-fetch-top-artists')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockTopArtists,
          });
        }
        return Promise.resolve({ ok: true, json: async () => [] });
      });

      await act(async () => {
        render(<MyStats />);
      });

      await waitFor(() => {
        // Check recent track links
        const albumLink = screen.getByRole('link', { name: 'Dark Side of the Moon' });
        expect(albumLink).toHaveAttribute('href', '/album/pink-floyd_dark-side-of-the-moon');

        // Check artist links
        const artistLinks = screen.getAllByRole('link', { name: 'Pink Floyd' });
        expect(artistLinks[0]).toHaveAttribute('href', '/artist/pink-floyd');
      });
    });

    it('includes link to full collection', async () => {
      fetch.mockImplementation(() => Promise.resolve({ ok: true, json: async () => [] }));

      await act(async () => {
        render(<MyStats />);
      });

      const collectionLink = screen.getByRole('link', { name: 'here' });
      expect(collectionLink).toHaveAttribute('href', '/collection/all');
    });
  });

  describe('Error Handling', () => {
    it('handles multiple API failures gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      fetch.mockImplementation(() => Promise.reject(new Error('API Error')));

      await act(async () => {
        render(<MyStats />);
      });

      // Page should still render with loading states
      expect(screen.getByText('Real-time listening stats')).toBeInTheDocument();
      expect(screen.getByText('Loading artists...')).toBeInTheDocument();
      expect(screen.getByText('Loading albums...')).toBeInTheDocument();

      consoleError.mockRestore();
    });
  });

  describe('Component Integration', () => {
    it('fetches all data sources on mount', async () => {
      fetch.mockImplementation(() => Promise.resolve({ ok: true, json: async () => [] }));

      await act(async () => {
        render(<MyStats />);
      });

      // Should make 4 API calls
      await waitFor(() => {
        const apiCalls = fetch.mock.calls.map(call => call[0]);
        expect(apiCalls).toContainEqual(expect.stringContaining('api-lastfm-recenttracks'));
        expect(apiCalls).toContainEqual(expect.stringContaining('kv-fetch-top-artists'));
        expect(apiCalls).toContainEqual(expect.stringContaining('kv-fetch-top-albums'));
        expect(apiCalls).toContainEqual(expect.stringContaining('kv-fetch-discogs-collection'));
      });
    });
  });
});
