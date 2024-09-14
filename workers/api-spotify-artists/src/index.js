export default {
    async fetch(request, env) {
        try {
            const url = new URL(request.url);
            const artistId = url.searchParams.get('id'); // Get the artist ID from the query parameters

            if (!artistId) {
                return new Response('Missing artist ID', {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                });
            }

            // Generate a unique cache key using the artist ID
            const cacheKey = `artist:${artistId}`;
            console.log("Generated cache key:", cacheKey);

            // Check if the artist data is already cached in KV
            const cachedData = await env.SPOTIFY_ARTISTS.get(cacheKey);
            if (cachedData) {
                console.log(`Returning cached artist data for ${cacheKey}`);
                return new Response(cachedData, {
                    status: 200,
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

            // Construct the Spotify API URL for artist details
            const apiUrl = `https://api.spotify.com/v1/artists/${artistId}`;

            // Fetch artist details from Spotify
            const response = await fetch(apiUrl, {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });

            if (!response.ok) {
                console.error(`Failed to fetch artist details: ${response.statusText}`);
                throw new Error(`Failed to fetch artist details: ${response.statusText}`);
            }

            const artistData = await response.json();
            console.log("Received artist details:", artistData);

            // Capitalize the first letter of each word in the genre
            const capitalizeWords = (phrase) =>
                phrase
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

            const capitalizedGenres = artistData.genres.map(capitalizeWords);

            // Extract relevant artist details
            const artistDetails = {
                name: artistData.name,
                genres: capitalizedGenres || [],
                followers: artistData.followers.total,
                popularity: artistData.popularity,
                url: artistData.external_urls.spotify,
                image: artistData.images[0]?.url,
            };

            const resultJson = JSON.stringify({ data: artistDetails });

            // Store the artist details in KV for future requests with a 60-day expiration
            await env.SPOTIFY_ARTISTS.put(cacheKey, resultJson, { expirationTtl: 60 * 24 * 60 * 60 }); // Cache for 60 days

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