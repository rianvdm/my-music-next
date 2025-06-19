// ABOUTME: Welcome section with navigation links to recommendations and random genre exploration
// ABOUTME: Displays random music facts and encourages music discovery with contextual links
'use client';

import { memo } from 'react';
import Link from 'next/link';

const WelcomeSection = memo(({ randomFact, urlGenre, displayGenre }) => {
  return (
    <section id="lastfm-stats">
      <p>
        ✨ Welcome, music traveler. If you're looking for something new to listen to, you should{' '}
        <strong>
          <Link href="/recommendations">get rec'd</Link>
        </strong>
        . Or maybe explore the history and seminal albums of a random genre like{' '}
        <strong>
          <Link href={`/genre/${urlGenre}`}>{displayGenre}</Link>
        </strong>
        .
      </p>
      <p>🧠 {randomFact}</p>
    </section>
  );
});

WelcomeSection.displayName = 'WelcomeSection';

export default WelcomeSection;
