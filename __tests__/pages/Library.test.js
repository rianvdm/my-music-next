import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { useRouter, useSearchParams } from 'next/navigation';
import LibraryPage from '../../app/library/page';

// Mock Next.js router and search params
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock utility functions
jest.mock('../../app/utils/slugify', () => ({
  generateArtistSlug: jest.fn(name => name.toLowerCase().replace(/\s+/g, '-')),
  generateAlbumSlug: jest.fn(name => name.toLowerCase().replace(/\s+/g, '-')),
}));

// Mock components
jest.mock('../../components/ui/LazyImage', () => {
  return function MockLazyImage({ src, alt, width, height }) {
    return <img src={src} alt={alt} width={width} height={height} data-testid="lazy-image" />;
  };
});

jest.mock('../../components/features/library/LibrarySearchBox', () => {
  return function MockLibrarySearchBox({ data, onSearchResults }) {
    return (
      <div data-testid="library-search-box">
        <input
          placeholder="Search library..."
          onChange={e => {
            if (e.target.value === 'test search') {
              onSearchResults([data[0]]); // Return first item for test
            } else if (e.target.value === '') {
              onSearchResults(null); // Clear search
            }
          }}
        />
      </div>
    );
  };
});

jest.mock('../../components/features/library/LibrarySummary', () => {
  return function MockLibrarySummary({
    releaseCount,
    selectedGenre,
    selectedFormat,
    selectedYear,
  }) {
    return (
      <div data-testid="library-summary">
        {releaseCount} releases in {selectedGenre} genre, {selectedFormat} format, {selectedYear}{' '}
        decade
      </div>
    );
  };
});

// Mock fetch globally
global.fetch = jest.fn();

// Mock library data
const mockLibraryData = {
  records: [
    {
      id: '1',
      'Album Artist': 'Artist A',
      Title: 'Album 1',
      'File Format': 'MP3',
      Date: '2020-01-01',
      Genres: 'Rock, Alternative',
      Version: 'dl',
      'Cover Image URL': 'https://example.com/cover1.jpg',
    },
    {
      id: '2',
      'Album Artist': 'Artist B',
      Title: 'Album 2',
      'File Format': 'FLAC',
      Date: '1995-05-15',
      Genres: 'Electronic, Ambient',
      Version: 'Deluxe',
      'Cover Image URL': 'https://example.com/cover2.jpg',
    },
    {
      id: '3',
      'Album Artist': 'Artist C',
      Title: 'Album 3',
      'File Format': 'MP3',
      Date: '2010-12-01',
      Genres: 'Rock',
      Version: null,
      'Cover Image URL': null,
    },
    {
      id: '4',
      'Album Artist': 'Artist A',
      Title: 'Album 4',
      'File Format': 'WAV',
      Date: '1985-03-20',
      Genres: 'Pop, Rock',
      Version: 'Remaster',
      'Cover Image URL': 'https://example.com/cover4.jpg',
    },
  ],
};

describe('Library Page', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  const mockSearchParamsGet = jest.fn();

  beforeEach(() => {
    // Reset mocks
    fetch.mockClear();
    mockPush.mockClear();
    mockReplace.mockClear();
    mockSearchParamsGet.mockClear();

    // Mock router
    useRouter.mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });

    // Mock search params
    useSearchParams.mockReturnValue({
      get: mockSearchParamsGet,
    });

    // Mock successful API response
    fetch.mockResolvedValue({
      ok: true,
      json: async () => mockLibraryData,
    });

    // Default URL params
    mockSearchParamsGet
      .mockReturnValueOnce('All') // genre
      .mockReturnValueOnce('All') // format
      .mockReturnValueOnce('All') // year
      .mockReturnValueOnce('1'); // page
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders loading state initially', () => {
      // Mock fetch to never resolve
      fetch.mockImplementation(() => new Promise(() => {}));

      render(<LibraryPage />);

      expect(screen.getByText('Loading library data...')).toBeInTheDocument();
    });

    it('renders main page content after data loads', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      expect(fetch).toHaveBeenCalledWith('https://api-library.rian-db8.workers.dev/api/library');
    });

    it('handles API error gracefully', async () => {
      fetch.mockRejectedValue(new Error('API Error'));

      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      // Should still render page structure even with API error
      expect(screen.getByText('Digital Library')).toBeInTheDocument();
    });
  });

  describe('Data Processing', () => {
    it('processes genres correctly and sorts by frequency', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      const genreSelect = screen.getByLabelText(/genre/i);
      const options = genreSelect.querySelectorAll('option');

      expect(options[0].value).toBe('All');
      expect(options[1].value).toBe('Rock'); // Most frequent genre (3 occurrences)
    });

    it('extracts unique formats', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      const formatSelect = screen.getByLabelText(/format/i);
      const options = formatSelect.querySelectorAll('option');

      expect(options.length).toBeGreaterThan(3); // All + MP3, FLAC, WAV
    });

    it('calculates decades correctly', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      const decadeSelect = screen.getByLabelText(/decade/i);
      const options = decadeSelect.querySelectorAll('option');

      // Should have All + 1980s, 1990s, 2000s, 2010s, 2020s
      expect(options.length).toBeGreaterThan(4);
    });

    it('handles missing data gracefully', async () => {
      const incompleteData = {
        records: [
          {
            id: '1',
            'Album Artist': 'Artist',
            Title: 'Album',
            // Missing most fields
          },
        ],
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => incompleteData,
      });

      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      // Should render without crashing
      expect(screen.getByText('Artist')).toBeInTheDocument();
    });
  });

  describe('Filtering Functionality', () => {
    it('filters by genre correctly', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      const genreSelect = screen.getByLabelText(/genre/i);
      fireEvent.change(genreSelect, { target: { value: 'Rock' } });

      // Should show only Rock albums (Artist A Album 1, Artist C Album 3, Artist A Album 4)
      await waitFor(() => {
        expect(screen.getAllByText('Artist A').length).toBeGreaterThan(0);
        expect(screen.getByText('Artist C')).toBeInTheDocument();
      });
    });

    it('filters by format correctly', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      const formatSelect = screen.getByLabelText(/format/i);
      fireEvent.change(formatSelect, { target: { value: 'MP3' } });

      // Should show only MP3 albums
      await waitFor(() => {
        expect(screen.getAllByText(/MP3/).length).toBeGreaterThan(0);
      });
    });

    it('filters by decade correctly', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      const decadeSelect = screen.getByLabelText(/decade/i);
      fireEvent.change(decadeSelect, { target: { value: '2020' } });

      // Should show only 2020s albums (check summary shows filtered count)
      await waitFor(() => {
        expect(screen.getByTestId('library-summary')).toHaveTextContent('1 releases');
        expect(screen.getByTestId('library-summary')).toHaveTextContent('2020 decade');
      });
    });

    it('combines multiple filters correctly', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      const genreSelect = screen.getByLabelText(/genre/i);
      const formatSelect = screen.getByLabelText(/format/i);

      fireEvent.change(genreSelect, { target: { value: 'Rock' } });
      fireEvent.change(formatSelect, { target: { value: 'MP3' } });

      // Should show filtered results
      await waitFor(() => {
        expect(screen.getByTestId('library-summary')).toHaveTextContent('Rock genre, MP3 format');
      });
    });

    it('resets filters correctly', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      // Set some filters
      const genreSelect = screen.getByLabelText(/genre/i);
      fireEvent.change(genreSelect, { target: { value: 'Rock' } });

      // Reset filters
      const resetButton = screen.getByText('Reset filters');
      fireEvent.click(resetButton);

      expect(genreSelect.value).toBe('All');
    });
  });

  describe('Sorting Functionality', () => {
    it('sorts by release date by default', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      const sortSelect = screen.getByLabelText(/sort by/i);
      expect(sortSelect.value).toBe('dateAdded');
    });

    it('sorts by artist name when selected', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      const sortSelect = screen.getByLabelText(/sort by/i);
      fireEvent.change(sortSelect, { target: { value: 'artistName' } });

      expect(sortSelect.value).toBe('artistName');
    });
  });

  describe('Search Functionality', () => {
    it('displays search box', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      expect(screen.getByTestId('library-search-box')).toBeInTheDocument();
    });

    it('handles search results', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search library...');
      fireEvent.change(searchInput, { target: { value: 'test search' } });

      // Should show search results
      await waitFor(() => {
        expect(screen.getByTestId('library-summary')).toHaveTextContent('1 releases');
      });
    });

    it('clears search results', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search library...');

      // Search first
      fireEvent.change(searchInput, { target: { value: 'test search' } });
      await waitFor(() => {
        expect(screen.getByTestId('library-summary')).toHaveTextContent('1 releases');
      });

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } });
      await waitFor(() => {
        expect(screen.getByTestId('library-summary')).toHaveTextContent('4 releases');
      });
    });
  });

  describe('Random Selection', () => {
    it('shows random releases when clicked', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      const randomButton = screen.getByText('Random selection');
      fireEvent.click(randomButton);

      // Should show clear button
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('clears random releases when clear is clicked', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      // First get random releases
      const randomButton = screen.getByText('Random selection');
      fireEvent.click(randomButton);

      // Then clear them
      const clearButton = screen.getByText('Clear');
      fireEvent.click(clearButton);

      expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('shows pagination controls', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
    });

    it('disables previous button on first page', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      const prevButton = screen.getByText('Previous');
      expect(prevButton).toBeDisabled();
    });

    it('handles page navigation', async () => {
      // Mock data with more items to enable pagination
      const largeData = {
        records: Array.from({ length: 50 }, (_, i) => ({
          id: `${i + 1}`,
          'Album Artist': `Artist ${i + 1}`,
          Title: `Album ${i + 1}`,
          'File Format': 'MP3',
          Date: '2020-01-01',
          Genres: 'Rock',
        })),
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => largeData,
      });

      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Page 2 of/)).toBeInTheDocument();
      });
    });
  });

  describe('URL Parameters', () => {
    it('initializes filters from URL parameters', async () => {
      // Reset and set up specific mock for this test
      mockSearchParamsGet.mockReset();
      mockSearchParamsGet
        .mockReturnValueOnce('Rock') // genre
        .mockReturnValueOnce('MP3') // format
        .mockReturnValueOnce('2020') // year
        .mockReturnValueOnce('2'); // page

      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      await waitFor(() => {
        const genreSelect = screen.getByLabelText(/genre/i);
        const formatSelect = screen.getByLabelText(/format/i);

        expect(genreSelect.value).toBe('Rock');
        expect(formatSelect.value).toBe('MP3');
      });
    });

    it('updates URL when filters change', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      const genreSelect = screen.getByLabelText(/genre/i);
      fireEvent.change(genreSelect, { target: { value: 'Rock' } });

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalled();
      });
    });
  });

  describe('Release Display', () => {
    it('displays release information correctly', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      // Check if releases are displayed with correct information
      expect(screen.getAllByText('Artist A').length).toBeGreaterThan(0);
      expect(screen.getByText('Album 1')).toBeInTheDocument();
      // Check that all albums are present
      expect(screen.getByText('Album 2')).toBeInTheDocument();
      expect(screen.getByText('Album 3')).toBeInTheDocument();
      expect(screen.getByText('Album 4')).toBeInTheDocument();
    });

    it('handles missing cover images', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      const images = screen.getAllByTestId('lazy-image');
      const albumWithoutCover = images.find(img => img.src.includes('noun-no-image.png'));

      expect(albumWithoutCover).toBeInTheDocument();
    });

    it('shows version information when available', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      expect(screen.getByText(/\(Deluxe\)/)).toBeInTheDocument();
      expect(screen.getByText(/\(Remaster\)/)).toBeInTheDocument();
    });

    it('handles navigation clicks', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      const artistLinks = screen.getAllByText('Artist A');
      fireEvent.click(artistLinks[0]);

      expect(mockPush).toHaveBeenCalledWith('/artist/artist-a');
    });
  });

  describe('Empty States', () => {
    it('shows no results message when no releases match filters', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      // Set filter that returns no results
      const genreSelect = screen.getByLabelText(/genre/i);
      fireEvent.change(genreSelect, { target: { value: 'Nonexistent Genre' } });

      await waitFor(() => {
        expect(screen.getByText('No releases found for the selected filters.')).toBeInTheDocument();
      });
    });
  });

  describe('Integration', () => {
    it('renders all main components together', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      // Check all main sections are present
      expect(screen.getByTestId('library-summary')).toBeInTheDocument();
      expect(screen.getByTestId('library-search-box')).toBeInTheDocument();
      expect(screen.getByLabelText(/genre/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/format/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/decade/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('maintains state consistency across interactions', async () => {
      render(<LibraryPage />);

      await waitFor(() => {
        expect(screen.getByText('Digital Library')).toBeInTheDocument();
      });

      // Set multiple filters and verify they persist
      const genreSelect = screen.getByLabelText(/genre/i);
      const formatSelect = screen.getByLabelText(/format/i);

      fireEvent.change(genreSelect, { target: { value: 'Rock' } });
      fireEvent.change(formatSelect, { target: { value: 'MP3' } });

      expect(genreSelect.value).toBe('Rock');
      expect(formatSelect.value).toBe('MP3');

      // Check that summary updates accordingly
      expect(screen.getByTestId('library-summary')).toHaveTextContent('Rock genre, MP3 format');
    });
  });
});
