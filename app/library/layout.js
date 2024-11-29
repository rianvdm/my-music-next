export async function generateMetadata() {
  
    return {
      title: `Stats about my digital library`,
      description: `All about that digital media.`,
      openGraph: {
        title: `Stats about my digital library`,
        description: `All about that digital media.`,
        images: `https://file.elezea.com/my_collection.png`,
      },
      twitter: {
        card: 'summary',
        title: `Stats about my digital library`,
        description: `All about that digital media.`,
        images: `https://file.elezea.com/my_collection.png`,
      },
    }
  }
  
  export default function Layout({ children }) {
    return children
  }