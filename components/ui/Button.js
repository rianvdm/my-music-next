// ABOUTME: Standardized button component with multiple variants (primary, secondary, ghost) and states (loading, disabled)
// ABOUTME: Supports different sizes (small, medium, large) and includes built-in loading state management
'use client';

import { memo } from 'react';

const Button = memo(
  ({
    children,
    onClick,
    disabled = false,
    loading = false,
    variant = 'primary',
    size = 'medium',
    type = 'button',
    style = {},
    className = '',
    ...props
  }) => {
    const buttonClasses = [
      'button',
      `button--${variant}`,
      `button--${size}`,
      loading && 'button--loading',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        className={buttonClasses}
        onClick={onClick}
        disabled={disabled || loading}
        type={type}
        style={style}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
