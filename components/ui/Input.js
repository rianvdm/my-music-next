import React, { forwardRef } from 'react';
import styles from './Input.module.css';

/**
 * Reusable Input component that supports all existing input patterns
 *
 * @param {Object} props
 * @param {string} [props.variant='default'] - Input variant: 'default', 'search', 'form', 'flex', 'expandable'
 * @param {string} [props.size='medium'] - Input size: 'small', 'medium', 'large'
 * @param {string} [props.fullWidth=false] - Whether input should take full width
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} [props.style] - Inline styles
 * @param {React.Ref} ref - Forwarded ref
 */
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
