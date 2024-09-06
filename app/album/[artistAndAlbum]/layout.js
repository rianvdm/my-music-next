export async function generateMetadata({ params }) {
    const { artistAndAlbum } = params
    const [artist, album] = decodeURIComponent(artistAndAlbum.replace(/-/g, ' ')).split('_')
  
    // Fetch album details
    const albumResponse = await fetch(
      `https://api-lastfm-albumdetail.rian-db8.workers.dev?album=${album}&artist=${artist}`
    )
    const albumData = await albumResponse.json()
  
    return {
      title: `${albumData.name} by ${albumData.artist} - Album Details`,
      description: `Details about the album ${albumData.name} by ${albumData.artist}`,
      openGraph: {
        title: `${albumData.name} by ${albumData.artist}`,
        description: `Album details for ${albumData.name} by ${albumData.artist}`,
        images: [albumData.image],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${albumData.name} by ${albumData.artist}`,
        description: `Album details for ${albumData.name} by ${albumData.artist}`,
        images: [albumData.image],
      },
    }
  }
  
  export default function Layout({ children }) {
    return children
  }