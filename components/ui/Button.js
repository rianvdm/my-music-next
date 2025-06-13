'use client';

import { memo } from 'react';

const Button = memo(
  ({ children, onClick, disabled = false, style = {}, className = '', ...props }) => {
    return (
      <button
        className={`button ${className}`.trim()}
        onClick={onClick}
        disabled={disabled}
        style={style}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
