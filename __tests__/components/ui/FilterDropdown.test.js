import { render, screen, fireEvent } from '@testing-library/react';
import FilterDropdown from '../../../components/ui/FilterDropdown';

describe('FilterDropdown Component', () => {
  const defaultProps = {
    label: 'Genre',
    id: 'genre-select',
    value: 'All',
    options: ['All', 'Rock', 'Jazz', 'Electronic'],
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders label and select element correctly', () => {
    render(<FilterDropdown {...defaultProps} />);

    expect(screen.getByLabelText('Genre:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All')).toBeInTheDocument();
  });

  it('renders all options correctly', () => {
    render(<FilterDropdown {...defaultProps} />);

    const select = screen.getByLabelText('Genre:');
    const options = select.querySelectorAll('option');

    expect(options).toHaveLength(4);
    expect(options[0]).toHaveTextContent('All');
    expect(options[1]).toHaveTextContent('Rock');
    expect(options[2]).toHaveTextContent('Jazz');
    expect(options[3]).toHaveTextContent('Electronic');
  });

  it('calls onChange when selection changes', () => {
    const mockOnChange = jest.fn();
    render(<FilterDropdown {...defaultProps} onChange={mockOnChange} />);

    const select = screen.getByLabelText('Genre:');
    fireEvent.change(select, { target: { value: 'Rock' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(expect.any(Object));
  });

  it('applies correct CSS classes', () => {
    render(<FilterDropdown {...defaultProps} />);

    const container = screen.getByLabelText('Genre:').closest('.filter-container');
    const select = screen.getByLabelText('Genre:');

    expect(container).toHaveClass('filter-container');
    expect(select).toHaveClass('genre-select');
  });

  it('uses correct ID for accessibility', () => {
    render(<FilterDropdown {...defaultProps} id="custom-id" />);

    const select = screen.getByLabelText('Genre:');
    expect(select).toHaveAttribute('id', 'custom-id');
  });

  it('applies formatOption function when provided', () => {
    const formatOption = option => (option === 'All' ? 'All' : `${option}s`);
    render(
      <FilterDropdown
        {...defaultProps}
        options={['All', '1990', '2000', '2010']}
        formatOption={formatOption}
      />
    );

    const select = screen.getByLabelText('Genre:');
    const options = select.querySelectorAll('option');

    expect(options[0]).toHaveTextContent('All');
    expect(options[1]).toHaveTextContent('1990s');
    expect(options[2]).toHaveTextContent('2000s');
    expect(options[3]).toHaveTextContent('2010s');
  });

  it('works without formatOption function', () => {
    render(<FilterDropdown {...defaultProps} />);

    const select = screen.getByLabelText('Genre:');
    const options = select.querySelectorAll('option');

    // Should display options as-is without formatting
    expect(options[1]).toHaveTextContent('Rock');
    expect(options[2]).toHaveTextContent('Jazz');
  });

  it('handles different label and value combinations', () => {
    render(
      <FilterDropdown
        label="Format"
        id="format-select"
        value="CD"
        options={['All', 'CD', 'Vinyl', 'Digital']}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByLabelText('Format:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('CD')).toBeInTheDocument();
  });
});
