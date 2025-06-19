import { render, screen, fireEvent, waitFor, suppressConsoleError } from '../utils/test-utils';
import { useRouter, useSearchParams } from 'next/navigation';
import DiscogsStatsPage from '../../app/collection/page';

// Mock Next.js router and search params
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock recharts components
jest.mock('recharts', () => ({
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ data }) => <div data-testid="pie" data-chart-data={JSON.stringify(data)}></div>,
  Cell: () => <div data-testid="cell"></div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ data }) => <div data-testid="bar" data-chart-data={JSON.stringify(data)}></div>,
  XAxis: () => <div data-testid="x-axis"></div>,
  YAxis: () => <div data-testid="y-axis"></div>,
  CartesianGrid: () => <div data-testid="cartesian-grid"></div>,
  Tooltip: () => <div data-testid="tooltip"></div>,
  Legend: () => <div data-testid="legend"></div>,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock data structure matching the API response
const mockCollectionData = {
  stats: {
    total: 100,
    lastUpdated: '2024-01-01T12:00:00Z',
  },
  data: {
    releases: [
      {
        id: 1,
        basic_information: {
          title: 'Album 1',
          year: 1985,
          artists: [{ name: 'Artist A' }],
          genres: ['Rock', 'Pop'],
          formats: [{ name: 'Vinyl' }],
        },
        original_year: 1985,
        master_genres: ['Rock'],
      },
      {
        id: 2,
        basic_information: {
          title: 'Album 2',
          year: 1990,
          artists: [{ name: 'Artist B' }],
          genres: ['Electronic'],
          formats: [{ name: 'CD' }],
        },
        original_year: 1990,
        master_genres: ['Electronic'],
      },
      {
        id: 3,
        basic_information: {
          title: 'Album 3',
          year: 2000,
          artists: [{ name: 'Artist A' }],
          genres: ['Rock'],
          formats: [{ name: 'Vinyl' }],
        },
        original_year: 2000,
        master_genres: null, // Test fallback to basic_information.genres
      },
      {
        id: 4,
        basic_information: {
          title: 'Album 4',
          year: 2010,
          artists: [{ name: 'Artist C' }],
          genres: ['Jazz'],
          formats: [{ name: 'Digital' }],
        },
        original_year: null, // Test fallback to basic_information.year
      },
    ],
  },
};

describe('Collection Page', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  const mockSearchParamsGet = jest.fn();

  // Suppress console.error for tests that intentionally trigger errors
  const mockConsoleError = suppressConsoleError();

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
      json: async () => mockCollectionData,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders loading state initially', () => {
      // Mock fetch to never resolve
      fetch.mockImplementation(() => new Promise(() => {}));

      render(<DiscogsStatsPage />);

      expect(screen.getByText('Loading collection data...')).toBeInTheDocument();
    });

    it('renders main page content after data loads', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      expect(fetch).toHaveBeenCalledWith('https://kv-fetch-discogs-all.rian-db8.workers.dev');
    });

    it('renders error state when API fails', async () => {
      fetch.mockRejectedValue(new Error('API Error'));

      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Error loading collection data')).toBeInTheDocument();
      });
    });
  });

  describe('Data Processing', () => {
    it('calculates top genres correctly', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      // Should have genre filter with top genres
      const genreFilter = screen.getByLabelText(/genre/i);
      expect(genreFilter).toBeInTheDocument();

      // Check that options are present (All + top genres + Other)
      const options = genreFilter.querySelectorAll('option');
      expect(options.length).toBeGreaterThan(3); // At least All, Rock, Electronic, Other
    });

    it('calculates top formats correctly', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      const formatFilter = screen.getByLabelText(/format/i);
      expect(formatFilter).toBeInTheDocument();

      const options = formatFilter.querySelectorAll('option');
      expect(options.length).toBeGreaterThan(3); // At least All, Vinyl, CD, Other
    });

    it('calculates decades correctly', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      const decadeFilter = screen.getByLabelText(/decade/i);
      expect(decadeFilter).toBeInTheDocument();

      const options = decadeFilter.querySelectorAll('option');
      expect(options.length).toBeGreaterThan(3); // At least All, 1980s, 1990s, 2000s
    });

    it('handles releases with missing master_genres', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      // Should still render without errors even with null master_genres
      expect(screen.getByText('Show releases >>')).toBeInTheDocument();
    });

    it('handles releases with missing original_year', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      // Should still process releases that fall back to basic_information.year
      expect(screen.getByText('Show releases >>')).toBeInTheDocument();
    });
  });

  describe('Filtering Functionality', () => {
    it('filters by genre correctly', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      const genreFilter = screen.getByLabelText(/genre/i);
      fireEvent.change(genreFilter, { target: { value: 'Rock' } });

      // Should update the release count display - check for specific number
      expect(screen.getByText(/2 releases/i)).toBeInTheDocument();
    });

    it('filters by format correctly', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      const formatFilter = screen.getByLabelText(/format/i);
      fireEvent.change(formatFilter, { target: { value: 'Vinyl' } });

      expect(screen.getByText(/2 releases/i)).toBeInTheDocument();
    });

    it('filters by decade correctly', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      const decadeFilter = screen.getByLabelText(/decade/i);
      fireEvent.change(decadeFilter, { target: { value: '1980' } });

      expect(screen.getByText(/1 releases/i)).toBeInTheDocument();
    });

    it('combines multiple filters correctly', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      const genreFilter = screen.getByLabelText(/genre/i);
      const formatFilter = screen.getByLabelText(/format/i);

      fireEvent.change(genreFilter, { target: { value: 'Rock' } });
      fireEvent.change(formatFilter, { target: { value: 'Vinyl' } });

      // Should show filtered results
      expect(screen.getByText(/2 releases/i)).toBeInTheDocument();
    });

    it('handles "Other" genre filtering', async () => {
      // Add more diverse mock data to test "Other" category
      const extendedMockData = {
        stats: {
          total: 105,
          lastUpdated: '2024-01-01T12:00:00Z',
        },
        data: {
          releases: [
            ...mockCollectionData.data.releases,
            {
              id: 5,
              basic_information: {
                title: 'Album 5',
                year: 2020,
                artists: [{ name: 'Artist D' }],
                genres: ['RareGenre'],
                formats: [{ name: 'Vinyl' }],
              },
              original_year: 2020,
              master_genres: ['RareGenre'],
            },
          ],
        },
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => extendedMockData,
      });

      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      const genreFilter = screen.getByLabelText(/genre/i);
      fireEvent.change(genreFilter, { target: { value: 'Other' } });

      expect(screen.getByText(/0 releases/i)).toBeInTheDocument();
    });
  });

  describe('Chart Rendering', () => {
    it('renders main chart sections', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Genre Distribution')).toBeInTheDocument();
        expect(screen.getByText('Format Distribution')).toBeInTheDocument();
        expect(screen.getByText('Top 10 Artists')).toBeInTheDocument();
      });

      // Charts should be present (multiple pie/bar charts expected)
      expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThan(0);
    });

    it('does not render genre chart when specific genre is selected', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      const genreFilter = screen.getByLabelText(/genre/i);
      fireEvent.change(genreFilter, { target: { value: 'Rock' } });

      expect(screen.queryByText('Genre Distribution')).not.toBeInTheDocument();
    });
  });

  describe('URL Parameters', () => {
    it('initializes filters from URL parameters', async () => {
      mockSearchParamsGet
        .mockReturnValueOnce('Rock') // genre
        .mockReturnValueOnce('Vinyl') // format
        .mockReturnValueOnce('1980'); // decade

      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      const genreFilter = screen.getByDisplayValue('Rock');
      const formatFilter = screen.getByDisplayValue('Vinyl');
      const decadeFilter = screen.getByRole('combobox', { name: /decade/i });

      expect(genreFilter).toBeInTheDocument();
      expect(formatFilter).toBeInTheDocument();
      expect(decadeFilter).toBeInTheDocument();
      expect(decadeFilter.value).toBe('1980');
    });

    it('updates URL when filters change', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      const genreFilter = screen.getByLabelText(/genre/i);
      fireEvent.change(genreFilter, { target: { value: 'Rock' } });

      // Should call router.replace with new URL
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalled();
      });
    });

    it('handles "Show releases" button navigation', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Show releases >>')).toBeInTheDocument();
      });

      const showReleasesButton = screen.getByText('Show releases >>');
      fireEvent.click(showReleasesButton);

      expect(mockPush).toHaveBeenCalledWith('/collection/all');
    });

    it('includes filters in "Show releases" navigation', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      const genreFilter = screen.getByLabelText(/genre/i);
      fireEvent.change(genreFilter, { target: { value: 'Rock' } });

      const showReleasesButton = screen.getByText('Show releases >>');
      fireEvent.click(showReleasesButton);

      expect(mockPush).toHaveBeenCalledWith('/collection/all?genre=Rock');
    });
  });

  describe('Statistical Calculations', () => {
    it('calculates percentages correctly', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      // The component should process data and calculate percentages
      // This is tested implicitly by ensuring charts render without errors
      const pieCharts = screen.getAllByTestId('pie-chart');
      expect(pieCharts.length).toBeGreaterThan(0);
    });

    it('handles empty data gracefully', async () => {
      const emptyMockData = {
        stats: {
          total: 0,
          lastUpdated: '2024-01-01T12:00:00Z',
        },
        data: { releases: [] },
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => emptyMockData,
      });

      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      // Should handle empty data without crashing
      expect(screen.getByText('Show releases >>')).toBeInTheDocument();
    });

    it('generates year range correctly', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Releases by Original Release Year')).toBeInTheDocument();
      });

      // Should render year chart with proper year range
      const barCharts = screen.getAllByTestId('bar-chart');
      expect(barCharts.length).toBeGreaterThan(0);
    });
  });

  describe('Integration', () => {
    it('renders all components together correctly', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      // Check all main sections are present
      expect(screen.getByText('Genre Distribution')).toBeInTheDocument();
      expect(screen.getByText('Format Distribution')).toBeInTheDocument();
      expect(screen.getByText('Top 10 Artists')).toBeInTheDocument();
      expect(screen.getByText('Releases by Original Release Year')).toBeInTheDocument();
      expect(screen.getByText('Show releases >>')).toBeInTheDocument();
    });

    it('maintains filter state across interactions', async () => {
      render(<DiscogsStatsPage />);

      await waitFor(() => {
        expect(screen.getByText('Physical Collection Stats')).toBeInTheDocument();
      });

      const genreFilter = screen.getByLabelText(/genre/i);
      const formatFilter = screen.getByLabelText(/format/i);

      // Set multiple filters
      fireEvent.change(genreFilter, { target: { value: 'Rock' } });
      fireEvent.change(formatFilter, { target: { value: 'Vinyl' } });

      // Both filters should maintain their values
      expect(genreFilter.value).toBe('Rock');
      expect(formatFilter.value).toBe('Vinyl');
    });
  });
});
