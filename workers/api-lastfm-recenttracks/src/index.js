export default {
    async fetch(request, env, ctx) {
        const apiKey = env.LASTFM_API_KEY;
        const username = env.LASTFM_USERNAME;

        // Calculate the timestamp for 7 days ago
        // const oneWeekAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);

        // Construct the API URL
        const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${encodeURIComponent(apiKey)}&limit=1&format=json`;

        try {
            // Fetch recent tracks from the last 7 days
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`Last.fm API responded with status ${response.status}`);
            }

            const data = await response.json();

            // Extract and process data
            const tracks = data.recenttracks.track || [];

            // Get the last artist (most recent track)
            const lastArtist = tracks[0]?.artist['#text'] || '';
            const lastAlbum = tracks[0]?.album['#text'] || '';

            const recentTracksInfo = {
                last_artist: lastArtist,
                last_album: lastAlbum,
            };

            return new Response(JSON.stringify(recentTracksInfo), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
    }
};