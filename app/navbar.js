'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NavBar() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

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
          <Link href="/recommendations">Get Rec'd</Link>
        </li>
        <li style={liStyle}>
          <Link href="/collection">Collection</Link>
        </li>
        <li style={liStyle}>
          <Link href="/about">About</Link>
        </li>
        <li style={liStyle}>
          <a role="button" onClick={toggleTheme} style={linkStyle}>
            {theme === 'light' ? '☀️/🌙' : '☀️/🌙'}
          </a>
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
            flex: 0 1 auto; /* Items will wrap as needed but won't take up full width */
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
  margin: '0 0.5em',
  flexShrink: 0, // Prevents items from shrinking too much
};

const linkStyle = {
  color: 'inherit',
  textDecoration: 'none',
  cursor: 'pointer',
};