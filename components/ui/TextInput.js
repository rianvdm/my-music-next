// ABOUTME: Reusable text input component with label, error handling, and accessibility features
// ABOUTME: Supports validation, required fields, disabled states, and forward refs
'use client';

import { memo, forwardRef } from 'react';

const TextInput = memo(
  forwardRef(
    (
      {
        id,
        label,
        value,
        onChange,
        placeholder,
        type = 'text',
        disabled = false,
        required = false,
        error,
        className = '',
        style = {},
        ...props
      },
      ref
    ) => {
      const inputClasses = [
        'text-input',
        error && 'text-input--error',
        disabled && 'text-input--disabled',
        className,
      ]
        .filter(Boolean)
        .join(' ');

      return (
        <div className="text-input-container" style={style}>
          {label && (
            <label htmlFor={id} className="text-input-label">
              {label}
              {required && <span className="text-input-required">*</span>}
            </label>
          )}
          <input
            ref={ref}
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={inputClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          />
          {error && (
            <span id={`${id}-error`} className="text-input-error" role="alert">
              {error}
            </span>
          )}
        </div>
      );
    }
  )
);

TextInput.displayName = 'TextInput';

export default TextInput;
