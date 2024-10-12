'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NavBar() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(systemTheme);
    document.documentElement.setAttribute('data-theme', systemTheme);

    const themeChangeListener = (e) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      setTheme(newSystemTheme);
      document.documentElement.setAttribute('data-theme', newSystemTheme);
    };

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', themeChangeListener);

    return () => {
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
          <Link href="/collection">Collection</Link>
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
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          ul {
            justify-content: space-between;
          }

          li {
            flex: 1 0 auto;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          ul {
            justify-content: space-between;
          }

          li {
            margin: 0 0.1em; /* Reduced margin for smaller screens */
            flex: 0 0.5 auto;
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
  flexShrink: 0,
};