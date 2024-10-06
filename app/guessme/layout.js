export async function generateMetadata() {
  
    return {
      title: `Guess the Musical Artist`,
      description: `See if you can figure out who I am today.`,
      openGraph: {
        title: `Guess the Musical Artist`,
        description: `See if you can figure out who I am today.`,
        images: `https://file.elezea.com/guessme.png`,
      },
      twitter: {
        card: 'summary',
        title: `Guess the Musical Artist`,
        description: `See if you can figure out who I am today.`,
        images: `https://file.elezea.com/guessme.png`,
      },
    }
  }
  
  export default function Layout({ children }) {
    return children
  }