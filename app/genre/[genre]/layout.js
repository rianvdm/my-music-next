export async function generateMetadata({ params }) {
    const { genre: prettyGenre } = params;
    const genre = decodeURIComponent(prettyGenre
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
    );
  
    return {
      title: `${genre} - Genre Details`,
      description: `Details about ${genre}`,
      openGraph: {
        title: `${genre} - Genre Details`,
        description: `Details about ${genre}`,
        images: `https://file.elezea.com/listentomoregenre.png`,
      },
      twitter: {
        card: 'summary',
        title: `${genre} - Genre Details`,
        description: `Details about ${genre}`,
        images: `https://file.elezea.com/listentomoregenre.png`,
      },
    }
  }
  
  export default function Layout({ children }) {
    return children
  }