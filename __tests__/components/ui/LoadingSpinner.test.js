import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByText('Loading...');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('loading');
    expect(spinner).toHaveClass('default');
    expect(spinner).toHaveClass('medium');
  });

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Custom loading message" />);
    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });

  it('uses variant-specific default text when no custom text provided', () => {
    render(<LoadingSpinner variant="search" />);
    expect(screen.getByText('Loading recent searches...')).toBeInTheDocument();
  });

  it('renders different variants correctly', () => {
    const variants = [
      { variant: 'data', expectedText: 'Loading data...' },
      { variant: 'chart', expectedText: 'Loading chart...' },
      { variant: 'search', expectedText: 'Loading recent searches...' },
      { variant: 'collection', expectedText: 'Loading collection data...' },
      { variant: 'library', expectedText: 'Loading library data...' },
      { variant: 'recommendations', expectedText: 'Loading recommendations...' },
      { variant: 'content', expectedText: 'Loading content...' },
      { variant: 'generating', expectedText: 'Generating summary...' },
      { variant: 'tracks', expectedText: 'Loading recent tracks...' },
      { variant: 'personalities', expectedText: 'Loading personalities...' },
    ];

    variants.forEach(({ variant, expectedText }) => {
      const { unmount } = render(<LoadingSpinner variant={variant} />);
      expect(screen.getByText(expectedText)).toBeInTheDocument();
      expect(screen.getByText(expectedText)).toHaveClass(variant);
      unmount();
    });
  });

  it('applies different sizes correctly', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    expect(screen.getByText('Loading...')).toHaveClass('small');

    rerender(<LoadingSpinner size="large" />);
    expect(screen.getByText('Loading...')).toHaveClass('large');
  });

  it('shows spinner when showSpinner is true', () => {
    render(<LoadingSpinner showSpinner={true} />);
    const spinner = screen.getByText('⟳');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('spinner');
  });

  it('does not show spinner when showSpinner is false', () => {
    render(<LoadingSpinner showSpinner={false} />);
    expect(screen.queryByText('⟳')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    expect(screen.getByText('Loading...')).toHaveClass('custom-class');
  });

  it('passes through additional props', () => {
    render(<LoadingSpinner data-testid="spinner" style={{ color: 'rgb(255, 0, 0)' }} />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('renders inline variant correctly', () => {
    render(<LoadingSpinner variant="inline" />);
    const spinner = screen.getByText('Loading...');
    expect(spinner).toHaveClass('inline');
    expect(spinner).toHaveClass('loading');
  });

  it('combines all props correctly', () => {
    render(
      <LoadingSpinner
        variant="generating"
        size="large"
        showSpinner={true}
        className="extra-class"
        text="Custom generating message"
      />
    );
    const spinner = screen.getByText('Custom generating message');
    expect(spinner).toHaveClass('loading');
    expect(spinner).toHaveClass('generating');
    expect(spinner).toHaveClass('large');
    expect(spinner).toHaveClass('extra-class');
    expect(screen.getByText('⟳')).toBeInTheDocument();
  });

  it('displays correct text for different scenarios', () => {
    // Custom text overrides variant default
    render(<LoadingSpinner variant="search" text="Custom text" />);
    expect(screen.getByText('Custom text')).toBeInTheDocument();
    expect(screen.queryByText('Loading recent searches...')).not.toBeInTheDocument();
  });

  it('has correct displayName', () => {
    expect(LoadingSpinner.displayName).toBe('LoadingSpinner');
  });

  it('renders memo component correctly', () => {
    const { rerender } = render(<LoadingSpinner variant="data" />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();

    // Re-render with same props should use memoized component
    rerender(<LoadingSpinner variant="data" />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('handles empty text prop gracefully', () => {
    render(<LoadingSpinner text="" />);
    // Should fall back to default text when empty string provided
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles undefined and null text gracefully', () => {
    render(<LoadingSpinner text={undefined} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
