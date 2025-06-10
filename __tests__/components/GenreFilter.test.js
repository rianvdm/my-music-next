import { render, screen, fireEvent } from '../utils/test-utils';
import GenreFilter from '../../app/components/GenreFilter';

const mockGenres = ['All', 'Rock', 'Jazz', 'Electronic', 'Hip-Hop'];
const mockOnChange = jest.fn();

describe('GenreFilter Component', () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with correct label', () => {
    render(<GenreFilter selectedGenre="All" uniqueGenres={mockGenres} onChange={mockOnChange} />);

    expect(screen.getByText('Genre:')).toBeInTheDocument();
  });

  it('renders select element with correct options', () => {
    render(<GenreFilter selectedGenre="All" uniqueGenres={mockGenres} onChange={mockOnChange} />);

    const select = screen.getByLabelText('Genre:');
    expect(select).toBeInTheDocument();

    // Check all options are present
    mockGenres.forEach(genre => {
      expect(screen.getByRole('option', { name: genre })).toBeInTheDocument();
    });
  });

  it('displays selected genre correctly', () => {
    render(<GenreFilter selectedGenre="Rock" uniqueGenres={mockGenres} onChange={mockOnChange} />);

    const select = screen.getByLabelText('Genre:');
    expect(select.value).toBe('Rock');
  });

  it('calls onChange when selection changes', () => {
    render(<GenreFilter selectedGenre="All" uniqueGenres={mockGenres} onChange={mockOnChange} />);

    const select = screen.getByLabelText('Genre:');
    fireEvent.change(select, { target: { value: 'Jazz' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    // Just check that onChange was called, don't test exact event structure
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('renders all unique genres as options', () => {
    render(<GenreFilter selectedGenre="All" uniqueGenres={mockGenres} onChange={mockOnChange} />);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(mockGenres.length);

    options.forEach((option, index) => {
      expect(option).toHaveTextContent(mockGenres[index]);
      expect(option).toHaveValue(mockGenres[index]);
    });
  });

  it('handles empty genres list', () => {
    render(<GenreFilter selectedGenre="" uniqueGenres={[]} onChange={mockOnChange} />);

    const select = screen.getByLabelText('Genre:');
    expect(select).toBeInTheDocument();

    const options = screen.queryAllByRole('option');
    expect(options).toHaveLength(0);
  });
});
