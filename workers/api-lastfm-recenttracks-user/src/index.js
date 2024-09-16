export default {
    async fetch(request, env, ctx) {
        try {
            const url = new URL(request.url);
            const username = url.searchParams.get('username'); // Get 'username' from the query parameters
            const apiKey = env.LASTFM_API_KEY;

            if (!username) {
                return new Response('Username is required as a query parameter', { status: 400 });
            }

            // Construct the Last.fm API URL
            const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${encodeURIComponent(apiKey)}&limit=1&format=json`;

            // Fetch recent tracks from Last.fm API
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`Last.fm API responded with status ${response.status}`);
            }

            const data = await response.json();

            // Extract and process data
            const tracks = data.recenttracks.track || [];
            const lastArtist = tracks[0]?.artist['#text'] || '';
            const lastAlbum = tracks[0]?.album['#text'] || '';

            const recentTracksInfo = {
                last_artist: lastArtist,
                last_album: lastAlbum,
            };

            // Convert the track info to a JSON string
            const recentTracksInfoString = JSON.stringify(recentTracksInfo);

            // Return the response with the recent track info
            return new Response(recentTracksInfoString, {
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