import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../../components/ui/Button';

describe('Button Component', () => {
  it('renders button with correct text', () => {
    render(<Button>Search</Button>);
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('applies button class by default', () => {
    render(<Button>Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('button');
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

  it('combines custom className with button class', () => {
    render(<Button className="custom-class">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('button', 'custom-class');
  });
});
