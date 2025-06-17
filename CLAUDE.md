# Listen To More - Codebase Guide

This is a Next.js music discovery application that helps users explore albums, artists, and build their music collection. This guide provides everything needed to quickly understand and work with the codebase.

# General instructions for completing tasks:

- Before starting implementation, provide an ELI5 explanation of what you're about to do
- Once implemented:
  - Make sure the tests pass, and the program builds/runs
  - Commit the changes to the repository with a clear commit message.
  - Explain what you did and what should now be possible. If I am able to manually test the latest change myself to make sure it works, give me instructions on how I can do that.
- Pause and wait for user review or feedback.

# Writing code

- We prefer simple, clean, maintainable solutions over clever or complex ones, even if the latter are more concise or performant. Readability and maintainability are primary concerns.
- Write code that works today but can grow tomorrow. Avoid premature optimization, but don't paint yourself into architectural corners.
- Make the smallest reasonable changes to get to the desired outcome. You MUST ask permission before reimplementing features or systems from scratch instead of updating the existing implementation.
- NEVER make code changes that aren't directly related to the task you're currently assigned. If you notice something that should be fixed but is unrelated to your current task, document it as a new item in `todo.md` with priority level (P0/P1/P2).
- Only remove comments that are demonstrably incorrect or misleading.
- All code files should start with a brief 2 line comment explaining what the file does. Each line of the comment should start with the string "ABOUTME: " to make it easy to grep for.
- When writing comments, avoid referring to temporal context about refactors or recent changes. Comments should be evergreen and describe the code as it is, not how it evolved or was recently changed.
- Handle errors gracefully with clear, actionable messages. Fail fast for programming errors, recover gracefully for user/external errors.
- Minimize external dependencies. When adding new dependencies, justify the choice and document the decision.
- Avoid mocks for core business logic, but they're acceptable for external APIs during development.
- When you are trying to fix a bug or compilation error or any other issue, YOU MUST NEVER throw away the old implementation and rewrite without explicit permission from the user. If you are going to do this, YOU MUST STOP and get explicit permission from the user.
- NEVER name things as 'improved' or 'new' or 'enhanced', etc. Code naming should be evergreen. What is new today will be "old" someday.
- Update README.md when adding new features or changing how the project works. Keep setup/usage instructions current.

# Getting help

- ALWAYS ask for clarification rather than making assumptions.
- If you're having trouble with something, it's ok to stop and ask for help. Especially if it's something your human might be better at.

# Testing

- All projects need comprehensive tests. Start with the most critical test type for the project's scope and add others as complexity grows.
- Tests MUST cover the functionality being implemented.
- NEVER ignore the output of the system or the tests - Logs and messages often contain CRITICAL information.
- TEST OUTPUT MUST BE PRISTINE TO PASS.
- If the logs are supposed to contain errors, capture and test it.

## 🎯 Project Overview

**Listen To More** is a music discovery platform that integrates with:

- **Spotify** - Album data, streaming links, artist information
- **Last.fm** - Scrobbling data, user statistics, recommendations
- **Discogs** - Collection management, release information
- **OpenAI** - AI-generated album summaries and recommendations

## 📁 Codebase Structure

### **App Pages** (`/app`)

```
/app
├── page.js                    # Home page - Recent searches, random facts
├── /album
│   ├── page.js               # Album search form
│   └── /[artistAndAlbum]     # Dynamic album detail pages
├── /artist
│   ├── page.js               # Artist search form
│   └── /[artist]             # Dynamic artist detail pages
├── /collection               # Discogs collection management
├── /library                  # Digital library/wishlist
├── /mystats                  # User listening statistics
├── /admin                    # Admin tools for personalities
├── /guessme                  # Music guessing game
└── /playlist-cover-generator # Playlist artwork tool
```

### **Component Architecture** (`/components`)

```
/components
├── /ui                       # ✅ REUSABLE UI COMPONENTS
│   ├── Button.js            # ✅ Standardized button with variants
│   ├── Input.js             # ✅ Unified input with CSS modules
│   ├── FilterDropdown.js    # ✅ Reusable dropdown filters
│   ├── LoadingSpinner.js    # ✅ Consistent loading states
│   ├── LazyImage.js         # Performance-optimized images
│   └── LazyMarkdown.js      # Lazy-loaded markdown rendering
├── /features                 # Feature-specific components
│   ├── /home               # Home page components
│   ├── /collection         # Collection-related components
│   ├── /library            # Library-specific components
│   └── /search             # Search-related components
├── /layout                   # Layout components
│   └── NavBar.js           # Main navigation
└── /charts                   # Performance-optimized charts
    └── LazyCharts.js       # Lazy-loaded chart components
```

### **Custom Hooks** (`/app/hooks`)

```
/hooks
├── index.js                 # Centralized exports
├── useRandomFact.js        # ✅ Random fact fetching
├── useRandomGenre.js       # ✅ Random genre selection
└── useRecentSearches.js    # ✅ Recent searches data
```

### **Utilities** (`/app/utils`)

```
/utils
├── slugify.js              # URL slug generation utilities
└── genres.js               # Genre definitions and mappings
```

## 🧪 Testing Infrastructure

**219 tests passing** - Comprehensive coverage across:

```
/__tests__
├── /components             # UI component tests
├── /pages                  # Page integration tests
├── /hooks                  # Custom hook tests
├── /utils                  # Utility function tests
└── /api                    # API route tests
```

**Key Testing Patterns:**

- All critical pages have comprehensive tests
- UI components tested for variants and edge cases
- Custom hooks tested in isolation
- Integration tests for user workflows

## 🎨 Styling Architecture

### **Current Approach (Mixed - Being Standardized)**

- **CSS Modules** ✅ **PREFERRED** - Used by Input, LoadingSpinner components
- **Global CSS** (`globals.css`) - Theme variables, layout classes
- **Styled-jsx** (NavBar) - ⚠️ **NEEDS MIGRATION** to CSS modules
- **Inline styles** - ⚠️ **MINIMIZE USAGE** where possible

### **Theme System**

```css
/* CSS Variables in globals.css */
:root {
  --c-bg: #fafafa; /* Background */
  --c-accent: #ff6c00; /* Accent color */
  --c-base: #000000; /* Text color */
}

[data-theme='dark'] {
  --c-bg: #121212;
  --c-accent: #ffa500;
  --c-base: #ffffff;
}
```

## 🚀 Getting Started

### **Running the Development Server**

```bash
npm run dev          # Start development server
npm test            # Run test suite
npm run build       # Production build
npm run format      # Format code with Prettier
```

### **Adding a New Page**

1. Create `page.js` in appropriate `/app` directory
2. Extract components to `/components/features/[domain]/`
3. Use existing UI components (Button, Input, etc.)
4. Add comprehensive tests
5. Follow established import patterns

### **Adding a New Component**

```javascript
// Use existing UI components as building blocks
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// For new UI components, use CSS modules pattern:
import styles from './NewComponent.module.css';
```

## 🔧 Development Guidelines

### **Component Patterns**

```javascript
// ✅ GOOD: Use existing UI components
<Button variant="primary" size="medium" onClick={handleClick}>
  Submit
</Button>

<Input variant="search" placeholder="Search albums..." />

<LoadingSpinner variant="content" showSpinner={true} />

// ✅ GOOD: CSS Modules for new components
import styles from './Component.module.css';
const MyComponent = () => <div className={styles.wrapper} />;

// ⚠️ AVOID: Inline styles (use CSS modules instead)
<div style={{ margin: '10px' }} />

// ⚠️ AVOID: Global CSS classes for component-specific styling
<div className="my-custom-class" />
```

### **Import Conventions**

```javascript
// ✅ Standard pattern across codebase
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../components/ui/Button';
import { useRandomFact } from '../hooks';
import { generateSlug } from '../utils/slugify';
```

### **Testing Patterns**

```javascript
// ✅ Component test structure
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

## 🛠️ Current State & Polish Areas

### **✅ Production Ready Areas**

- **UI Components**: Button, Input, FilterDropdown, LoadingSpinner
- **Testing Infrastructure**: Comprehensive coverage
- **Performance**: React.memo, lazy loading, optimized bundles
- **Build Pipeline**: CI/CD, pre-commit hooks, linting
- **Component Architecture**: Clean organization and patterns

### **⚠️ Areas for Gradual Improvement**

When touching these areas, consider these improvements:

#### **1. Styling Consistency (Medium Priority)**

```javascript
// CURRENT: Mixed approaches
// NavBar.js uses styled-jsx
// FilterDropdown uses global CSS classes

// IMPROVE TO: CSS Modules pattern (like Input.js)
// When touching these components, migrate to:
import styles from './Component.module.css';
```

#### **2. Error Handling (High Priority)**

```javascript
// CURRENT: Inconsistent error handling
// Some components have try/catch, others don't

// ADD: Error Boundaries when touching components
// ADD: Consistent error UI patterns
// ADD: Proper error logging
```

#### **3. Loading States (Low Priority)**

```javascript
// CURRENT: LoadingSpinner exists but not used everywhere
// Some components still have custom loading text

// IMPROVE: Use LoadingSpinner consistently
<LoadingSpinner variant="content" /> // Instead of custom text
```

#### **4. Component Extraction Opportunities**

```javascript
// When building new features, consider extracting:
// - Search patterns (multiple search boxes could be unified)
// - Error display patterns
// - Form validation patterns
```

## 📊 Performance Considerations

### **What's Already Optimized**

- **React.memo**: Applied to pure components (FilterDropdown, NavBar, etc.)
- **Lazy Loading**: Charts and markdown content load on-demand
- **useMemo**: Used for expensive calculations
- **Code Splitting**: Next.js automatic code splitting

### **When Adding New Features**

- Use `React.memo` for pure components
- Use `useMemo` for expensive computations
- Consider lazy loading for heavy components
- Minimize bundle size with dynamic imports

## 🔍 Key Files to Know

### **Entry Points**

- `/app/layout.js` - Root layout with navigation
- `/app/page.js` - Home page (main entry point)
- `/app/globals.css` - Global styles and theme variables

### **Core Utilities**

- `/app/utils/slugify.js` - URL slug generation for artists/albums
- `/app/hooks/index.js` - Custom hooks entry point

### **Configuration**

- `next.config.mjs` - Next.js configuration
- `jest.config.js` - Testing configuration
- `.eslintrc.json` - Linting rules
- `package.json` - Dependencies and scripts

## 🎯 Quick Development Checklist

### **Before Starting Work**

- [ ] Pull latest changes: `git pull`
- [ ] Install dependencies: `npm install`
- [ ] Run tests: `npm test`
- [ ] Start dev server: `npm run dev`

### **During Development**

- [ ] Use existing UI components when possible
- [ ] Follow CSS modules pattern for new components
- [ ] Add tests for new functionality
- [ ] Run tests frequently: `npm test`

### **Before Committing**

- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Code formatted: `npm run format`
- [ ] Add meaningful commit message
- [ ] Update TODO.md if implementing tracked items

## 🚀 Ready to Code!

This codebase is in excellent shape for feature development. The architecture is clean, testing is comprehensive, and patterns are established. Focus on building features using the solid foundation that's been created, and address polish items gradually as you encounter them.

**Need help?** Check TODO.md for context on current priorities and implementation status.
