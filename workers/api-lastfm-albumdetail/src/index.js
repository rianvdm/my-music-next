export default {
    async fetch(request, env) {
        const apiKey = env.LASTFM_API_KEY;
        const username = env.LASTFM_USERNAME;
        const url = new URL(request.url);
        const artist = url.searchParams.get('artist');
        const album = url.searchParams.get('album');

        if (!album || !artist) {
            return new Response(JSON.stringify({ error: 'Artist and album are required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        // Fetch album info from Last.fm
        const albumInfoUrl = `https://ws.audioscrobbler.com/2.0/?method=album.getInfo&album=${encodeURIComponent(album)}&artist=${encodeURIComponent(artist)}&username=${encodeURIComponent(username)}&api_key=${encodeURIComponent(apiKey)}&format=json`;
        const response = await fetch(albumInfoUrl);
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

        const albumInfo = data.album;

        // Check if tags exist and are an array, then filter out the "seen live" tag and any tag that contains a number,
        // and capitalize the first letter of each tag
        const filteredTags = Array.isArray(albumInfo.tags?.tag)
            ? albumInfo.tags.tag
                  .filter(tag => tag.name.toLowerCase() !== 'seen live' && !/\d/.test(tag.name)) // filter out any tag with a number
                  .slice(0, 3)
                  .map(tag => tag.name.charAt(0).toUpperCase() + tag.name.slice(1))
            : [];

        // Extract relevant information
        const albumDetails = {
            artist: albumInfo.artist,
            name: albumInfo.name,
            url: albumInfo.url,
            image: albumInfo.image?.find(img => img.size === 'extralarge')?.['#text'] || '',
            userplaycount: albumInfo.userplaycount || 0,
            tags: filteredTags,
            bio: albumInfo.wiki?.content || '',
        };

        return new Response(JSON.stringify(albumDetails), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}