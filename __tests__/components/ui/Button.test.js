import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../../components/ui/Button';

describe('Button Component', () => {
  it('renders button with correct text', () => {
    render(<Button>Search</Button>);
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('applies default button classes', () => {
    render(<Button>Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('button', 'button--primary', 'button--medium');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies disabled state correctly', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies custom styles', () => {
    render(<Button style={{ width: '100px' }}>Styled</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle('width: 100px');
  });

  it('passes through additional props', () => {
    render(
      <Button data-testid="custom-button" type="submit">
        Submit
      </Button>
    );
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('combines custom className with button classes', () => {
    render(<Button className="custom-class">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('button', 'button--primary', 'button--medium', 'custom-class');
  });

  describe('variants', () => {
    it('applies secondary variant class', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--secondary');
    });

    it('applies link variant class', () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--link');
    });

    it('applies icon variant class', () => {
      render(<Button variant="icon">🌙</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--icon');
    });
  });

  describe('sizes', () => {
    it('applies small size class', () => {
      render(<Button size="small">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--small');
    });

    it('applies large size class', () => {
      render(<Button size="large">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--large');
    });
  });

  describe('loading state', () => {
    it('shows loading text when loading', () => {
      render(<Button loading>Submit</Button>);
      expect(screen.getByRole('button', { name: 'Loading...' })).toBeInTheDocument();
    });

    it('applies loading class when loading', () => {
      render(<Button loading>Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('button--loading');
    });

    it('disables button when loading', () => {
      render(<Button loading>Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('does not trigger onClick when loading', () => {
      const handleClick = jest.fn();
      render(
        <Button loading onClick={handleClick}>
          Submit
        </Button>
      );

      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('type attribute', () => {
    it('defaults to button type', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('allows custom type', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });
});
