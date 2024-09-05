export default {
    async fetch(request, env) {
        const apiKey = env.LASTFM_API_KEY;
        const username = env.LASTFM_USERNAME;
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

        // Fetch artist info from Last.fm
        const artistInfoUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getInfo&artist=${encodeURIComponent(artist)}&username=${encodeURIComponent(username)}&api_key=${encodeURIComponent(apiKey)}&format=json`;
        const response = await fetch(artistInfoUrl);
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

        const artistInfo = data.artist;

        // Filter out the "seen live" tag and select the top 3 tags
        const filteredTags = artistInfo.tags?.tag.filter(tag => tag.name.toLowerCase() !== 'seen live').slice(0, 3).map(tag => tag.name) || [];

        // Extract relevant information
        const artistDetails = {
            name: artistInfo.name,
            url: artistInfo.url,
            image: artistInfo.image?.find(img => img.size === 'extralarge')?.['#text'] || '',
            userplaycount: artistInfo.stats?.userplaycount || 0,
            tags: filteredTags,
            similar: artistInfo.similar?.artist.slice(0, 3).map(artist => artist.name) || [],
            bio: artistInfo.bio?.content || '',
        };

        return new Response(JSON.stringify(artistDetails), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}