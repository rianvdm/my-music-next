module.exports = {
  extends: [
    'next/core-web-vitals',
    'prettier'
  ],
  plugins: ['prettier'],
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',
    
    // React and Next.js best practices
    'react/prop-types': 'off', // We'll use TypeScript for prop validation eventually
    'react/react-in-jsx-scope': 'off', // Not needed with Next.js
    'react-hooks/exhaustive-deps': 'warn',
    
    // General JavaScript best practices
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Import organization
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
      },
    ],
    
    // Code quality
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-duplicate-imports': 'error',
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  overrides: [
    // Test files configuration
    {
      files: ['**/__tests__/**/*', '**/*.{test,spec}.{js,jsx}'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off', // Allow console in tests
      },
    },
  ],
}