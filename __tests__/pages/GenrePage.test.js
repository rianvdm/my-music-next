import { render, screen, waitFor, act } from '../utils/test-utils';
import GenrePage from '../../app/genre/[genre]/page';

// Mock marked library
jest.mock('marked', () => ({
  marked: jest.fn(text => text),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock data
const mockGenreSummary = {
  data: {
    content:
      'Progressive Rock is a genre that emerged in the late 1960s[1]. It is characterized by complex compositions and virtuoso musicianship[2]. Notable bands include Pink Floyd, Yes, and Genesis[3].',
    citations: [
      'https://en.wikipedia.org/wiki/Progressive_rock',
      'https://www.allmusic.com/genre/progressive-rock',
      'https://www.progarchives.com/definition.asp',
    ],
  },
};

describe('Genre Page', () => {
  const mockParams = {
    genre: 'progressive-rock',
  };

  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders loading state initially', async () => {
      // Mock fetch to never resolve
      fetch.mockImplementation(() => new Promise(() => {}));

      await act(async () => {
        render(<GenrePage params={mockParams} />);
      });

      expect(screen.getByText('Progressive Rock')).toBeInTheDocument();
      expect(screen.getByText('Generating summary...')).toBeInTheDocument();
    });

    it('decodes URL parameters correctly', async () => {
      const complexParams = {
        genre: 'jazz-fusion',
      };

      fetch.mockImplementation(() => new Promise(() => {}));

      await act(async () => {
        render(<GenrePage params={complexParams} />);
      });

      expect(screen.getByText('Jazz Fusion')).toBeInTheDocument();
    });

    it('capitalizes genre names properly', async () => {
      const multiWordParams = {
        genre: 'alternative-rock-and-indie',
      };

      fetch.mockImplementation(() => new Promise(() => {}));

      await act(async () => {
        render(<GenrePage params={multiWordParams} />);
      });

      expect(screen.getByText('Alternative Rock And Indie')).toBeInTheDocument();
    });
  });

  describe('Genre Summary Display', () => {
    it('displays genre summary when data loads successfully', async () => {
      fetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockGenreSummary,
        })
      );

      await act(async () => {
        render(<GenrePage params={mockParams} />);
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Progressive Rock is a genre that emerged in the late 1960s/)
        ).toBeInTheDocument();
      });
    });

    it('renders citations with clickable links', async () => {
      fetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockGenreSummary,
        })
      );

      await act(async () => {
        render(<GenrePage params={mockParams} />);
      });

      await waitFor(() => {
        // Check that citations are replaced with links
        const content = screen.getByText(/Progressive Rock is a genre/);
        expect(content.innerHTML).toContain(
          'href="https://en.wikipedia.org/wiki/Progressive_rock"'
        );
        expect(content.innerHTML).toContain('target="_blank"');
        expect(content.innerHTML).toContain('rel="noopener noreferrer"');
      });
    });

    it('displays sources section with all citations', async () => {
      fetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockGenreSummary,
        })
      );

      await act(async () => {
        render(<GenrePage params={mockParams} />);
      });

      await waitFor(() => {
        expect(screen.getByText('Sources')).toBeInTheDocument();

        // Check citation links
        expect(screen.getByText('en.wikipedia.org')).toBeInTheDocument();
        expect(screen.getByText('allmusic.com')).toBeInTheDocument();
        expect(screen.getByText('progarchives.com')).toBeInTheDocument();

        // Check citation numbers
        expect(screen.getByText('[1]')).toBeInTheDocument();
        expect(screen.getByText('[2]')).toBeInTheDocument();
        expect(screen.getByText('[3]')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      fetch.mockImplementation(() => Promise.reject(new Error('API Error')));

      await act(async () => {
        render(<GenrePage params={mockParams} />);
      });

      await waitFor(() => {
        expect(screen.getByText('Failed to load genre summary.')).toBeInTheDocument();
      });

      expect(consoleError).toHaveBeenCalledWith('Error fetching genre summary:', expect.any(Error));

      consoleError.mockRestore();
    });

    it('handles empty citations array', async () => {
      const summaryWithNoCitations = {
        data: {
          content: 'Rock music is a broad genre of popular music.',
          citations: [],
        },
      };

      fetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => summaryWithNoCitations,
        })
      );

      await act(async () => {
        render(<GenrePage params={mockParams} />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Rock music is a broad genre/)).toBeInTheDocument();
        expect(screen.queryByText('Sources')).not.toBeInTheDocument();
      });
    });

    it('handles malformed citation references', async () => {
      const malformedSummary = {
        data: {
          content: 'This has a reference[99] that does not exist in citations.',
          citations: ['https://example.com'],
        },
      };

      fetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => malformedSummary,
        })
      );

      await act(async () => {
        render(<GenrePage params={mockParams} />);
      });

      await waitFor(() => {
        // Should display content with unmodified citation
        expect(screen.getByText(/This has a reference\[99\]/)).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('makes correct API call with encoded genre parameter', async () => {
      fetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockGenreSummary,
        })
      );

      await act(async () => {
        render(<GenrePage params={mockParams} />);
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/genre-summary?genre=Progressive%20Rock');
      });
    });

    it('only fetches data once on mount', async () => {
      fetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockGenreSummary,
        })
      );

      const { rerender } = await act(async () => {
        return render(<GenrePage params={mockParams} />);
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      // Re-render with same params
      await act(async () => {
        rerender(<GenrePage params={mockParams} />);
      });

      // Should not fetch again
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles special characters in genre names', async () => {
      const specialParams = {
        genre: 'r%26b-soul', // R&B/Soul encoded
      };

      fetch.mockImplementation(() => new Promise(() => {}));

      await act(async () => {
        render(<GenrePage params={specialParams} />);
      });

      expect(screen.getByText('R&B Soul')).toBeInTheDocument();
    });

    it('handles empty genre parameter', async () => {
      const emptyParams = {
        genre: '',
      };

      fetch.mockImplementation(() => new Promise(() => {}));

      await act(async () => {
        render(<GenrePage params={emptyParams} />);
      });

      // Should still render but with empty header
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('');
    });

    it('handles very long genre names', async () => {
      const longParams = {
        genre: 'experimental-avant-garde-post-modern-deconstructed-electronic-music',
      };

      fetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockGenreSummary,
        })
      );

      await act(async () => {
        render(<GenrePage params={longParams} />);
      });

      expect(
        screen.getByText('Experimental Avant Garde Post Modern Deconstructed Electronic Music')
      ).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows correct loading spinner variant', async () => {
      fetch.mockImplementation(() => new Promise(() => {}));

      await act(async () => {
        render(<GenrePage params={mockParams} />);
      });

      const spinner = screen.getByText('Generating summary...');
      expect(spinner).toBeInTheDocument();
    });

    it('transitions from loading to loaded state', async () => {
      let resolvePromise;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      fetch.mockImplementation(() => promise);

      await act(async () => {
        render(<GenrePage params={mockParams} />);
      });

      // Initially loading
      expect(screen.getByText('Generating summary...')).toBeInTheDocument();

      // Resolve the promise
      await act(async () => {
        resolvePromise({
          ok: true,
          json: async () => mockGenreSummary,
        });
      });

      // Should now show content
      await waitFor(() => {
        expect(screen.queryByText('Generating summary...')).not.toBeInTheDocument();
        expect(screen.getByText(/Progressive Rock is a genre that emerged/)).toBeInTheDocument();
      });
    });
  });
});
