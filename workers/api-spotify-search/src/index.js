export default {
    async fetch(request, env) {
        try {
            const url = new URL(request.url);
            const query = url.searchParams.get('q');
            const dataType = url.searchParams.get('type');
            let apiUrl;

            console.log("Received request with query:", query);
            console.log("Data type:", dataType);

            if (!query || !dataType) {
                console.error("Invalid request. Missing query or data type.");
                return new Response('Invalid request. Please provide a valid data type and query.', {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            // Generate a unique key for this query and type
            const cacheKey = `${dataType}:${query}`;
            console.log("Generated cache key:", cacheKey);

            // Check if the data is already in KV
            const cachedData = await env.SPOTIFY_KV.get(cacheKey);
            if (cachedData) {
                console.log(`Returning cached data for ${cacheKey}`);
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

            // URL templates for different data types
            const urlTemplates = {
                track: (query) => `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
                album: (query) => `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=1`,
                artist: (query) => `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=1`
            };

            apiUrl = urlTemplates[dataType](query);
            console.log("Constructed API URL:", apiUrl);

            // Send a GET request to the Spotify API to search for the song/album/artist
            const response = await fetch(apiUrl, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });

            if (!response.ok) {
                console.error(`Failed to search for ${dataType}:`, response.statusText);
                throw new Error(`Failed to search for ${dataType}: ${response.statusText}`);
            }

            // Parse the response JSON
            const jsonResponse = await response.json();
            console.log("Received response from Spotify API:", jsonResponse);

            // Extract the relevant data depending on the dataType parameter
            let resultData;
            if (dataType === 'track') {
                resultData = jsonResponse.tracks.items.map(item => ({
                    title: item.name,
                    artist: item.artists.map(artist => artist.name).join(', '),
                    artistIds: item.artists.map(artist => artist.id),
                    album: item.album.name,
                    albumId: item.album.id,
                    url: item.external_urls.spotify,
                    image: item.album.images[0]?.url,
                    preview: item.preview_url,
                }));
            } else if (dataType === 'album') {
            // Attempt to get full albums first
            let fullAlbums = jsonResponse.albums.items.filter(item => item.album_type === 'album');

            if (fullAlbums.length > 0) {
                // Use full albums if available
                resultData = fullAlbums.map(item => ({
                    name: item.name,
                    id: item.id,
                    artist: item.artists.map(artist => artist.name).join(', '),
                    artistIds: item.artists.map(artist => artist.id),
                    releaseDate: item.release_date,
                    tracks: item.total_tracks,
                    url: item.external_urls.spotify,
                    image: item.images[0]?.url
                }));
            } else {
                // If no full albums, use the original list without filtering
                resultData = jsonResponse.albums.items.map(item => ({
                    name: item.name,
                    id: item.id,
                    artist: item.artists.map(artist => artist.name).join(', '),
                    artistIds: item.artists.map(artist => artist.id),
                    releaseDate: item.release_date,
                    tracks: item.total_tracks,
                    url: item.external_urls.spotify,
                    image: item.images[0]?.url
                }));
            }
            } else if (dataType === 'artist') {
                resultData = jsonResponse.artists.items.map(item => ({
                    name: item.name,
                    id: item.id,
                    url: item.external_urls.spotify,
                    image: item.images[0]?.url
                }));
            }

            const resultJson = JSON.stringify({ data: resultData });

            // Store the result in KV for future requests
            await env.SPOTIFY_KV.put(cacheKey, resultJson, { expirationTtl: 30 * 24 * 60 * 60 }); // Cache for 30 days

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