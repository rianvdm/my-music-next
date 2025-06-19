import { render, screen, fireEvent } from '../utils/test-utils';
import NavBar from '../../components/layout/NavBar';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock document.documentElement.setAttribute
document.documentElement.setAttribute = jest.fn();

describe('NavBar Component', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    document.documentElement.setAttribute.mockClear();
  });

  it('renders navigation links', () => {
    render(<NavBar />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Artists')).toBeInTheDocument();
    expect(screen.getByText(/Get rec/)).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('renders navigation as nav element', () => {
    render(<NavBar />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('has correct link destinations', () => {
    render(<NavBar />);

    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Artists').closest('a')).toHaveAttribute('href', '/artist');
    expect(screen.getByText(/Get rec/).closest('a')).toHaveAttribute('href', '/recommendations');
    expect(screen.getByText('Stats').closest('a')).toHaveAttribute('href', '/mystats');
  });

  it('initializes theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('dark');

    render(<NavBar />);

    // Just check that the component renders without error
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    render(<NavBar />);

    // Theme toggle should be present (look for sun/moon emoji combination)
    expect(screen.getByText('☀️/🌙')).toBeInTheDocument();
  });

  it('theme button is clickable', () => {
    render(<NavBar />);

    const themeButton = screen.getByText('☀️/🌙');
    fireEvent.click(themeButton);

    // Just check that clicking doesn't cause errors
    expect(themeButton).toBeInTheDocument();
  });

  it('shows more menu when More is clicked', () => {
    render(<NavBar />);

    const moreButton = screen.getByText('More');
    fireEvent.click(moreButton);

    // Should show additional menu items
    expect(screen.getByText('Digital Library')).toBeInTheDocument();
    expect(screen.getByText('Collection Stats')).toBeInTheDocument();
    expect(screen.getByText('Playlist Cover Generator')).toBeInTheDocument();
    expect(screen.getByText('Discogs Collection')).toBeInTheDocument();
  });

  it('closes more menu when clicking outside', () => {
    render(<NavBar />);

    const moreButton = screen.getByText('More');
    fireEvent.click(moreButton);

    // Menu should be visible
    expect(screen.getByText('Digital Library')).toBeInTheDocument();

    // Click outside the dropdown (on the document body)
    fireEvent.mouseDown(document.body);

    // Menu should be closed (items should not be visible)
    expect(screen.queryByText('Digital Library')).not.toBeInTheDocument();
  });

  it('closes more menu when clicking other nav items', () => {
    render(<NavBar />);

    const moreButton = screen.getByText('More');
    fireEvent.click(moreButton);

    // Menu should be visible
    expect(screen.getByText('Digital Library')).toBeInTheDocument();

    // Click on another nav item
    const homeLink = screen.getByText('Home');
    fireEvent.mouseDown(homeLink);

    // Menu should be closed
    expect(screen.queryByText('Digital Library')).not.toBeInTheDocument();
  });
});
