import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PageErrorBoundary from '../../../components/ui/PageErrorBoundary';

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockedLink = ({ children, href, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  );
  MockedLink.displayName = 'Link';
  return MockedLink;
});

// Mock console.error to avoid noise in test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Test component that throws an error
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test page error');
  }
  return <div>Page content loaded</div>;
};

describe('PageErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <PageErrorBoundary pageName="test">
        <ThrowError shouldThrow={false} />
      </PageErrorBoundary>
    );

    expect(screen.getByText('Page content loaded')).toBeInTheDocument();
  });

  it('renders page error UI when there is an error', () => {
    render(
      <PageErrorBoundary pageName="test">
        <ThrowError shouldThrow={true} />
      </PageErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/We encountered an error while loading the test page/)
    ).toBeInTheDocument();
  });

  it('renders generic error message when no pageName is provided', () => {
    render(
      <PageErrorBoundary>
        <ThrowError shouldThrow={true} />
      </PageErrorBoundary>
    );

    expect(screen.getByText(/We encountered an error while loading this page/)).toBeInTheDocument();
  });

  it('shows action buttons in error state', () => {
    render(
      <PageErrorBoundary pageName="test">
        <ThrowError shouldThrow={true} />
      </PageErrorBoundary>
    );

    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh Page' })).toBeInTheDocument();
  });

  it('shows navigation links in error state', () => {
    render(
      <PageErrorBoundary pageName="test">
        <ThrowError shouldThrow={true} />
      </PageErrorBoundary>
    );

    // Check for navigation links
    expect(screen.getByText('🏠 Home')).toBeInTheDocument();
    expect(screen.getByText('🎵 Search Albums')).toBeInTheDocument();
    expect(screen.getByText('🎤 Search Artists')).toBeInTheDocument();
    expect(screen.getByText('📀 Collection')).toBeInTheDocument();
    expect(screen.getByText('📚 Library')).toBeInTheDocument();
    expect(screen.getByText('📊 My Stats')).toBeInTheDocument();

    // Check that links have correct hrefs
    expect(screen.getByText('🏠 Home').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('🎵 Search Albums').closest('a')).toHaveAttribute('href', '/album');
    expect(screen.getByText('🎤 Search Artists').closest('a')).toHaveAttribute('href', '/artist');
  });

  it('shows technical details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <PageErrorBoundary pageName="test">
        <ThrowError shouldThrow={true} />
      </PageErrorBoundary>
    );

    expect(screen.getByText('Technical Details (Development Mode)')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('hides technical details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <PageErrorBoundary pageName="test">
        <ThrowError shouldThrow={true} />
      </PageErrorBoundary>
    );

    expect(screen.queryByText('Technical Details (Development Mode)')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('shows error icon', () => {
    render(
      <PageErrorBoundary pageName="test">
        <ThrowError shouldThrow={true} />
      </PageErrorBoundary>
    );

    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('handles click events on action buttons without throwing errors', () => {
    render(
      <PageErrorBoundary pageName="test">
        <ThrowError shouldThrow={true} />
      </PageErrorBoundary>
    );

    // Test that clicking buttons doesn't throw errors
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    }).not.toThrow();

    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Refresh Page' }));
    }).not.toThrow();
  });
});
