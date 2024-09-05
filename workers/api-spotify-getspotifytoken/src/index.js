export default {
    async fetch(request, env) {
        console.log("Received request to fetch new Spotify access token.");

        const requestApiKey = request.headers.get("x-api-key");

        // If the API key is not present or does not match, return a 401 Unauthorized status code
        if (!requestApiKey || requestApiKey !== env.SPOTIFY_GET_TOKEN_SECRET) {
            console.error("Unauthorized access attempt.");
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        try {
            // Send a POST request to the Spotify API to retrieve a new access token
            const response = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Basic ${btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`
                },
                body: `grant_type=refresh_token&refresh_token=${env.SPOTIFY_REFRESH_TOKEN}`
            });

            // If the response is not successful, throw an error
            if (!response.ok) {
                console.error("Failed to fetch access token:", response.statusText);
                throw new Error(`Failed to fetch access token: ${response.statusText}`);
            }

            // Parse the response JSON and calculate expiration time
            const { access_token: new_access_token, expires_in } = await response.json();
            const expires_at = Date.now() + expires_in * 1000;

            // Store the new access token and expiration time in Workers KV
            await env.SPOTIFY_TOKENS.put("spotify_access_token", new_access_token);
            await env.SPOTIFY_TOKENS.put("spotify_expires_at", expires_at.toString());

            console.log("Successfully fetched and stored new access token.");

            return new Response(JSON.stringify({ access_token: new_access_token }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        } catch (error) {
            console.error("Error while fetching access token:", error.message);
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