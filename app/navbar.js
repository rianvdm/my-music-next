'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NavBar() {
  const [theme, setTheme] = useState('light');
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <nav style={{ ...navStyle, background: theme === 'light' ? '#fafafa' : '#121212', color: theme === 'light' ? '#FF6C00' : '#FFA500' }}>
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
        <li style={{ ...liStyle, position: 'relative' }}>
          <span 
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            style={{ 
              cursor: 'pointer', 
              color: 'var(--c-accent)',
              display: 'block',
              padding: '16px 16px 0 16px'  // Match the padding of nav links
            }}
          >
            More
          </span>
          {showMoreMenu && (
            <ul style={dropdownStyle}>
              <li style={dropdownItemStyle}>
                <Link href="/playlist-cover-generator" onClick={() => setShowMoreMenu(false)}>
                  Playlist Cover Generator
                </Link>
                </li>
                <li style={dropdownItemStyle}>
                <Link href="/library" onClick={() => setShowMoreMenu(false)}>
                  Digital Library
                </Link>
              </li>
              <li style={dropdownItemStyle}>
                <Link href="/collection/all" onClick={() => setShowMoreMenu(false)}>
                  Discogs Collection
                </Link>
              </li>              <li style={dropdownItemStyle}>
                <Link href="/collection" onClick={() => setShowMoreMenu(false)}>
                  Collection Stats
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li style={liStyle}>
          <Link href="/about">About</Link>
        </li>
        <li style={liStyle}>
          <button 
            onClick={toggleTheme}
            style={{ 
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '16px 16px 0 16px',
              color: theme === 'light' ? '#000000' : '#ffffff'  // Black in light mode, white in dark mode
            }}
          >
            ☀️/🌙
          </button>
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

        /* Dropdown styles */
        ul ul {
          position: absolute;
          top: 100%;
          left: 0;
          background-color: var(--c-bg);
          border: 1px solid var(--c-accent);
          border-radius: 4px;
          padding: 0.5em 0;
          min-width: 200px;
          z-index: 1000;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        ul ul li {
          display: block;
          margin: 0;
          padding: 0.5em 1em;
        }

        ul ul li:hover {
          background-color: rgba(var(--c-accent-rgb), 0.1);
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

const dropdownStyle = {
  position: 'absolute',
  top: '100%',
  left: '0',
  backgroundColor: 'var(--c-bg)',
  border: '1px solid var(--c-accent)',
  borderRadius: '4px',
  padding: '0.5em 0',
  minWidth: '200px',
  zIndex: 1000,
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
};

const dropdownItemStyle = {
  display: 'block',
  margin: 0,
  padding: '0.5em 1em',
};