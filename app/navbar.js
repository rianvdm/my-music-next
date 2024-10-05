'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NavBar() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Detect system theme preference
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    // Set the theme based on system preference
    setTheme(systemTheme);
    document.documentElement.setAttribute('data-theme', systemTheme);

    // Listener for changes in system theme
    const themeChangeListener = (e) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setTheme(newSystemTheme);
      document.documentElement.setAttribute('data-theme', newSystemTheme);
    };

    // Add event listener for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', themeChangeListener);

    return () => {
      // Clean up event listener
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', themeChangeListener);
    };
  }, []);

  return (
    <nav style={{ ...navStyle, background: theme === 'light' ? '#ffffff' : '#000000', color: theme === 'light' ? '#FF6C00' : '#FFA500' }}>
      <ul style={ulStyle}>
        <li style={liStyle}>
          <Link href="/">Home</Link>
        </li>
        <li style={liStyle}>
          <Link href="/artist">Artists</Link>
        </li>
        <li style={liStyle}>
          <Link href="/recommendations">Get rec’d</Link>
        </li>
        <li style={liStyle}>
          <Link href="/mystats">Stats</Link>
        </li>
        <li style={liStyle}>
          <Link href="/about">About</Link>
        </li>
      </ul>

      <style jsx>{`
        ul {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          padding: 0;
          margin: 0;
          list-style: none;
        }

        li {
          margin: 0 0.5em;
          white-space: nowrap;
          flex-shrink: 0; /* Prevents the items from shrinking too much */
        }

        @media (max-width: 768px) {
          ul {
            justify-content: space-between;
          }

          li {
            flex: 1 0 auto; /* Allows items to use available space and wrap as needed */
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          ul {
            justify-content: space-between; /* Ensure items use available horizontal space */
          }

          li {
            flex: 0 0.5 auto; /* Items will wrap as needed but won't take up full width */
          }
        }
      `}</style>
    </nav>
  );
}

const navStyle = {
  padding: '1em',
  textAlign: 'center',
};

const ulStyle = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const liStyle = {
  margin: '0 0.1em',
  flexShrink: 0, // Prevents items from shrinking too much
};