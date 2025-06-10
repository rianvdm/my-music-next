import { render, screen, fireEvent } from '../utils/test-utils';
import FormatFilter from '../../app/components/FormatFilter';

const mockFormats = ['All', 'Vinyl', 'CD', 'Digital', 'Cassette'];
const mockOnChange = jest.fn();

describe('FormatFilter Component', () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with correct label', () => {
    render(
      <FormatFilter selectedFormat="All" uniqueFormats={mockFormats} onChange={mockOnChange} />
    );

    expect(screen.getByText('Format:')).toBeInTheDocument();
  });

  it('renders select element with correct options', () => {
    render(
      <FormatFilter selectedFormat="All" uniqueFormats={mockFormats} onChange={mockOnChange} />
    );

    const select = screen.getByLabelText('Format:');
    expect(select).toBeInTheDocument();

    // Check all options are present
    mockFormats.forEach(format => {
      expect(screen.getByRole('option', { name: format })).toBeInTheDocument();
    });
  });

  it('displays selected format correctly', () => {
    render(
      <FormatFilter selectedFormat="Vinyl" uniqueFormats={mockFormats} onChange={mockOnChange} />
    );

    const select = screen.getByLabelText('Format:');
    expect(select.value).toBe('Vinyl');
  });

  it('calls onChange when selection changes', () => {
    render(
      <FormatFilter selectedFormat="All" uniqueFormats={mockFormats} onChange={mockOnChange} />
    );

    const select = screen.getByLabelText('Format:');
    fireEvent.change(select, { target: { value: 'CD' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('renders all unique formats as options', () => {
    render(
      <FormatFilter selectedFormat="All" uniqueFormats={mockFormats} onChange={mockOnChange} />
    );

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(mockFormats.length);

    options.forEach((option, index) => {
      expect(option).toHaveTextContent(mockFormats[index]);
      expect(option).toHaveValue(mockFormats[index]);
    });
  });
});
