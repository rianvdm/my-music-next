export default {
    async fetch(request) {
        try {
            const url = new URL(request.url);
            const spotifyUrl = url.searchParams.get('url');

            // If no URL is provided, return an error
            if (!spotifyUrl) {
                return new Response('Missing "url" query parameter', {
                    status: 400
                });
            }

            // Encode the Spotify URL
            const encodedSpotifyUrl = encodeURIComponent(spotifyUrl);
            const apiUrl = `https://api.song.link/v1-alpha.1/links?url=${encodedSpotifyUrl}`;
            
            const response = await fetch(apiUrl);

            // If there was an error fetching from the song.link API
            if (!response.ok) {
                console.error('Error fetching data from song.link:', response.statusText);
                return new Response(response.statusText, {
                    status: 500
                });
            }

            // Get JSON body from results
            const data = await response.json();

            // Return the data
            return new Response(JSON.stringify(data), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error:', error.message);
            return new Response('Internal Server Error', {
                status: 500
            });
        }
    }
};