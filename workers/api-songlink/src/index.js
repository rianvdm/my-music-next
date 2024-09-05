export default {
    async fetch(request, env) {
        try {
            const url = new URL(request.url);
            const spotifyUrl = url.searchParams.get('url');

            // If no URL is provided, return an error
            if (!spotifyUrl) {
                return new Response('Missing "url" query parameter', {
                    status: 400,
                    headers: {
                        'Access-Control-Allow-Origin': '*', // Allow all origins
                        'Content-Type': 'application/json'
                    }
                });
            }

            // Generate a unique key for this query
            const cacheKey = `songlink:${spotifyUrl}`;
            console.log("Generated cache key:", cacheKey);

            // Check if the data is already in KV
            const cachedData = await env.SONGLINK_KV.get(cacheKey);
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

            // Encode the Spotify URL
            const encodedSpotifyUrl = encodeURIComponent(spotifyUrl);
            const apiUrl = `https://api.song.link/v1-alpha.1/links?url=${encodedSpotifyUrl}`;
            
            const response = await fetch(apiUrl);

            // If there was an error fetching from the song.link API
            if (!response.ok) {
                console.error('Error fetching data from song.link:', response.statusText);
                return new Response(response.statusText, {
                    status: 500,
                    headers: {
                        'Access-Control-Allow-Origin': '*', // Allow all origins
                        'Content-Type': 'application/json'
                    }
                });
            }

            // Get JSON body from results
            const data = await response.json();

            // Extract the pageUrl
            const pageUrl = data.pageUrl;
            const resultJson = JSON.stringify({ pageUrl });

            // Store the result in KV for future requests
            await env.SONGLINK_KV.put(cacheKey, resultJson, { expirationTtl: 30 * 24 * 60 * 60 }); // Cache for 30 days

            // Return the pageUrl
            return new Response(resultJson, {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*', // Allow all origins
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error:', error.message);
            return new Response('Internal Server Error', {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*', // Allow all origins
                    'Content-Type': 'application/json'
                }
            });
        }
    }
};