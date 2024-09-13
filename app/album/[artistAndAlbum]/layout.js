export async function generateMetadata({ params }) {
    const { artistAndAlbum } = params;
    const [artist, album] = decodeURIComponent(artistAndAlbum.replace(/-/g, ' ')).split('_');

    // Fetch album details
    const albumResponse = await fetch(
        `https://api-lastfm-albumdetail.rian-db8.workers.dev?album=${album}&artist=${artist}`
    );
    const albumData = await albumResponse.json();

    // Construct the full URL of the current page
    const pageUrl = `https://listentomore.com/album/${params.artistAndAlbum}`;

    return {
        title: `${albumData.name} by ${albumData.artist} - Album Details`,
        description: `Details about the album ${albumData.name} by ${albumData.artist}`,
        openGraph: {
            title: `${albumData.name} by ${albumData.artist}`,
            description: `Album details for ${albumData.name} by ${albumData.artist}`,
            images: [albumData.image],
            url: pageUrl,  // Add the current page's URL
            type: 'music.album',
        },
        twitter: {
            card: 'summary',
            title: `${albumData.name} by ${albumData.artist}`,
            description: `Album details for ${albumData.name} by ${albumData.artist}`,
            images: [albumData.image],
        },
    };
}

export default function Layout({ children }) {
    return children;
}
