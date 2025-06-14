# Listen To More - Codebase Guide

This is a Next.js music discovery application that helps users explore albums, artists, and build their music collection. This guide provides everything needed to quickly understand and work with the codebase.

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
