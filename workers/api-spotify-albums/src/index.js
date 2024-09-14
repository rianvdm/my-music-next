export default {
    async fetch(request, env) {
        try {
            const url = new URL(request.url);
            const albumId = url.searchParams.get('id'); // Get the album ID from the query parameters

            if (!albumId) {
                return new Response('Missing album ID', {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            // Retrieve the access token and expiration time from KV
            let access_token = await env.SPOTIFY_TOKENS.get("spotify_access_token");
            let expires_at_str = await env.SPOTIFY_TOKENS.get("spotify_expires_at");
            let expires_at = parseInt(expires_at_str, 10);

            if (!access_token || !expires_at || Date.now() >= expires_at) {
                console.log("Access token is expired or missing. Fetching a new one.");

                // Fetch a new access token if expired or not present
                const getTokenUrl = 'https://api-spotify-getspotifytoken.rian-db8.workers.dev';
                const tokenResponse = await env.TOKEN_SERVICE.fetch(new Request(getTokenUrl, {
                    method: "GET",
                    headers: {
                        "x-api-key": env.SPOTIFY_GET_TOKEN_SECRET,
                        "Content-Type": "application/json",
                    },
                }));

                if (!tokenResponse.ok) {
                    const errorBody = await tokenResponse.text();
                    console.error("Token fetch error body:", errorBody);
                    throw new Error(`Failed to fetch access token: ${tokenResponse.statusText}. Body: ${errorBody}`);
                }

                const tokenData = await tokenResponse.json();
                access_token = tokenData.access_token;
            } else {
                console.log("Using cached access token.");
            }

            // Construct the Spotify API URL for album details
            const apiUrl = `https://api.spotify.com/v1/albums/${albumId}`;

            // Fetch album details from Spotify
            const response = await fetch(apiUrl, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });

            if (!response.ok) {
                console.error(`Failed to fetch album details: ${response.statusText}`);
                throw new Error(`Failed to fetch album details: ${response.statusText}`);
            }

            const albumData = await response.json();
            console.log("Received album details:", albumData);

            // Extract relevant details including genres
            const albumDetails = {
                name: albumData.name,
                artist: albumData.artists.map(artist => artist.name).join(', '),
                releaseDate: albumData.release_date,
                tracks: albumData.total_tracks,
                genres: albumData.genres || [], // Spotify includes genres here
                url: albumData.external_urls.spotify,
                image: albumData.images[0]?.url,
            };

            const resultJson = JSON.stringify({ data: albumDetails });

            // Return the album details including genres
            return new Response(resultJson, {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });

        } catch (error) {
            console.error("Error occurred:", error.message);
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