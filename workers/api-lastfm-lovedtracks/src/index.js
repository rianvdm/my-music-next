export default {
    async fetch(request, env) {
        const lastFMToken = env.LASTFM_API_KEY;
        const lastFMUser = env.LASTFM_USERNAME;

        // Hardcoded limit
        const limit = 5;

        // Construct the API URL
        const apiUrl = `http://ws.audioscrobbler.com/2.0/?method=user.getlovedtracks&user=${lastFMUser}&api_key=${lastFMToken}&format=json&limit=${limit}`;

        try {
            // Fetch the data from Last.fm API
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch data from Last.fm API: ${response.statusText}`);
            }

            // Parse the JSON response
            const data = await response.json();

            // Extract the relevant information
            const lovedTracks = data.lovedtracks?.track?.map(track => ({
                title: track.name,
                artist: track.artist?.name || '',
                dateLiked: new Date(track.date?.uts * 1000).toLocaleDateString(), // Convert Unix timestamp to date
                image: track.image?.find(img => img.size === 'extralarge')?.['#text'] || '', // Get the extralarge image
                songUrl: track.url
            })) || [];

            // Return the extracted data
            return new Response(JSON.stringify(lovedTracks), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        } catch (error) {
            // Handle errors
            console.error(`Error fetching data: ${error.message}`);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }
    }
}