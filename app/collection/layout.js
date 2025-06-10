export async function generateMetadata() {
  return {
    title: `Stats about my collection`,
    description: `All about that physical media.`,
    openGraph: {
      title: `Stats about my collection`,
      description: `All about that physical media.`,
      images: `https://file.elezea.com/my_collection.png`,
    },
    twitter: {
      card: 'summary',
      title: `Stats about my collection`,
      description: `All about that physical media.`,
      images: `https://file.elezea.com/my_collection.png`,
    },
  };
}

export default function Layout({ children }) {
  return children;
}
