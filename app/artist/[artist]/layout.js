export async function generateMetadata({ params }) {
  const { artist: prettyArtist } = params;
  const artist = decodeURIComponent(prettyArtist.replace(/-/g, ' '));

  // Fetch artist details
  const artistResponse = await fetch(
    `https://api-lastfm-artistdetail.rian-db8.workers.dev?artist=${artist}`
  );
  const artistData = await artistResponse.json();

  return {
    title: `${artistData.name} - Artist Details`,
    description: `Details about ${artistData.name}`,
    openGraph: {
      title: `${artistData.name} - Artist Details`,
      description: `Details about ${artistData.name}`,
      images: [artistData.image],
    },
    twitter: {
      card: 'summary',
      title: `${artistData.name} - Artist Details`,
      description: `Details about ${artistData.name}`,
      images: [artistData.image],
    },
  };
}

export default function Layout({ children }) {
  return children;
}
