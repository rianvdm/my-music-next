export default {
    // Handle only cron events
    async scheduled(event, env, ctx) {
        try {
            const apiKey = env.LASTFM_API_KEY;
            const username = env.LASTFM_USERNAME;

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

            // Save the recent track info in the LASTFM_LAST_TRACK KV
            await env.LASTFM_LAST_TRACK.put('lastTrack', recentTracksInfoString);

        } catch (error) {
            console.error(`Error during cron execution: ${error.message}`);
        }
    }
};