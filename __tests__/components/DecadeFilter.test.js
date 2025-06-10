import { render, screen, fireEvent } from '../utils/test-utils';
import DecadeFilter from '../../app/components/DecadeFilter';

const mockDecades = ['All', '1960', '1970', '1980', '1990', '2000'];
const mockOnChange = jest.fn();

describe('DecadeFilter Component', () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with correct label', () => {
    render(
      <DecadeFilter selectedDecade="All" uniqueDecades={mockDecades} onChange={mockOnChange} />
    );

    expect(screen.getByText('Decade:')).toBeInTheDocument();
  });

  it('renders select element with correct options', () => {
    render(
      <DecadeFilter selectedDecade="All" uniqueDecades={mockDecades} onChange={mockOnChange} />
    );

    const select = screen.getByLabelText('Decade:');
    expect(select).toBeInTheDocument();

    // Check that 'All' displays as 'All'
    expect(screen.getByDisplayValue('All')).toBeInTheDocument();

    // Check that decades display with 's' suffix
    expect(screen.getByRole('option', { name: '1960s' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '1970s' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '1980s' })).toBeInTheDocument();
  });

  it('displays selected decade correctly', () => {
    render(
      <DecadeFilter selectedDecade="1980" uniqueDecades={mockDecades} onChange={mockOnChange} />
    );

    const select = screen.getByLabelText('Decade:');
    expect(select.value).toBe('1980');
  });

  it('calls onChange when selection changes', () => {
    render(
      <DecadeFilter selectedDecade="All" uniqueDecades={mockDecades} onChange={mockOnChange} />
    );

    const select = screen.getByLabelText('Decade:');
    fireEvent.change(select, { target: { value: '1990' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('formats decade display correctly', () => {
    render(
      <DecadeFilter selectedDecade="All" uniqueDecades={mockDecades} onChange={mockOnChange} />
    );

    // 'All' should display as 'All'
    expect(screen.getByText('All')).toBeInTheDocument();

    // Other decades should display with 's' suffix
    expect(screen.getByText('1960s')).toBeInTheDocument();
    expect(screen.getByText('1970s')).toBeInTheDocument();
    expect(screen.getByText('1980s')).toBeInTheDocument();
    expect(screen.getByText('1990s')).toBeInTheDocument();
    expect(screen.getByText('2000s')).toBeInTheDocument();
  });

  it('renders all unique decades as options with correct values', () => {
    render(
      <DecadeFilter selectedDecade="All" uniqueDecades={mockDecades} onChange={mockOnChange} />
    );

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(mockDecades.length);

    // Check that option values are the raw decade values, not formatted
    expect(options[0]).toHaveValue('All');
    expect(options[1]).toHaveValue('1960');
    expect(options[2]).toHaveValue('1970');
    expect(options[3]).toHaveValue('1980');
  });
});
