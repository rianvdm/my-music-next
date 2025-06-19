// ABOUTME: Unified input component with CSS modules that supports multiple variants (default, search, form, flex, expandable)
// ABOUTME: Handles different sizes, full-width layouts, and forwards refs for form integration
import React, { forwardRef } from 'react';
import styles from './Input.module.css';
const Input = forwardRef(
  (
    {
      variant = 'default',
      size = 'medium',
      fullWidth = false,
      className = '',
      style = {},
      ...props
    },
    ref
  ) => {
    // Build className array
    const classNames = [
      styles.input,
      styles[variant],
      styles[size],
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return <input ref={ref} type="text" {...props} className={classNames} style={style} />;
  }
);

Input.displayName = 'Input';

export default Input;
