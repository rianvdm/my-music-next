export async function generateMetadata({ params }) {
    const { artistAndAlbum } = params;

    const parseArtistAndAlbum = (urlSegment) => {
        let parts = urlSegment.split('_');
        
        if (parts.length === 1) {
            const byIndex = urlSegment.toLowerCase().lastIndexOf('-by-');
            if (byIndex !== -1) {
                parts = [
                    urlSegment.slice(byIndex + 4),
                    urlSegment.slice(0, byIndex)
                ];
            } else {
                const hyphens = urlSegment.split('-');
                const middleIndex = Math.floor(hyphens.length / 2);
                parts = [
                    hyphens.slice(0, middleIndex).join('-'),
                    hyphens.slice(middleIndex).join('-')
                ];
            }
        }
        
        return {
            prettyArtist: parts[0] || '',
            prettyAlbum: parts[1] || parts[0]
        };
    };

    const { prettyArtist, prettyAlbum } = parseArtistAndAlbum(artistAndAlbum);
    const artist = decodeURIComponent(prettyArtist.replace(/-/g, ' '));
    const album = decodeURIComponent(prettyAlbum.replace(/-/g, ' '));

    try {
        // Fetch album details from Spotify
        const spotifyQuery = `album:${album} artist:${artist}`;
        const spotifyResponse = await fetch(
            `https://api-spotify-search.rian-db8.workers.dev/?q=${encodeURIComponent(spotifyQuery)}&type=album`
        );
        const spotifyData = await spotifyResponse.json();

        if (spotifyData.data && spotifyData.data.length > 0) {
            const spotifyAlbum = spotifyData.data[0];

            // Construct the full URL of the current page
            const pageUrl = `https://listentomore.com/album/${params.artistAndAlbum}`;

            return {
                title: `${spotifyAlbum.name} by ${spotifyAlbum.artist}`,
                description: `Streaming links and album details for ${spotifyAlbum.name} by ${spotifyAlbum.artist}. Powered by Listen To More, your home for music discovery.`,
                openGraph: {
                    title: `${spotifyAlbum.name} by ${spotifyAlbum.artist}`,
                    description: `Streaming links and album details for ${spotifyAlbum.name} by ${spotifyAlbum.artist}. Powered by Listen To More, your home for music discovery.`,
                    images: [spotifyAlbum.image],
                    url: pageUrl,
                    type: 'music.album',
                },
                twitter: {
                    card: 'summary',
                    title: `${spotifyAlbum.name} by ${spotifyAlbum.artist}`,
                    description: `Streaming links and album details for ${spotifyAlbum.name} by ${spotifyAlbum.artist}. Powered by Listen To More, your home for music discovery.`,
                    images: [spotifyAlbum.image],
                },
            };
        } else {
            throw new Error('Album not found');
        }
    } catch (error) {
        console.error('Error fetching album data:', error);

        // Return default metadata or handle error appropriately
        return {
            title: 'Album Not Found - Listen To More',
            description: 'The album you are looking for was not found.',
        };
    }
}

export default function Layout({ children }) {
    return children;
}