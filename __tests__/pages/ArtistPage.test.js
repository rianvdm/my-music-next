import { render, screen, waitFor } from '../utils/test-utils';
import ArtistPage from '../../app/artist/[artist]/page';

// Mock utility functions
jest.mock('../../app/utils/slugify', () => ({
  generateArtistSlug: jest.fn(name => name.toLowerCase().replace(/\s+/g, '-')),
  generateAlbumSlug: jest.fn(name => name.toLowerCase().replace(/\s+/g, '-')),
  generateLastfmArtistSlug: jest.fn(name => name.toLowerCase().replace(/\s+/g, '-')),
  generateGenreSlug: jest.fn(name => name.toLowerCase().replace(/\s+/g, '-')),
}));

// Mock marked for markdown parsing
jest.mock('marked', () => ({
  marked: jest.fn(text => `<p>${text}</p>`),
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

// Mock artist data structure
const mockArtistData = {
  name: 'Pink Floyd',
  image: 'https://example.com/artist-image.jpg',
  bio: 'Pink Floyd were an English rock band formed in London in 1965...',
  userplaycount: '5000000',
  playcount: '500000000',
  tags: ['Progressive Rock', 'Psychedelic Rock', 'Classic Rock'],
  similar: ['Genesis', 'King Crimson', 'Yes'],
};

const mockTopAlbums = [
  {
    name: 'Dark Side of the Moon',
    playcount: '50000000',
    image: [{ size: 'large', '#text': 'https://example.com/dsotm.jpg' }],
  },
  {
    name: 'The Wall',
    playcount: '45000000',
    image: [{ size: 'large', '#text': 'https://example.com/wall.jpg' }],
  },
  {
    name: 'Wish You Were Here',
    playcount: '40000000',
    image: [{ size: 'large', '#text': 'https://example.com/wywh.jpg' }],
  },
];

const mockOpenAISummary =
  'Pink Floyd is widely regarded as one of the most influential rock bands of all time, known for their progressive and psychedelic sound...';

describe('Artist Page', () => {
  const mockParams = {
    artist: 'pink-floyd',
  };

  beforeEach(() => {
    fetch.mockClear();

    // Mock successful API responses by default
    fetch.mockImplementation(url => {
      if (url.includes('api-lastfm-artistdetail')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockArtistData,
        });
      } else if (url.includes('api-lastfm-artisttopalbums')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ topAlbums: mockTopAlbums }),
        });
      } else if (url.includes('api-openai-artistdetail')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: mockOpenAISummary }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders loading state initially', () => {
      // Mock fetch to never resolve
      fetch.mockImplementation(() => new Promise(() => {}));

      render(<ArtistPage params={mockParams} />);

      expect(screen.getByText('Loading content...')).toBeInTheDocument();
    });

    it('parses artist name from URL correctly', async () => {
      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
      });
    });

    it('handles URL with complex artist names', async () => {
      const complexParams = {
        artist: 'guns-n-roses',
      };

      const mockComplexArtistData = {
        ...mockArtistData,
        name: "Guns N' Roses",
      };

      fetch.mockImplementation(url => {
        if (url.includes('api-lastfm-artistdetail')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockComplexArtistData,
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<ArtistPage params={complexParams} />);

      await waitFor(() => {
        expect(screen.getByText("Guns N' Roses")).toBeInTheDocument();
      });
    });

    it('displays error state when artist not found', async () => {
      fetch.mockImplementation(url => {
        if (url.includes('api-lastfm-artistdetail')) {
          return Promise.resolve({
            ok: false,
            status: 404,
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText(/Artist not found/)).toBeInTheDocument();
      });
    });
  });

  describe('Artist Data Display', () => {
    it('displays artist information correctly', async () => {
      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
        expect(screen.getByText(/5,000,000/)).toBeInTheDocument(); // Formatted userplaycount
      });
    });

    it('does not display artist biography (component does not render bio)', async () => {
      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
      });

      // Component doesn't render the bio, only the AI summary
      expect(
        screen.queryByText(/Pink Floyd were an English rock band formed in London in 1965/)
      ).not.toBeInTheDocument();
    });

    it('displays only the first artist genre', async () => {
      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Progressive Rock')).toBeInTheDocument();
      });

      // Component only shows the first genre
      expect(screen.queryByText('Psychedelic Rock')).not.toBeInTheDocument();
      expect(screen.queryByText('Classic Rock')).not.toBeInTheDocument();
    });

    it('displays similar artists', async () => {
      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Genesis')).toBeInTheDocument();
        expect(screen.getByText('King Crimson')).toBeInTheDocument();
        expect(screen.getByText('Yes')).toBeInTheDocument();
      });
    });

    it('handles missing artist image gracefully', async () => {
      const artistDataWithoutImage = {
        ...mockArtistData,
        image: '', // Empty string triggers fallback, empty array [] doesn't
      };

      fetch.mockImplementation(url => {
        if (url.includes('api-lastfm-artistdetail')) {
          return Promise.resolve({
            ok: true,
            json: async () => artistDataWithoutImage,
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
      });

      // Component renders img tag with fallback src when image is empty string
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'https://file.elezea.com/noun-no-image.png');
    });

    it('handles missing biography gracefully', async () => {
      const artistDataWithoutBio = {
        ...mockArtistData,
        bio: null,
      };

      fetch.mockImplementation(url => {
        if (url.includes('api-lastfm-artistdetail')) {
          return Promise.resolve({
            ok: true,
            json: async () => artistDataWithoutBio,
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
      });

      // Should still render artist name and other data
      expect(screen.getByText(/5,000,000/)).toBeInTheDocument();
    });
  });

  describe('Top Albums Display', () => {
    it('displays top albums when available', async () => {
      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Dark Side of the Moon')).toBeInTheDocument();
        expect(screen.getByText('The Wall')).toBeInTheDocument();
        expect(screen.getByText('Wish You Were Here')).toBeInTheDocument();
      });
    });

    it('creates correct album links', async () => {
      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Dark Side of the Moon')).toBeInTheDocument();
      });

      const albumLink = screen.getByRole('link', { name: /Dark Side of the Moon/ });
      expect(albumLink).toHaveAttribute('href', '/album/pink-floyd_dark-side-of-the-moon');
    });

    it('does not display album play counts (component does not show them)', async () => {
      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Dark Side of the Moon')).toBeInTheDocument();
      });

      // Component doesn't display album play counts, only album names
      expect(screen.queryByText(/50,000,000/)).not.toBeInTheDocument();
      expect(screen.queryByText(/45,000,000/)).not.toBeInTheDocument();
      expect(screen.queryByText(/40,000,000/)).not.toBeInTheDocument();
    });

    it('handles top albums API error gracefully', async () => {
      fetch.mockImplementation(url => {
        if (url.includes('api-lastfm-artistdetail')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockArtistData,
          });
        } else if (url.includes('api-lastfm-topalbums')) {
          return Promise.reject(new Error('Top albums API Error'));
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
      });

      // Should still render artist data even if top albums fail
      expect(screen.getByText(/5,000,000/)).toBeInTheDocument();
    });

    it('handles empty top albums list', async () => {
      fetch.mockImplementation(url => {
        if (url.includes('api-lastfm-artistdetail')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockArtistData,
          });
        } else if (url.includes('api-lastfm-topalbums')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ topalbums: { album: [] } }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
      });

      // Should handle empty albums gracefully
      expect(screen.queryByText('Dark Side of the Moon')).not.toBeInTheDocument();
    });
  });

  describe('AI Summary', () => {
    it('displays AI summary when available', async () => {
      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            /Pink Floyd is widely regarded as one of the most influential rock bands/
          )
        ).toBeInTheDocument();
      });
    });

    it('handles AI summary errors gracefully', async () => {
      fetch.mockImplementation(url => {
        if (url.includes('api-lastfm-artistdetail')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockArtistData,
          });
        } else if (url.includes('api-openai-artistdetail')) {
          return Promise.reject(new Error('AI API Error'));
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
      });

      // Should handle error gracefully
      await waitFor(() => {
        expect(screen.getByText(/Failed to load ChatGPT summary/)).toBeInTheDocument();
      });
    });

    it('shows loading state for AI summary', async () => {
      // Mock to delay AI summary
      fetch.mockImplementation(url => {
        if (url.includes('api-lastfm-artistdetail')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockArtistData,
          });
        } else if (url.includes('api-lastfm-artisttopalbums')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ topAlbums: mockTopAlbums }),
          });
        } else if (url.includes('api-openai-artistdetail')) {
          // Delay to see loading state
          return new Promise(() => {});
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<ArtistPage params={mockParams} />);

      // Should show loading state initially
      expect(screen.getByText('Loading content...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
      });

      // Should show AI summary loading state
      expect(screen.getByText('Loading summary...')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('creates correct similar artist links', async () => {
      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Genesis')).toBeInTheDocument();
      });

      const similarArtistLink = screen.getByRole('link', { name: /Genesis/ });
      expect(similarArtistLink).toHaveAttribute('href', '/artist/genesis');
    });

    it('creates correct genre links', async () => {
      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Progressive Rock')).toBeInTheDocument();
      });

      const genreLink = screen.getByRole('link', { name: /Progressive Rock/ });
      expect(genreLink).toHaveAttribute('href', '/genre/progressive-rock');
    });

    it('does not include Last.fm profile link (component does not render it)', async () => {
      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
      });

      // Component doesn't include a Last.fm profile link
      expect(screen.queryByRole('link', { name: /View on Last.fm/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /last.fm/ })).not.toBeInTheDocument();
    });
  });

  describe('Data Formatting', () => {
    it('formats large numbers correctly', async () => {
      const artistWithLargeStats = {
        ...mockArtistData,
        userplaycount: '12345678',
      };

      fetch.mockImplementation(url => {
        if (url.includes('api-lastfm-artistdetail')) {
          return Promise.resolve({
            ok: true,
            json: async () => artistWithLargeStats,
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
      });

      // Should format numbers with commas
      expect(screen.getByText(/12,345,678/)).toBeInTheDocument();
    });

    it('handles zero stats gracefully', async () => {
      const artistWithZeroStats = {
        ...mockArtistData,
        userplaycount: '0',
      };

      fetch.mockImplementation(url => {
        if (url.includes('api-lastfm-artistdetail')) {
          return Promise.resolve({
            ok: true,
            json: async () => artistWithZeroStats,
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
      });

      expect(screen.getByText('0 plays')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles artist with no tags', async () => {
      const artistDataWithoutTags = {
        ...mockArtistData,
        tags: [],
      };

      fetch.mockImplementation(url => {
        if (url.includes('api-lastfm-artistdetail')) {
          return Promise.resolve({
            ok: true,
            json: async () => artistDataWithoutTags,
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
      });

      // Should still render without crashing
      expect(screen.getByText(/5,000,000/)).toBeInTheDocument();
    });

    it('handles artist with no similar artists', async () => {
      const artistDataWithoutSimilar = {
        ...mockArtistData,
        similar: [],
      };

      fetch.mockImplementation(url => {
        if (url.includes('api-lastfm-artistdetail')) {
          return Promise.resolve({
            ok: true,
            json: async () => artistDataWithoutSimilar,
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
      });

      // Should still render without crashing
      expect(screen.queryByText('Genesis')).not.toBeInTheDocument();
    });

    it('handles malformed URL parameters', async () => {
      const malformedParams = {
        artist: '',
      };

      render(<ArtistPage params={malformedParams} />);

      // Should handle gracefully without crashing
      expect(screen.getByText('Loading content...')).toBeInTheDocument();
    });

    it('handles API returning artist data with error flag', async () => {
      fetch.mockImplementation(url => {
        if (url.includes('api-lastfm-artistdetail')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ error: 'Artist not found' }),
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText(/Artist not found/)).toBeInTheDocument();
      });
    });
  });

  describe('Integration', () => {
    it('renders all main sections together', async () => {
      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
        expect(screen.getByText(/5,000,000/)).toBeInTheDocument();
      });

      // Wait for async content
      await waitFor(() => {
        expect(
          screen.getByText(
            /Pink Floyd is widely regarded as one of the most influential rock bands/
          )
        ).toBeInTheDocument();
        expect(screen.getByText('Dark Side of the Moon')).toBeInTheDocument();
      });

      // Check main sections are present
      expect(screen.getByText('Progressive Rock')).toBeInTheDocument(); // First genre only
      expect(screen.getByText('Genesis')).toBeInTheDocument(); // Similar artists
      expect(screen.getByText('The Wall')).toBeInTheDocument(); // Top albums
      // Bio is not rendered in the component, only AI summary
    });

    it('maintains proper loading states throughout', async () => {
      render(<ArtistPage params={mockParams} />);

      // Initial loading
      expect(screen.getByText('Loading content...')).toBeInTheDocument();

      // Artist data loads
      await waitFor(() => {
        expect(screen.getByText('Pink Floyd')).toBeInTheDocument();
      });

      // Top albums load
      await waitFor(() => {
        expect(screen.getByText('Dark Side of the Moon')).toBeInTheDocument();
      });

      // AI summary loads
      await waitFor(() => {
        expect(
          screen.getByText(
            /Pink Floyd is widely regarded as one of the most influential rock bands/
          )
        ).toBeInTheDocument();
      });
    });

    it('handles complete API failure gracefully', async () => {
      fetch.mockImplementation(() => {
        return Promise.reject(new Error('Complete API failure'));
      });

      render(<ArtistPage params={mockParams} />);

      await waitFor(() => {
        expect(screen.getByText(/Complete API failure/)).toBeInTheDocument();
      });
    });
  });
});
