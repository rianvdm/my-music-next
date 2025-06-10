export async function generateMetadata() {
  return {
    title: `Recommendations`,
    description: `Hand-picked recommendations for albums and tracks to try out.`,
    openGraph: {
      title: `Recommendations`,
      description: `Hand-picked recommendations for albums and tracks to try out.`,
      images: [
        {
          url: 'https://file.elezea.com/reco-card.png',
          width: 1200,
          height: 630,
          alt: 'Recommendation card image',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Recommendations`,
      description: `Hand-picked recommendations for albums and tracks to try out.`,
      images: `https://file.elezea.com/reco-card.png`,
    },
  };
}

export default function Layout({ children }) {
  return children;
}
