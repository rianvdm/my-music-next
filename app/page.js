'use client';

export const runtime = 'edge';

import Link from 'next/link';
import { useRandomFact, useRandomGenre, useRecentSearches } from './hooks';
import DayGreeting from '../components/features/home/DayGreeting';
import WelcomeSection from '../components/features/home/WelcomeSection';
import AlbumSearch from '../components/features/home/AlbumSearch';
import RecentSearches from '../components/features/home/RecentSearches';

// Main component
export default function Home() {
  const randomFact = useRandomFact();
  const { urlGenre, displayGenre } = useRandomGenre();
  const { searches, isLoading: isLoadingSearches } = useRecentSearches();

  return (
    <div>
      <header>
        <DayGreeting />
      </header>
      <main>
        <WelcomeSection randomFact={randomFact} urlGenre={urlGenre} displayGenre={displayGenre} />

        <h2 style={{ marginBottom: 0, marginTop: '2em' }}>💿 Learn more about an album</h2>
        <AlbumSearch />

        <h2>👀 From the community</h2>
        <p style={{ textAlign: 'center' }}>
          <strong>
            Here are some albums that <Link href="/about">Discord Bot</Link> users recently shared
            with their friends.
          </strong>
        </p>
        <br />
        <RecentSearches searches={searches} isLoading={isLoadingSearches} />
      </main>
    </div>
  );
}
