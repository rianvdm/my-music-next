export async function generateMetadata() {
  
    return {
      title: `Playlist Cover Generator`,
      description: `Generate a custom cover image for your playlist using AI.`,
      openGraph: {
        title: `Playlist Cover Generator`,
        description: `Generate a custom cover image for your playlist using AI.`,
        images: `https://file.elezea.com/playlist_cover_generator.png`,
      },
      twitter: {
        card: 'summary',
        title: `Playlist Cover Generator`,
        description: `Generate a custom cover image for your playlist using AI.`,
        images: `https://file.elezea.com/playlist_cover_generator.png`,
      },
    }
  }
  
  export default function Layout({ children }) {
    return children
  }