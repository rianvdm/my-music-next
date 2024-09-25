export async function generateMetadata({ params }) {
    const { genre: prettyGenre } = params;
    const genre = decodeURIComponent(prettyGenre
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase())
    );
  
    return {
      title: `${genre} - Genre Details`,
      description: `Find out more about the history, musical elements, and artists of the ${genre} genre.`,
      openGraph: {
        title: `${genre} - Genre Details`,
        description: `Find out more about the history, musical elements, and artists of the ${genre} genre.`,
        images: `https://file.elezea.com/listentomoregenre.png`,
      },
      twitter: {
        card: 'summary',
        title: `${genre} - Genre Details`,
        description: `Find out more about the history, musical elements, and artists of the ${genre} genre.`,
        images: `https://file.elezea.com/listentomoregenre.png`,
      },
    }
  }
  
  export default function Layout({ children }) {
    return children
  }