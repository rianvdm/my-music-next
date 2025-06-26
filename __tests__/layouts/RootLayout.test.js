import { render, screen } from '../utils/test-utils';
import RootLayout from '../../app/layout';
import { generateMetadata } from '../../app/layout';

// Mock Next.js components and functions
jest.mock('next/font/google', () => ({
  Inter: jest.fn(() => ({ className: 'inter-font' })),
}));

jest.mock('../../components/layout/NavBar', () => {
  return function MockNavBar() {
    return <nav data-testid="navbar">Navigation</nav>;
  };
});

jest.mock('../../components/ui/PageErrorBoundary', () => {
  return function MockPageErrorBoundary({ children, pageName }) {
    return (
      <div data-testid="error-boundary" data-page-name={pageName}>
        {children}
      </div>
    );
  };
});

jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

// Import the mocked headers function
import { headers } from 'next/headers';

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Layout Structure', () => {
    it('renders the basic layout structure', () => {
      render(
        <RootLayout>
          <div>Test Content</div>
        </RootLayout>
      );

      // Check for NavBar
      expect(screen.getByTestId('navbar')).toBeInTheDocument();

      // Check for Error Boundary
      const errorBoundary = screen.getByTestId('error-boundary');
      expect(errorBoundary).toBeInTheDocument();
      expect(errorBoundary).toHaveAttribute('data-page-name', 'application');

      // Check for children content
      expect(screen.getByText('Test Content')).toBeInTheDocument();

      // Check for footer
      expect(
        screen.getByText(/There's a fire that's been burning right outside my door/)
      ).toBeInTheDocument();
      expect(screen.getByText('Submit a bug')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('Terms')).toBeInTheDocument();
    });

    it('applies Inter font className to body', () => {
      const { container } = render(
        <RootLayout>
          <div>Test</div>
        </RootLayout>
      );

      const body = container.querySelector('body');
      expect(body).toHaveClass('inter-font');
    });

    it('includes all required meta tags', () => {
      const { container } = render(
        <RootLayout>
          <div>Test</div>
        </RootLayout>
      );

      // Check meta tags
      expect(container.querySelector('meta[charset="UTF-8"]')).toBeInTheDocument();
      expect(container.querySelector('meta[http-equiv="X-UA-Compatible"]')).toBeInTheDocument();
      expect(container.querySelector('meta[name="viewport"]')).toBeInTheDocument();
      expect(container.querySelector('meta[name="author"]')).toHaveAttribute(
        'content',
        'Rian van der Merwe'
      );

      // Check favicon links
      expect(container.querySelector('link[rel="shortcut icon"]')).toBeInTheDocument();
      expect(container.querySelector('link[rel="apple-touch-icon"]')).toBeInTheDocument();
      expect(container.querySelectorAll('link[rel="icon"][type="image/png"]')).toHaveLength(2);

      // Check social links
      const githubLink = container.querySelector(
        'link[rel="me"][href="https://github.com/rianvdm"]'
      );
      expect(githubLink).toBeInTheDocument();
      const mastodonLink = container.querySelector(
        'link[rel="me"][href="https://mastodon.social/@rianvdm"]'
      );
      expect(mastodonLink).toBeInTheDocument();
    });

    it('renders footer with correct links', () => {
      render(
        <RootLayout>
          <div>Test</div>
        </RootLayout>
      );

      // Check external link
      const fireLink = screen.getByRole('link', {
        name: /There's a fire that's been burning/,
      });
      expect(fireLink).toHaveAttribute('href', 'https://youtu.be/cNtprycno14?t=9036');
      expect(fireLink).toHaveAttribute('target', '_blank');

      // Check bug report link
      const bugLink = screen.getByRole('link', { name: /Submit a bug/ });
      expect(bugLink).toHaveAttribute('href', 'https://github.com/rianvdm/my-music-next/issues');
      expect(bugLink).toHaveAttribute('target', '_blank');

      // Check internal links
      const privacyLink = screen.getByRole('link', { name: 'Privacy' });
      expect(privacyLink).toHaveAttribute('href', '/privacy');

      const termsLink = screen.getByRole('link', { name: 'Terms' });
      expect(termsLink).toHaveAttribute('href', '/terms');
    });
  });

  describe('generateMetadata', () => {
    it('returns default metadata for non-special pages', async () => {
      headers.mockReturnValue({
        get: jest.fn(() => '/'),
      });

      const metadata = await generateMetadata();

      expect(metadata).toEqual({
        title: 'Listen To More',
        description: 'Learn some trivia, dig deep into an artist or album, find your next listen.',
        openGraph: expect.objectContaining({
          title: 'Listen To More',
          url: 'https://listentomore.com/',
          siteName: 'Listen To More',
          type: 'website',
          locale: 'en_US',
        }),
        twitter: expect.objectContaining({
          card: 'summary_large_image',
          title: 'Listen To More',
        }),
      });
    });

    it('returns empty metadata for album pages', async () => {
      headers.mockReturnValue({
        get: jest.fn(() => '/album/pink-floyd_dark-side-of-the-moon'),
      });

      const metadata = await generateMetadata();

      expect(metadata).toEqual({});
    });

    it('returns empty metadata for artist pages', async () => {
      headers.mockReturnValue({
        get: jest.fn(() => '/artist/pink-floyd'),
      });

      const metadata = await generateMetadata();

      expect(metadata).toEqual({});
    });

    it('returns empty metadata for recommendations pages', async () => {
      headers.mockReturnValue({
        get: jest.fn(() => '/recommendations'),
      });

      const metadata = await generateMetadata();

      expect(metadata).toEqual({});
    });

    it('handles missing pathname header', async () => {
      headers.mockReturnValue({
        get: jest.fn(() => null),
      });

      const metadata = await generateMetadata();

      // Should return default metadata
      expect(metadata.title).toBe('Listen To More');
    });

    it('includes correct image metadata', async () => {
      headers.mockReturnValue({
        get: jest.fn(() => '/about'),
      });

      const metadata = await generateMetadata();

      expect(metadata.openGraph.images).toEqual([
        {
          url: 'https://file.elezea.com/listen_to_more_card2.png',
          width: 1200,
          height: 630,
        },
      ]);

      expect(metadata.twitter.images).toEqual(['https://file.elezea.com/listen_to_more_card2.png']);
    });
  });

  describe('Edge Cases', () => {
    it('renders multiple children correctly', () => {
      render(
        <RootLayout>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </RootLayout>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('renders with no children', () => {
      render(<RootLayout />);

      // Should still render layout structure
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      expect(screen.getByText(/Submit a bug/)).toBeInTheDocument();
    });
  });
});
