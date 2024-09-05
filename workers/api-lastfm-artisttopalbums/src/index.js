export default {
    async fetch(request, env) {
        const apiKey = env.LASTFM_API_KEY;
        const url = new URL(request.url);
        const artist = url.searchParams.get('artist');

        if (!artist) {
            return new Response(JSON.stringify({ error: 'Artist name is required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        // Fetch top albums for the specified artist from Last.fm
        const topAlbumsUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${encodeURIComponent(artist)}&api_key=${encodeURIComponent(apiKey)}&limit=3&format=json`;
        const response = await fetch(topAlbumsUrl);
        const data = await response.json();

        if (data.error) {
            return new Response(JSON.stringify({ error: data.message }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        // Extract relevant album information
        const topAlbums = data.topalbums.album.map(album => ({
            name: album.name,
            playcount: album.playcount,
            url: album.url,
            image: album.image?.find(img => img.size === 'extralarge')?.['#text'] || '',
            artist: album.artist.name,
        }));

        return new Response(JSON.stringify({ artist, topAlbums }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}