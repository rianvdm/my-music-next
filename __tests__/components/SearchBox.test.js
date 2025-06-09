import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import SearchBox from '../../app/components/SearchBox'
import { mockSearchData } from '../utils/test-utils'

describe('SearchBox Component', () => {
  const mockOnSearchResults = jest.fn()

  beforeEach(() => {
    mockOnSearchResults.mockClear()
  })

  it('renders search input with correct placeholder', () => {
    render(<SearchBox data={mockSearchData} onSearchResults={mockOnSearchResults} />)
    
    expect(screen.getByPlaceholderText('Filter by artist or album title')).toBeInTheDocument()
  })

  it('filters data when user types 2 or more characters', async () => {
    render(<SearchBox data={mockSearchData} onSearchResults={mockOnSearchResults} />)
    
    const searchInput = screen.getByPlaceholderText('Filter by artist or album title')
    
    // Type less than 2 characters - should return all data
    fireEvent.change(searchInput, { target: { value: 'P' } })
    await waitFor(() => {
      expect(mockOnSearchResults).toHaveBeenCalledWith(mockSearchData)
    })

    // Type 2 or more characters - should filter
    fireEvent.change(searchInput, { target: { value: 'Pink' } })
    await waitFor(() => {
      expect(mockOnSearchResults).toHaveBeenCalledWith([mockSearchData[0]])
    })
  })

  it('shows clear search link when there is text', () => {
    render(<SearchBox data={mockSearchData} onSearchResults={mockOnSearchResults} />)
    
    const searchInput = screen.getByPlaceholderText('Filter by artist or album title')
    
    // No clear link initially
    expect(screen.queryByText('Clear search')).not.toBeInTheDocument()
    
    // Type something
    fireEvent.change(searchInput, { target: { value: 'test' } })
    
    // Clear link should appear
    expect(screen.getByText('Clear search')).toBeInTheDocument()
  })

  it('clears search when clear link is clicked', async () => {
    render(<SearchBox data={mockSearchData} onSearchResults={mockOnSearchResults} />)
    
    const searchInput = screen.getByPlaceholderText('Filter by artist or album title')
    
    // Type something
    fireEvent.change(searchInput, { target: { value: 'test' } })
    
    // Click clear
    const clearLink = screen.getByText('Clear search')
    fireEvent.click(clearLink)
    
    // Input should be empty
    expect(searchInput.value).toBe('')
    
    // Should reset to all data
    await waitFor(() => {
      expect(mockOnSearchResults).toHaveBeenCalledWith(mockSearchData)
    })
  })

  it('filters by both artist and album title', async () => {
    render(<SearchBox data={mockSearchData} onSearchResults={mockOnSearchResults} />)
    
    const searchInput = screen.getByPlaceholderText('Filter by artist or album title')
    
    // Search by artist name
    fireEvent.change(searchInput, { target: { value: 'Beatles' } })
    await waitFor(() => {
      expect(mockOnSearchResults).toHaveBeenCalledWith([mockSearchData[1]])
    })

    // Search by album title
    fireEvent.change(searchInput, { target: { value: 'Dark Side' } })
    await waitFor(() => {
      expect(mockOnSearchResults).toHaveBeenCalledWith([mockSearchData[0]])
    })
  })
})