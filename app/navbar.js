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
          flex-wrap: wrap; /* Allows items to wrap to the next line */
          justify-content: center;
          padding: 0;
          margin: 0;
          list-style: none;
        }

        li {
          margin: 0 0.5em;
          white-space: nowrap; /* Prevents text from wrapping within the item */
        }

        @media (max-width: 768px) {
          ul {
            justify-content: space-between;
          }

          li {
            flex: 1 0 auto; /* Allows items to shrink as needed but never below their content size */
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          ul {
            justify-content: center;
          }

          li {
            flex: 1 0 100%; /* Forces items to take up the full width and stack vertically on very small screens */
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
};

const linkStyle = {
  color: 'inherit',
  textDecoration: 'none',
  cursor: 'pointer',
};