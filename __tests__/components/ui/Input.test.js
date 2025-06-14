import React from 'react';
import { render } from '@testing-library/react';
import Input from '../../../components/ui/Input';

describe('Input Component', () => {
  it('renders with default props', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Test input" />);
    const input = getByPlaceholderText('Test input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('input');
    expect(input).toHaveClass('default');
    expect(input).toHaveClass('medium');
  });

  it('renders with search variant', () => {
    const { getByPlaceholderText } = render(<Input variant="search" placeholder="Search..." />);
    const input = getByPlaceholderText('Search...');
    expect(input).toHaveClass('search');
    expect(input).toHaveClass('input');
  });

  it('renders with flex variant', () => {
    const { getByPlaceholderText } = render(<Input variant="flex" placeholder="Flex input" />);
    const input = getByPlaceholderText('Flex input');
    expect(input).toHaveClass('flex');
    expect(input).toHaveClass('input');
  });

  it('applies size classes correctly', () => {
    const { getByPlaceholderText: getSmall } = render(<Input size="small" placeholder="Small" />);
    expect(getSmall('Small')).toHaveClass('small');

    const { getByPlaceholderText: getLarge } = render(<Input size="large" placeholder="Large" />);
    expect(getLarge('Large')).toHaveClass('large');
  });

  it('handles fullWidth prop', () => {
    const { getByPlaceholderText } = render(<Input fullWidth placeholder="Full width" />);
    expect(getByPlaceholderText('Full width')).toHaveClass('fullWidth');
  });

  it('applies form variant correctly', () => {
    const { getByPlaceholderText } = render(<Input variant="form" placeholder="Form input" />);
    const input = getByPlaceholderText('Form input');
    expect(input).toHaveClass('form');
    expect(input).toHaveClass('input');
  });

  it('applies custom className and style', () => {
    const { getByPlaceholderText } = render(
      <Input className="custom-class" style={{ marginTop: '10px' }} placeholder="Custom" />
    );
    const input = getByPlaceholderText('Custom');
    expect(input).toHaveClass('custom-class');
    expect(input).toHaveStyle({ marginTop: '10px' });
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef();
    render(<Input ref={ref} placeholder="Ref test" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('passes through other props', () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(
      <Input
        name="test-input"
        value="test value"
        onChange={onChange}
        required
        placeholder="Props test"
      />
    );
    const input = getByPlaceholderText('Props test');
    expect(input).toHaveAttribute('name', 'test-input');
    expect(input).toHaveAttribute('value', 'test value');
    expect(input).toHaveAttribute('required');
  });

  it('renders with expandable variant', () => {
    const { getByPlaceholderText } = render(
      <Input variant="expandable" placeholder="Expandable input" />
    );
    const input = getByPlaceholderText('Expandable input');
    expect(input).toHaveClass('expandable');
    expect(input).toHaveClass('input');
  });

  it('combines multiple classes correctly', () => {
    const { getByPlaceholderText } = render(
      <Input
        variant="search"
        size="large"
        fullWidth
        className="extra-class"
        placeholder="Combined"
      />
    );
    const input = getByPlaceholderText('Combined');
    expect(input).toHaveClass('input');
    expect(input).toHaveClass('search');
    expect(input).toHaveClass('large');
    expect(input).toHaveClass('fullWidth');
    expect(input).toHaveClass('extra-class');
  });
});
