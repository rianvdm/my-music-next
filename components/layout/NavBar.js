// ABOUTME: Main navigation component with responsive menu and theme switcher
// ABOUTME: Provides site navigation links and dropdown menu for additional pages
'use client';

import { useEffect, useState, useRef, memo } from 'react';
import Link from 'next/link';
import styles from './NavBar.module.css';

function NavBar() {
  const [theme, setTheme] = useState('light');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const dropdownRef = useRef(null);
  const moreButtonRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  // Position dropdown based on button location
  useEffect(() => {
    if (showMoreMenu && moreButtonRef.current && dropdownRef.current) {
      const button = moreButtonRef.current;
      const dropdown = dropdownRef.current.querySelector(`.${styles.dropdownMenu}`);

      if (dropdown) {
        const buttonRect = button.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const dropdownWidth = 180; // Approximate dropdown width

        // Reset positioning
        dropdown.style.left = '';
        dropdown.style.right = '';
        dropdown.style.transform = '';

        // If button is in left third of screen, align dropdown to left
        if (buttonRect.left < viewportWidth / 3) {
          dropdown.style.left = '0';
        }
        // If button is in right third of screen, align dropdown to right
        else if (buttonRect.right > (viewportWidth * 2) / 3) {
          dropdown.style.right = '0';
        }
        // Otherwise center it
        else {
          dropdown.style.left = '50%';
          dropdown.style.transform = 'translateX(-50%)';
        }
      }
    }
  }, [showMoreMenu]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link href="/">Home</Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/artist">Artists</Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/recommendations">Get rec&apos;d</Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/mystats">Stats</Link>
        </li>
        <li className={`${styles.navItem} ${styles.moreDropdown}`} ref={dropdownRef}>
          <button
            ref={moreButtonRef}
            className={styles.moreButton}
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            aria-expanded={showMoreMenu}
            aria-haspopup="true"
          >
            More
          </button>
          {showMoreMenu && (
            <ul className={styles.dropdownMenu}>
              <li className={styles.dropdownItem}>
                <Link href="/playlist-cover-generator" onClick={() => setShowMoreMenu(false)}>
                  Playlist Cover Generator
                </Link>
              </li>
              <li className={styles.dropdownItem}>
                <Link href="/library" onClick={() => setShowMoreMenu(false)}>
                  Digital Library
                </Link>
              </li>
              <li className={styles.dropdownItem}>
                <Link href="/collection/all" onClick={() => setShowMoreMenu(false)}>
                  Discogs Collection
                </Link>
              </li>
              <li className={styles.dropdownItem}>
                <Link href="/collection" onClick={() => setShowMoreMenu(false)}>
                  Collection Stats
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li className={styles.navItem}>
          <Link href="/about">About</Link>
        </li>
        <li className={styles.navItem}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            ☀️/🌙
          </button>
        </li>
      </ul>
    </nav>
  );
}

NavBar.displayName = 'NavBar';

export default memo(NavBar);
