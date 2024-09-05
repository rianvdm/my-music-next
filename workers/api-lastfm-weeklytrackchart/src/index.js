export default {
    async fetch(request, env, ctx) {
        const apiKey = env.LASTFM_API_KEY;
        const username = env.LASTFM_USERNAME;

        // Construct the API URL
        const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getweeklytrackchart&user=${encodeURIComponent(username)}&api_key=${encodeURIComponent(apiKey)}&format=json`;

        try {
            // Fetch weekly track chart data
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`Last.fm API responded with status ${response.status}`);
            }

            const data = await response.json();

            // Extract and process data
            const tracks = data.weeklytrackchart.track || [];

            const artistPlayCounts = {};
            let totalPlays = 0;

            tracks.forEach(track => {
                totalPlays += parseInt(track.playcount, 10);
                const artistName = track.artist && track.artist['#text'];
                const songUrl = track.url;
                
                if (artistName) {
                    // Derive the artist's URL from the song's URL
                    const artistUrl = songUrl.split('/_/')[0];

                    if (!artistPlayCounts[artistName]) {
                        artistPlayCounts[artistName] = { playcount: 0, url: artistUrl };
                    }
                    artistPlayCounts[artistName].playcount += parseInt(track.playcount, 10);
                }
            });

            // Sort artists by play count and get the top 3
            const topArtists = Object.entries(artistPlayCounts)
                .sort((a, b) => b[1].playcount - a[1].playcount)
                .slice(0, 3)
                .map(([artist, details]) => ({
                    artist,
                    playcount: details.playcount,
                    url: details.url
                }));

            const weeklyTrackChartInfo = {
                playcount: totalPlays,
                artist_count: Object.keys(artistPlayCounts).length,
                top_artists: topArtists,
            };

            return new Response(JSON.stringify(weeklyTrackChartInfo), {
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
